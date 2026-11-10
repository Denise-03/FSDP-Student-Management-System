# Student Dashboard (React)

A student dashboard for Aikido Shinjukai, built with React and Vite.
It shows a calendar, today's classes, enrollment, attendance, payment,
training progress and upcoming events.

## What you need first

- Node.js (download the LTS version from https://nodejs.org)
- Internet connection (the icons load online)

## How to run it

1. Unzip the project folder.
2. Open a terminal inside the folder that contains package.json.
   (In VS Code: File > Open Folder, then Terminal > New Terminal)
3. Install the packages (only needed the first time):

   npm install

4. Start the website:

   npm run dev

5. Open the link shown in the terminal (usually http://localhost:5173/)
6. To stop the website, press Ctrl + C in the terminal.

## Project folder guide

- index.html            -> the page React loads into
- src/main.jsx          -> starts React
- src/App.jsx           -> main parent; remembers today's date and the clicked date
- src/data.js           -> months, class timetable and upcoming events
- src/style.css         -> all the styling
- src/components/
    - Header.jsx        -> logo, icons, event card and calendar
    - EventCard.jsx     -> "Upcoming Community Event" card
    - Calendar.jsx      -> the calendar (previous / next month, click a date)
    - Body1.jsx         -> Class Enrollment, Attendance, Today's Classes
    - Body2.jsx         -> Payment, Training Progress, Upcoming Events
    - Footer.jsx        -> free trial box and Feedback & Support
- src/pictures/         -> the logo image

## How to change things

- Class timetable and upcoming events: edit src/data.js
- Colours and layout: edit src/style.css
- Text on the cards: edit the matching file in src/components/

## Common problems

- "Missing script: dev"  -> you are in the wrong folder. Go into the folder
  that has package.json (use the cd command).
- "'vite' is not recognized" -> run npm install first.
- Icons not showing -> check your internet connection.

Author: Kenneth S10275014