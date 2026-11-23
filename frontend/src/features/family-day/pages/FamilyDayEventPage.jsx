import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { EVENT, EXPECTATIONS } from '../familyDayInfo.js';
import { ContactStrip, LOGO_SRC } from '../components/FamilyDayLayout.jsx';
import '../familyDay.css';

const DETAIL_CARDS = [
  {
    icon: CalendarDays,
    label: 'Date',
    value: EVENT.date,
    note: 'We’ll share the confirmed date as soon as it’s set.',
  },
  {
    icon: Clock,
    label: 'Time',
    value: EVENT.time,
    note: 'Full schedule details will be published closer to the event.',
  },
  {
    icon: MapPin,
    label: 'Venue',
    value: EVENT.venue,
    note: 'Location details will be confirmed and shared with all registrants.',
  },
];

// Event landing page (opened from "Learn more").
export default function FamilyDayEventPage() {
  return (
    <div className="fd-page fd-landing">
      <header className="fd-hero">
        <img src={LOGO_SRC} alt="Aikido Shinju-Kai logo" width="90" height="90" />
        <span className="fd-pill">{EVENT.label.toUpperCase()}</span>
        <h1>{EVENT.name}</h1>
        <p>{EVENT.tagline}</p>
      </header>

      <div className="fd-landing-body">
        <section className="fd-container fd-intro-block">
          <p className="fd-lead">{EVENT.intro}</p>
        </section>

        <section className="fd-container" aria-labelledby="fd-details-heading">
          <h2 className="fd-section-label" id="fd-details-heading">
            Event details
          </h2>
          <div className="fd-card-grid fd-card-grid-3">
            {DETAIL_CARDS.map(({ icon: Icon, label, value, note }) => (
              <article className="fd-detail-card" key={label}>
                <span className="fd-icon-box">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <small>{label}</small>
                <h3>{value}</h3>
                <p>{note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fd-container" aria-labelledby="fd-expect-heading">
          <h2 className="fd-section-label" id="fd-expect-heading">
            What to expect
          </h2>
          <div className="fd-card-grid fd-card-grid-4">
            {EXPECTATIONS.map(({ icon: Icon, title, text }) => (
              <article className="fd-expect-card" key={title}>
                <Icon size={22} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="fd-cta">
        <h2>Register your family’s interest</h2>
        <p>This is not a confirmed booking. We’ll email you when the event details are announced.</p>
        <Link className="fd-btn fd-btn-white" to="/family-day/register">
          REGISTER INTEREST
        </Link>
      </section>
      <ContactStrip />
    </div>
  );
}
