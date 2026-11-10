// Kenneth S10275014 - body #1
// Card 3 shows the classes for the date picked on the calendar.
import { months, timetable } from "../data.js";

function Body1(props) {
  // use the clicked date, or today if nothing is clicked yet
  let date = props.today;
  if (props.selectedDate !== null) {
    date = props.selectedDate;
  }

  let dateText =
    date.getDate() + " " + months[date.getMonth()].slice(0, 3).toUpperCase();

  // find the class for that weekday (undefined if there is none)
  let lesson = timetable[date.getDay()];

  let timeText = "";
  let nameText = "No classes or events";
  let venueText = "";
  if (lesson) {
    timeText = lesson.time;
    nameText = lesson.name;
    venueText = "Bukit Merah Community Centre";
  }

  return (
    <main className="body1">
      {/* Card 1: Class Enrollment */}
      <section className="b1-card">
        <h2 className="b1-title">Class Enrollment</h2>
        <ion-icon class="b1-icon" name="people"></ion-icon>
        <p className="b1-line">
          <ion-icon name="location"></ion-icon>
          Bukit Merah Community Centre
        </p>
        <span className="event-tag b1-tag b1-green">status: ACTIVE</span>
        <button
          className="event-btn b1-btn"
          onClick={() => {
          window.location.href = "/my-training-schedule.html";
        }}
>
  View Enrollment
</button>
      </section>

      {/* Card 2: Attendance */}
      <section className="b1-card">
        <h2 className="b1-title">Attendance</h2>
        <ion-icon class="b1-icon" name="calendar-outline"></ion-icon>
        <p className="b1-line">
          <ion-icon name="alert-circle-outline"></ion-icon>
          2 lessons missed this month
        </p>
        <span className="event-tag b1-tag b1-yellow">
          Attendace: <b style={{ fontSize: "12px" }}>87%</b>
        </span>
        <button className="event-btn b1-btn">View Attendance</button>
      </section>

      {/* Card 3: Today's Classes and Events (sits under the calendar) */}
      <section className="b1-card b1-today" id="today-card">
        <h2 className="b1-title">Today's Classes and Events</h2>
        <div className="b1-today-row">
          <div className="b1-date">
            <strong>{dateText}</strong>
            <span>{timeText}</span>
          </div>
          <div className="b1-info">
            <strong>{nameText}</strong>
            <span>{venueText}</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Body1;
