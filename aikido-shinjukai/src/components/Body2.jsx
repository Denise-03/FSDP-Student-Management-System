// Kenneth S10275014 - body #2
import { months, upcoming } from "../data.js";

function Body2(props) {
  // start of today (so an event happening today still shows)
  let startOfToday = new Date(
    props.today.getFullYear(),
    props.today.getMonth(),
    props.today.getDate()
  );

  // keep only the events that are today or later, then take the first 2
  let futureEvents = upcoming.filter((ev) => {
    let evDate = new Date(props.today.getFullYear(), ev.month, ev.day);
    return evDate >= startOfToday;
  });
  let shownEvents = futureEvents.slice(0, 2);

  return (
    <section className="body2">
      {/* Card 1: Payment */}
      <div className="b2-card">
        <h2 className="b2-title">Payment</h2>
        <ion-icon class="b2-icon" name="card-outline"></ion-icon>
        <div className="b2-line">
          <span>
            <ion-icon name="information-circle-outline"></ion-icon>
            Total amount due: <b>$0.00</b>
            <br />
            Next payment due: <b>1 Dec</b>
          </span>
        </div>
        <span className="event-tag b2-green">status: PAID</span>
        <button className="event-btn b2-btn">View Payment</button>
      </div>

      {/* Card 2: Training Progress (blue outline) */}
      <div className="b2-card b2-highlight">
        <h2 className="b2-title">Training Progress</h2>
        <ion-icon class="b2-icon" name="trending-up-outline"></ion-icon>
        <p className="b2-line">
          <ion-icon name="ribbon-outline"></ion-icon>
          Current grade: 5th Kyu
        </p>
        <span className="event-tag b2-yellow">In progress</span>
        <button className="event-btn b2-btn">View Progress</button>
      </div>

      {/* Card 3: Upcoming dates (under the calendar side) */}
      <div className="b2-card b2-upcoming">
        <h2 className="b2-title">Upcoming Classes and Events</h2>
        <div id="upcoming-list">
          {shownEvents.length === 0 && "No upcoming events"}

          {shownEvents.map((ev, index) => (
            <div className="b2-row" key={index}>
              <div className="b2-date">
                <strong>
                  {ev.day + " " + months[ev.month].slice(0, 3).toUpperCase()}
                </strong>
                <span>{ev.time}</span>
              </div>
              <div className="b2-info">
                <strong>{ev.name}</strong>
                <span>{ev.venue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Body2;
