import EventBanner from '../components/EventBanner.jsx';

// Student portal page for the "Family Day" menu item.
// It only shows the event banner; the rest of the page is left empty on purpose.
export default function FamilyDayPage() {
  return (
    <div className="fd-portal-page">
      <EventBanner />
    </div>
  );
}
