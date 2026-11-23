import { Link } from 'react-router-dom';
import { Users, Smile, CalendarDays, MapPin } from 'lucide-react';
import { EVENT } from '../familyDayInfo.js';
import '../familyDay.css';

// The "Upcoming Community Event" card shown in the student portal.
export default function EventBanner() {
  return (
    <section className="fd-banner" aria-label="Upcoming community event">
      <div>
        <h2>Upcoming Community Event!</h2>
        <p className="fd-banner-name">{EVENT.name}</p>
        <ul className="fd-banner-facts">
          <li>
            <Users size={20} aria-hidden="true" /> Parents welcome
          </li>
          <li>
            <Smile size={20} aria-hidden="true" /> Complimentary Dinner Provided!
          </li>
          <li>
            <CalendarDays size={20} aria-hidden="true" /> {EVENT.shortPlaceholder}
          </li>
          <li>
            <MapPin size={20} aria-hidden="true" /> {EVENT.shortPlaceholder}
          </li>
        </ul>
      </div>
      <Link className="fd-banner-button" to="/family-day">
        Learn more
      </Link>
    </section>
  );
}
