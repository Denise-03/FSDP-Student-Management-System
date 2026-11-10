// Kenneth S10275014
// All the plain data lives here, so the components stay short.

export let months = [
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

// placeholder timetable, key = weekday (0 = Sunday ... 6 = Saturday)
export let timetable = {
  2: { time: "7:30 pm", name: "Adults Aikido Class" },
  4: { time: "7:30 pm", name: "Adults Aikido Class" },
  6: { time: "3:00 pm", name: "Kids Aikido Class" },
};

// placeholder events, month: 0 = January ... 11 = December
export let upcoming = [
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
