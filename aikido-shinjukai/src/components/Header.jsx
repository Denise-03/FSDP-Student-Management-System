// Kenneth S10275014
// Header = top row (logo + event card + icons) and the calendar underneath
import logo from "../pictures/aikido_shinju_kai_logo.png";
import EventCard from "./EventCard.jsx";
import Calendar from "./Calendar.jsx";

function Header(props) {
  return (
    <header>
      {/* top row: logo + event card + icons */}
      <div className="navigate">
        <img
          src={logo}
          alt="Aikido Shinjukai logo"
          width="100"
          height="100"
          className="logo"
        />

        <EventCard />

        <div id="notifications">
          <ion-icon name="notifications-outline"></ion-icon>
        </div>
        <div id="account-setting">
          <ion-icon name="person-circle-outline"></ion-icon>
        </div>
      </div>

      {/* bottom row: calendar */}
      <Calendar
        today={props.today}
        selectedDate={props.selectedDate}
        setSelectedDate={props.setSelectedDate}
      />
    </header>
  );
}

export default Header;
