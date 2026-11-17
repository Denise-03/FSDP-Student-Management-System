import Stripe from 'stripe';
import { query, transaction } from '../../core/config/database.js';
import { config } from '../../core/config/env.js';
import { ensure, HttpError } from '../../core/errors/HttpError.js';
import { id, audit, notify } from '../../core/utils/records.js';
import { activateMembership } from '../membership-enrolment/membershipEnrolment.service.js';
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  ensure(
    /^(sk|rk)_test_/.test(key),
    503,
    'Stripe test credentials are not configured. Hosted checkout is not verified.',
  );
  return new Stripe(key, { maxNetworkRetries: 2 });
}
export async function createCheckout(studentId, chargeId, provider) {
  const stripe = provider || stripeClient();
  const { charge, attempt } = await transaction(async (tx) => {
    const [charge] = await query(
      `SELECT * FROM fsdp_v5.PaymentCharges
      WHERE id=@id AND studentId=@studentId`,
      { id: chargeId, studentId },
      tx,
    );
    ensure(
      charge && charge.status === 'pending' && !charge.demoFixture,
      400,
      'Choose your unpaid membership charge.',
    );
    let [attempt] = await query(
      `SELECT TOP 1 * FROM fsdp_v5.PaymentAttempts
      WHERE chargeId=@id AND status IN ('creating','pending') AND demoFixture=0
      ORDER BY createdAt DESC`,
      { id: chargeId },
      tx,
    );
    if (!attempt) {
      attempt = { id: id(), chargeId, status: 'creating' };
      await query(
        "INSERT fsdp_v5.PaymentAttempts(id,chargeId,status) VALUES(@id,@chargeId,'creating')",
        attempt,
        tx,
      );
    }
    return { charge, attempt };
  });
  // Keep the Checkout integration tag stable for retries of this random attempt.
  const integrationSuffix = [...attempt.id.replaceAll('-', '').slice(0, 8)]
    .map((character) => String.fromCharCode(97 + Number.parseInt(character, 16)))
    .join('');
  try {
    let session;
    if (attempt.providerSessionId)
      session = await stripe.checkout.sessions.retrieve(attempt.providerSessionId);
    else
      session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          integration_identifier: `fsdp_membership_${integrationSuffix}`,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: charge.currency,
                unit_amount: charge.amount,
                product_data: { name: charge.description },
              },
            },
          ],
          client_reference_id: charge.id,
          metadata: { chargeId: charge.id, attemptId: attempt.id, studentId },
          ...(process.env.STRIPE_PAYMENT_CONFIGURATION
            ? {
                payment_method_configuration: process.env.STRIPE_PAYMENT_CONFIGURATION,
              }
            : {}),
          success_url: `${config.origin}/payments/result?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${config.origin}/payments/result?cancelled=1`,
        },
        { idempotencyKey: `fsdp-checkout-${attempt.id}` },
      );
    ensure(session.livemode === false, 400, 'Only Stripe test-mode Checkout is allowed.');
    await query(
      `UPDATE fsdp_v5.PaymentAttempts SET providerSessionId=@sessionId,
      status=CASE WHEN status='creating' THEN 'pending' ELSE status END WHERE id=@id`,
      { sessionId: session.id, id: attempt.id },
    );
    ensure(
      session.url,
      409,
      'This Checkout session ended. Refresh payment history before retrying.',
    );
    return { url: session.url, attemptId: attempt.id };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    // Network ambiguity keeps the same idempotency key available for a safe retry.
    throw new HttpError(
      502,
      'Checkout could not be reached. Retry safely; membership remains unpaid.',
    );
  }
}
export async function processPaymentEvent(event) {
  ensure(event.livemode === false, 400, 'Live payment events are not accepted.');
  const supported = [
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed',
    'checkout.session.expired',
  ];
  if (!supported.includes(event.type)) return { ignored: true };
  return transaction(async (tx) => {
    if (
      (
        await query(
          'SELECT id FROM fsdp_v5.WebhookEvents WHERE id=@id',
          { id: event.id },
          tx,
        )
      ).length
    )
      return { replayed: true };
    const session = event.data.object;
    const attemptId = session.metadata?.attemptId;
    const [attempt] = await query(
      `SELECT a.*,c.studentId,c.amount,c.currency,c.status chargeStatus,
      c.applicationId,c.demoFixture chargeFixture FROM fsdp_v5.PaymentAttempts a
      JOIN fsdp_v5.PaymentCharges c ON c.id=a.chargeId WHERE a.id=@id`,
      { id: attemptId || '' },
      tx,
    );
    ensure(
      attempt && !attempt.demoFixture && !attempt.chargeFixture,
      400,
      'Payment attempt is not recognised.',
    );
    ensure(
      !session.livemode &&
        session.mode === 'payment' &&
        session.currency === attempt.currency &&
        session.amount_total === attempt.amount &&
        session.metadata.chargeId === attempt.chargeId &&
        session.metadata.studentId === attempt.studentId &&
        (!attempt.providerSessionId || attempt.providerSessionId === session.id),
      400,
      'Payment reference, currency or total does not match.',
    );
    const paid =
      ['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(
        event.type,
      ) && session.payment_status === 'paid';
    const status = paid
      ? 'succeeded'
      : event.type.endsWith('expired')
        ? 'expired'
        : event.type.endsWith('failed')
          ? 'failed'
          : 'pending';
    // A late failure or expiry must never undo a confirmed payment.
    if (attempt.chargeStatus !== 'succeeded' && attempt.chargeStatus !== 'waived') {
      await query(
        `UPDATE fsdp_v5.PaymentAttempts SET status=@status,providerSessionId=@providerId
        WHERE id=@id`,
        { status, providerId: session.id, id: attempt.id },
        tx,
      );
      if (paid) {
        await query(
          "UPDATE fsdp_v5.PaymentCharges SET status='succeeded' WHERE id=@id",
          { id: attempt.chargeId },
          tx,
        );
        await activateMembership(attempt.studentId, tx);
        await notify(
          attempt.studentId,
          `payment:${attempt.chargeId}`,
          'Stripe test payment confirmed. No live funds were collected.',
          tx,
        );
      }
    }
    await query('INSERT fsdp_v5.WebhookEvents(id) VALUES(@id)', { id: event.id }, tx);
    await audit(null, 'stripe.webhook', event.id, { type: event.type, status }, tx);
    return { received: true, status };
  });
}
