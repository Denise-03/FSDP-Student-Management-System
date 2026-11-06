//Kenneth S10275014

// ---------- get the elements from the HTML ----------
let titleEl = document.getElementById("cal-title");
let daysEl = document.getElementById("cal-days");
let prevBtn = document.getElementById("cal-prev");
let nextBtn = document.getElementById("cal-next");

let months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ---------- variables to remember things ----------
let today = new Date(); // the real date right now
let viewYear = today.getFullYear(); // the month being shown on screen
let viewMonth = today.getMonth(); // 0 = January, 11 = December

// the date the user clicked (null means nothing clicked yet)
let selectedYear = null;
let selectedMonth = null;
let selectedDay = null;

// ---------- draw the calendar ----------
function showCalendar() {
  // show the title e.g. "November 2026"
  titleEl.textContent = months[viewMonth] + " " + viewYear;

  // clear the old days before drawing the new month
  daysEl.innerHTML = "";

  // which weekday does the 1st fall on? (0 = Sunday, 6 = Saturday)
  let firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

  // how many days in this month? (day 0 of next month = last day of this month)
  let daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // empty boxes so the 1st lines up under the correct weekday
  for (let i = 0; i < firstWeekday; i++) {
    let blank = document.createElement("span");
    daysEl.appendChild(blank);
  }

  // one button for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    let dayBtn = document.createElement("button");
    dayBtn.type = "button";
    dayBtn.className = "cal-day";
    dayBtn.textContent = day;

    // outline today's date
    if (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    ) {
      dayBtn.classList.add("today");
    }

    // dark circle on the date the user clicked
    if (
      day === selectedDay &&
      viewMonth === selectedMonth &&
      viewYear === selectedYear
    ) {
      dayBtn.classList.add("selected");
    }

    // when a date is clicked, remember it and draw again
    dayBtn.addEventListener("click", () => {
      selectedDay = day;
      selectedMonth = viewMonth;
      selectedYear = viewYear;
      showCalendar();
    });

    daysEl.appendChild(dayBtn);
  }
}

// ---------- previous / next month buttons ----------
prevBtn.addEventListener("click", () => {
  viewMonth = viewMonth - 1;
  if (viewMonth < 0) {
    // went back past January, so go to December of last year
    viewMonth = 11;
    viewYear = viewYear - 1;
  }
  showCalendar();
});

nextBtn.addEventListener("click", () => {
  viewMonth = viewMonth + 1;
  if (viewMonth > 11) {
    // went past December, so go to January of next year
    viewMonth = 0;
    viewYear = viewYear + 1;
  }
  showCalendar();
});

// ---------- real time ----------
// every 1 minute, check if the day has changed (e.g. after midnight)
// if yes, update "today" so the outline moves to the new date
setInterval(() => {
  let now = new Date();
  if (now.toDateString() !== today.toDateString()) {
    today = now;
    showCalendar();
  }
}, 60000);

// show the calendar when the page first loads
showCalendar();

//Kenneth S10275014 - body #1
// Card 3 shows the classes for the date picked on the calendar.
// It only READS from script.js (months, today, selectedDay...), nothing there is changed.

(function () {
  // placeholder timetable, key = weekday (0 = Sunday ... 6 = Saturday)
  // swap in your real class timings later
  let timetable = {
    2: { time: "7:30 pm", name: "Adults Aikido Class" },
    4: { time: "7:30 pm", name: "Adults Aikido Class" },
    6: { time: "3:00 pm", name: "Kids Aikido Class" },
  };

  let dateEl = document.getElementById("today-date");
  let timeEl = document.getElementById("today-time");
  let nameEl = document.getElementById("today-name");
  let venueEl = document.getElementById("today-venue");

  function showToday() {
    // use the clicked date, or today if nothing is clicked yet
    let date = today;
    if (selectedDay !== null) {
      date = new Date(selectedYear, selectedMonth, selectedDay);
    }
    //modify the date + calender if necessary
    dateEl.textContent =
      date.getDate() + " " + months[date.getMonth()].slice(0, 3).toUpperCase();

    let lesson = timetable[date.getDay()];
    if (lesson) {
      timeEl.textContent = lesson.time;
      nameEl.textContent = lesson.name;
      venueEl.textContent = "Bukit Merah Community Centre";
    } else {
      timeEl.textContent = "";
      nameEl.textContent = "No classes or events";
      venueEl.textContent = "";
    }
  }

  // when a calendar day is clicked, the calendar redraws itself first, then this runs
  document.getElementById("cal-days").addEventListener("click", showToday);

  // also check once a minute so it follows the date change at midnight
  setInterval(showToday, 60000);

  showToday();
})();
// ---------- body #2: card 3 (upcoming classes and events) ----------
(function () {
  // placeholder events, month: 0 = January ... 11 = December
  let upcoming = [
    {
      month: 10,
      day: 18,
      time: "2 pm",
      name: "Aikido Class",
      venue: "Bukit Merah Community Centre",
    },
    {
      month: 11,
      day: 2,
      time: "1 pm",
      name: "Grading Test",
      venue: "Bukit Merah Community Centre",
    },
    {
      month: 11,
      day: 16,
      time: "2 pm",
      name: "Aikido Class",
      venue: "Bukit Merah Community Centre",
    },
  ];

  let listEl = document.getElementById("upcoming-list");

  function addRow(ev) {
    let row = document.createElement("div");
    row.className = "b2-row";

    let dateBox = document.createElement("div");
    dateBox.className = "b2-date";
    let dateText = document.createElement("strong");
    dateText.textContent =
      ev.day + " " + months[ev.month].slice(0, 3).toUpperCase();
    let timeText = document.createElement("span");
    timeText.textContent = ev.time;
    dateBox.appendChild(dateText);
    dateBox.appendChild(timeText);

    let infoBox = document.createElement("div");
    infoBox.className = "b2-info";
    let nameText = document.createElement("strong");
    nameText.textContent = ev.name;
    let venueText = document.createElement("span");
    venueText.textContent = ev.venue;
    infoBox.appendChild(nameText);
    infoBox.appendChild(venueText);

    row.appendChild(dateBox);
    row.appendChild(infoBox);
    listEl.appendChild(row);
  }

  function showUpcoming() {
    listEl.innerHTML = "";

    let now = new Date();
    now.setHours(0, 0, 0, 0); // start of today
    let shown = 0;

    upcoming.forEach((ev) => {
      let evDate = new Date(now.getFullYear(), ev.month, ev.day);
      if (evDate >= now && shown < 2) {
        addRow(ev);
        shown++;
      }
    });

    if (shown === 0) {
      listEl.textContent = "No upcoming events";
    }
  }

  showUpcoming();
  setInterval(showUpcoming, 60000); // re-check every minute, so past events drop off
})();
