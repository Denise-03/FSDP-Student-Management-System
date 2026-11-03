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
