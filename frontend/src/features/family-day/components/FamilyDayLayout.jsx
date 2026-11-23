import { Link } from 'react-router-dom';
import { ChevronRight, Users } from 'lucide-react';
import { EVENT } from '../familyDayInfo.js';
import EventSidePanel from './EventSidePanel.jsx';
import '../familyDay.css';

export const LOGO_SRC = '/assets/brand/aikido-shinju-kai-logo.png';

export function ContactStrip() {
  return (
    <div className="fd-contact">
      <strong>A question about Family Day?</strong>
      <span>
        {EVENT.contactEmail} · {EVENT.contactPhone}
      </span>
    </div>
  );
}

// Page frame for the register, thank-you, manage and withdrawn pages.
export default function FamilyDayLayout({ current, title, intro, children }) {
  return (
    <div className="fd-page">
      <header className="fd-header">
        <div className="fd-header-inner">
          <img src={LOGO_SRC} alt="Aikido Shinju-Kai logo" width="80" height="80" />
          <div>
            <small>{EVENT.label.toUpperCase()}</small>
            <p className="fd-header-title">{EVENT.name}</p>
            <p className="fd-header-tagline">{EVENT.tagline}</p>
          </div>
          <span className="fd-header-icon" aria-hidden="true">
            <Users size={20} />
          </span>
        </div>
      </header>
      <div className="fd-container">
        <nav className="fd-crumbs" aria-label="Breadcrumb">
          <Link to="/family-day">Family Day</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{current}</span>
        </nav>
        <h1 className="fd-title">{title}</h1>
        {intro && <p className="fd-intro">{intro}</p>}
        <div className="fd-columns">
          <div>{children}</div>
          <EventSidePanel />
        </div>
      </div>
      <ContactStrip />
    </div>
  );
}
