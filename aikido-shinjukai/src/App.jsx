// Kenneth S10275014
// App is the "parent". It remembers today's date and the date the user clicked,
// then gives them to the components that need them (these are called props).
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Body1 from "./components/Body1.jsx";
import Body2 from "./components/Body2.jsx";
import Footer from "./components/Footer.jsx";

function App() {
  // the real date right now
  let [today, setToday] = useState(new Date());

  // the date the user clicked (null means nothing clicked yet)
  let [selectedDate, setSelectedDate] = useState(null);

  // every 1 minute, check if the day has changed (e.g. after midnight)
  // if yes, update "today" so the outline moves to the new date
  useEffect(() => {
    let timer = setInterval(() => {
      let now = new Date();
      if (now.toDateString() !== today.toDateString()) {
        setToday(now);
      }
    }, 60000);

    // stop the timer when the page closes
    return () => clearInterval(timer);
  }, [today]);

  return (
    <>
      <Header
        today={today}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <main>
        <Body1 today={today} selectedDate={selectedDate} />
        <Body2 today={today} />
      </main>

      <Footer />
    </>
  );
}

export default App;
