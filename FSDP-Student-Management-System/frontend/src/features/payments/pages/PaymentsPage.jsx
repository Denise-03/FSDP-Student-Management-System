import { Link } from 'react-router-dom';
import { useApp } from '../../../app/providers.jsx';
import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Heading,
  Resource,
  Card,
  Action,
  Badge,
  Notice,
  Empty,
} from '../../../shared/components/ui.jsx';
import { mutate, money, dateTime } from '../../../shared/lib/api.js';
export default function PaymentsPage({ result = false }) {
  const resource = useResource('/payments');
  const { refreshUser } = useApp();
  const profile = useResource('/profile');
  return (
    <div className="section-if-public">
      <Heading title={result ? 'Your payment status.' : 'Membership & payments.'}>
        {result
          ? 'This page reads server records. Returning from Checkout does not confirm payment.'
          : 'Clear fees, trusted confirmations and your transaction history.'}
      </Heading>
      <Resource resource={profile}>
        {(p) => (
          <Card title={p.memberNumber || 'Provisional membership'}>
            <Badge>{p.membershipStatus || 'applicant'}</Badge>
            <p>
              {p.dojoName || 'No principal dojo selected'} · {p.beltName}
            </p>
          </Card>
        )}
      </Resource>
      <Resource resource={resource}>
        {(data) => (
          <>
            <Notice>
              {data.checkoutConfigured
                ? 'Stripe test Checkout is configured. Card and PayNow appear when eligible and enabled in the account.'
                : 'Hosted checkout not verified: configure a Stripe test key and signed webhook locally. Charges stay unpaid until confirmed or explicitly waived.'}
            </Notice>
            <div className="grid two">
              {data.charges.length ? (
                data.charges.map((c) => (
                  <Card title={c.description} key={c.id}>
                    <strong className="price">{money(c.amount)}</strong>
                    <p>
                      <Badge>{c.status}</Badge>
                      {c.demoFixture ? ' · Illustrative fixture' : ''}
                    </p>
                    {c.status === 'pending' && !c.demoFixture && (
                      <Action
                        className="red"
                        disabled={!data.checkoutConfigured}
                        run={() => mutate('/payments/checkout', { chargeId: c.id })}
                        onDone={(checkout) => window.location.assign(checkout.url)}
                      >
                        Continue to Stripe test Checkout →
                      </Action>
                    )}
                    {c.status === 'waived' && (
                      <p>Documented fee waiver. This is not a paid transaction.</p>
                    )}
                  </Card>
                ))
              ) : (
                <Empty>
                  No charges have been created. Complete membership review first.
                </Empty>
              )}
            </div>
            <Card title="Payment attempts">
              {data.attempts.length ? (
                data.attempts.map((a) => (
                  <div className="list-row" key={a.id}>
                    <Badge>{a.status}</Badge>
                    <p>
                      {dateTime(a.createdAt)} ·{' '}
                      {a.demoFixture
                        ? 'Illustrative fixture'
                        : a.providerSessionId || 'Checkout being created'}
                    </p>
                  </div>
                ))
              ) : (
                <Empty>No payment attempts yet.</Empty>
              )}
            </Card>
          </>
        )}
      </Resource>
      <Action
        className="secondary"
        run={async () => {
          await refreshUser();
          resource.reload();
          profile.reload();
          return { message: 'Payment status refreshed.' };
        }}
      >
        Refresh payment status
      </Action>
      <Link className="text-link" to="/enrolment/status">
        Application status →
      </Link>
    </div>
  );
}
