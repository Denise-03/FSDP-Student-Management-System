// Kenneth S10275014
// The calendar. It remembers which month is being shown (viewYear / viewMonth).
// The clicked date is kept in App, because the "Today's Classes" card needs it too.
import { useState } from "react";
import { months } from "../data.js";

function Calendar(props) {
  // the month being shown on screen (0 = January, 11 = December)
  let [viewYear, setViewYear] = useState(props.today.getFullYear());
  let [viewMonth, setViewMonth] = useState(props.today.getMonth());

  // ---------- previous / next month buttons ----------
  function goPrev() {
    if (viewMonth === 0) {
      // went back past January, so go to December of last year
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      // went past December, so go to January of next year
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  // ---------- work out the days to draw ----------
  // which weekday does the 1st fall on? (0 = Sunday, 6 = Saturday)
  let firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

  // how many days in this month? (day 0 of next month = last day of this month)
  let daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // empty boxes so the 1st lines up under the correct weekday
  let blanks = [];
  for (let i = 0; i < firstWeekday; i++) {
    blanks.push(<span key={"blank" + i}></span>);
  }

  // one button for each day of the month
  let dayButtons = [];
  for (let day = 1; day <= daysInMonth; day++) {
    let className = "cal-day";

    // outline today's date
    if (
      day === props.today.getDate() &&
      viewMonth === props.today.getMonth() &&
      viewYear === props.today.getFullYear()
    ) {
      className = className + " today";
    }

    // dark circle on the date the user clicked
    if (
      props.selectedDate !== null &&
      day === props.selectedDate.getDate() &&
      viewMonth === props.selectedDate.getMonth() &&
      viewYear === props.selectedDate.getFullYear()
    ) {
      className = className + " selected";
    }

    dayButtons.push(
      <button
        key={day}
        type="button"
        className={className}
        onClick={() => props.setSelectedDate(new Date(viewYear, viewMonth, day))}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="calendar" id="calendar">
      <div className="cal-head">
        <button className="cal-nav" aria-label="Previous month" onClick={goPrev}>
          {"<"}
        </button>
        <span className="cal-title">{months[viewMonth] + " " + viewYear}</span>
        <button className="cal-nav" aria-label="Next month" onClick={goNext}>
          {">"}
        </button>
      </div>

      <div className="cal-grid cal-weekdays">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      <div className="cal-grid" id="cal-days">
        {blanks}
        {dayButtons}
      </div>
    </div>
  );
}

export default Calendar;
