import { Router, raw } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { query } from '../../core/config/database.js';
import { memberRoles } from '../../core/middleware/auth.js';
import { ensure } from '../../core/errors/HttpError.js';
import { createCheckout, processPaymentEvent } from './payments.service.js';
export const paymentsRouter = Router();
export async function paymentWebhook(req, res) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  ensure(secret, 503, 'Stripe test webhook secret is not configured.');
  let event;
  try {
    event = Stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'), secret);
  } catch {
    return res.status(400).json({ message: 'Invalid webhook signature.' });
  }
  res.json(await processPaymentEvent(event));
}
paymentsRouter.use(memberRoles);
paymentsRouter.get('/', async (req, res) => {
  const charges = await query('SELECT * FROM fsdp_v5.PaymentCharges WHERE studentId=@id', {
    id: req.user.id,
  });
  const attempts = await query(
    `SELECT a.* FROM fsdp_v5.PaymentAttempts a
    JOIN fsdp_v5.PaymentCharges c ON c.id=a.chargeId WHERE c.studentId=@id
    ORDER BY a.createdAt DESC`,
    { id: req.user.id },
  );
  res.json({
    charges,
    attempts,
    checkoutConfigured:
      /^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY || '') &&
      Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  });
});
paymentsRouter.post('/checkout', async (req, res) => {
  const { chargeId } = z.object({ chargeId: z.string().max(50) }).parse(req.body);
  ensure(
    process.env.STRIPE_WEBHOOK_SECRET,
    503,
    'Configure the signed test webhook before starting Checkout.',
  );
  res.json(await createCheckout(req.user.id, chargeId));
});
