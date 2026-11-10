// Kenneth S10275014
// The "Upcoming Community Event" card in the header
function EventCard() {
  return (
    <div className="event-card">
      <div className="event-info">
        <p className="event-label">UPCOMING COMMUNITY EVENT!</p>
        <h3 className="event-title">Aikido Shinjukai Family Day</h3>
        <div className="event-tags">
          <span className="event-tag">✔ Parents welcome</span>
          <span className="event-tag">✔ Complimentary dinner provided</span>
          <span className="event-tag">Date: TBA</span>
          <span className="event-tag">Time: TBA</span>
        </div>
      </div>
      <button className="event-btn">Learn more</button>
    </div>
  );
}

export default EventCard;
