import { CalendarDays, Clock, MapPin, Smile } from 'lucide-react';
import { EVENT, EXPECTATIONS } from '../familyDayInfo.js';

// Right-hand column shared by the register, thank-you and manage pages.
export default function EventSidePanel() {
  const details = [
    [CalendarDays, 'Date', EVENT.date],
    [Clock, 'Time', EVENT.time],
    [MapPin, 'Venue', EVENT.venue],
  ];
  return (
    <aside className="fd-side">
      <section className="fd-side-card">
        <h2>A day for our Aikido family</h2>
        <p className="fd-side-label">{EVENT.label}</p>
        <ul className="fd-side-details">
          {details.map(([Icon, label, value]) => (
            <li key={label}>
              <span className="fd-icon-box">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>
                <small>{label}</small>
                <strong>{value}</strong>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="fd-side-dark">
        <h2>
          <Smile size={20} aria-hidden="true" /> What to expect
        </h2>
        <ul>
          {EXPECTATIONS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon size={18} aria-hidden="true" />
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <p className="fd-side-note">
        Details are still being planned. Express your interest now; decide about attendance
        when more information is available.
      </p>
    </aside>
  );
}
