import { Link } from 'react-router-dom';
import { useApp } from '../../../app/providers.jsx';
import { Card, Heading, Resource, Badge } from '../../../shared/components/ui.jsx';
import { money } from '../../../shared/lib/api.js';
export function AboutPage() {
  const { catalogue } = useApp();
  return (
    <div className="section">
      <Heading title="A practice of connection.">Movement. Awareness. Respect.</Heading>
      <div className="grid two">
        <figure className="about-photo">
          <img
            src="/assets/photos/aikido-training.jpg"
            alt="Illustrative Aikido training in Japan, by Ignat Gorazd; not ASK members"
          />
          <figcaption>
            Aikido training in Japan. Ignat Gorazd, CC BY-SA 2.0. Not ASK members.
          </figcaption>
        </figure>
        <Card title="Discover Aikido">
          <Resource resource={catalogue}>
            {(data) => (
              <>
                <p>{data.settings.find((s) => s.id === 'about')?.value}</p>
                <p>
                  The official ASK website describes its establishment in 1988 and
                  recognition by Aikido World Headquarters in Japan.
                </p>
                <a
                  className="text-link"
                  href={data.settings.find((s) => s.id === 'source')?.value}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit the official organisation website →
                </a>
              </>
            )}
          </Resource>
          <p>
            Our proposed student portal brings your membership, training and next milestone
            together.
          </p>
          <Link className="button" to="/classes">
            Find your class
          </Link>
        </Card>
      </div>
    </div>
  );
}
export function GradingInfoPage() {
  const { catalogue } = useApp();
  return (
    <div className="section">
      <Heading title="Progress with purpose.">
        Readiness is a milestone on your journey. Eligibility does not award a new belt.
      </Heading>
      <Resource resource={catalogue}>
        {(data) => (
          <>
            <div className="belt-track">
              {data.belts.map((b) => (
                <Card key={b.id}>
                  <span className={`belt belt-${b.id}`} />
                  <h3>{b.name}</h3>
                </Card>
              ))}
            </div>
            <Card title="How this demonstration calculates readiness">
              <p>
                Your verified rank, qualifying training, age, membership and time in rank
                are checked on the server.
              </p>
              {data.rules.map((rule) => (
                <p key={rule.id}>
                  <Badge>{rule.label}</Badge>{' '}
                  {data.belts.find((b) => b.id === rule.fromBelt)?.name} - {' '}
                  {data.belts.find((b) => b.id === rule.toBelt)?.name}: {rule.minMonths}{' '}
                  months and {rule.minSessions} sessions.
                </p>
              ))}
              <p>
                These reduced thresholds are synthetic. Confirm official requirements with
                your instructor.
              </p>
            </Card>
          </>
        )}
      </Resource>
    </div>
  );
}
export function FeesPage() {
  const { catalogue } = useApp();
  return (
    <div className="section">
      <Heading title="A clear start to your journey.">
        Demonstration prices for this assignment. These are not official ASK fees.
      </Heading>
      <Resource resource={catalogue}>
        {(data) => (
          <div className="grid two">
            {data.settings
              .filter((s) => s.id.endsWith('_fee'))
              .map((item) => (
                <Card key={item.id} title={item.label}>
                  <strong className="price">{money(Number(item.value))}</strong>
                  <p>
                    {item.id === 'registration_fee'
                      ? 'Charged after approval and before membership activation.'
                      : 'Illustrative training price; recurring billing is not implemented.'}
                  </p>
                  <p>
                    Checkout uses SGD one-time test payments. Eligible Card and PayNow
                    methods are presented by Stripe.
                  </p>
                  <Link className="button red" to="/how-to-join">
                    Apply for membership
                  </Link>
                </Card>
              ))}
          </div>
        )}
      </Resource>
    </div>
  );
}
export function HowToJoinPage() {
  const { catalogue } = useApp();
  return (
    <div className="section">
      <Heading title="Your first step starts here.">
        From discovering a class to your first training session.
      </Heading>
      <Resource resource={catalogue}>
        {(data) => (
          <>
            <div className="grid three">
              {[
                'Find a suitable class',
                'Create your account',
                'Complete your application',
                'Approval, then payment',
                'Book and begin training',
              ].map((step, index) => (
                <Card title={step} key={step}>
                  <span className="step-number">0{index + 1}</span>
                  <p>
                    {
                      [
                        'Browse upcoming sessions and choose a centre.',
                        'Your account begins as an applicant profile.',
                        'Choose your principal dojo, describe experience and acknowledge the demo waiver.',
                        'An administrator reviews your application. Membership activates after confirmed payment or a documented fee waiver.',
                        'An assigned instructor verifies each attendance record.',
                      ][index]
                    }
                  </p>
                </Card>
              ))}
            </div>
            <p>
              Choose from {data.dojos.length} active demonstration centres. Optional
              evidence must be synthetic or redacted.
            </p>
            <Link className="button red" to="/register">
              Create account →
            </Link>
          </>
        )}
      </Resource>
    </div>
  );
}
