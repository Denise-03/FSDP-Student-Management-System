import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Menu, ArrowUpRight, LogOut, LayoutDashboard } from "lucide-react";
import { useApp, roleHome } from "../../app/providers.jsx";
import { mutate } from "../lib/api.js";
const publicLinks = [
  ["Classes", "/classes"],
  ["Our dojos", "/dojos"],
  ["About Aikido", "/about"],
  ["Grading", "/grading-info"],
  ["Fees", "/fees"],
];
const studentLinks = [
  ["Overview", "/student"],
  ["Book a class", "/student/classes"],
  ["My bookings", "/student/bookings"],
  ["Attendance", "/student/attendance"],
  ["Grading readiness", "/student/grading-readiness"],
  ["Grading applications", "/student/grading-applications"],
  ["Notifications", "/student/notifications"],
  ["Membership & payments", "/student/membership"],
  ["My profile", "/student/profile"],
  ["Family Day", "/student/family-day"],
];
const instructorLinks = [
  ["Overview", "/instructor"],
  ["Student progress", "/instructor/students"],
  ["Grading assessments", "/instructor/assessments"],
];
const adminLinks = [
  ["Overview", "/admin"],
  ["Application reviews", "/admin/enrolments"],
  ["Member directory", "/admin/members"],
  ["Centre reports", "/admin/reports"],
  ["Classes & settings", "/admin/manage"],
  ["Payment overview", "/admin/payments"],
];
export default function SiteLayout() {
  const { user, updateUser } = useApp();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const portal = /^\/(student|instructor|admin)/.test(location.pathname);
  const links =
    user?.role === "admin"
      ? adminLinks
      : user?.role === "instructor"
        ? instructorLinks
        : studentLinks;
  async function logout() {
    try {
      await mutate("/auth/logout", {});
      updateUser(null);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <div className="demo-strip">
        FSDP ASSIGNMENT PROTOTYPE · Fictional records & demo fees · Stripe test
        mode only
      </div>
      <header className="site-header">
        <Link className="brand" to="/">
          <span>
            <strong>AIKIDO SHINJU-KAI</strong>
            <small>TRAIN. CONNECT. GROW.</small>
          </span>
        </Link>
        <nav
          aria-label="Public navigation"
          className={`public-nav ${open ? "open" : ""}`}
        >
          {publicLinks.map(([label, path]) => (
            <NavLink key={path} to={path} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link className="button secondary" to={roleHome(user)}>
                <LayoutDashboard size={16} />
                <span>My portal</span>
              </Link>
              <button
                className="icon-button"
                title="Sign out"
                aria-label="Sign out"
                onClick={logout}
              >
                <LogOut size={19} />
              </button>
            </>
          ) : (
            <>
              <Link className="signin" to="/login">
                Sign in
              </Link>
              <Link className="button red" to="/how-to-join">
                Join us <ArrowUpRight size={16} />
              </Link>
            </>
          )}
          <button
            className="icon-button menu"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Menu />
          </button>
        </div>
      </header>
      {error && <p role="alert">{error}</p>}
      <div className={portal ? "portal-shell" : ""}>
        {portal && (
          <aside className="sidebar">
            <span className="eyebrow">{user?.role || "YOUR"} PORTAL</span>
            <p className="sidebar-name">{user?.name}</p>
            <nav aria-label="Portal navigation">
              {links.map(([label, path]) => (
                <NavLink
                  end={
                    path === "/student" ||
                    path === "/instructor" ||
                    path === "/admin"
                  }
                  key={path}
                  to={path}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}
        <main
          id="main"
          className={portal ? "portal-main" : ""}
          key={location.pathname}
        >
          <Outlet />
        </main>
      </div>
      <footer className="footer">
        <div className="row spread">
          <strong>Aikido Shinju-Kai</strong>
          <Link to="/how-to-join">Start your journey →</Link>
        </div>
        <p>
          Independent coursework prototype. Centres, schedules, prices and
          grading rules shown here are demonstration data.
        </p>
        <p>
          Illustrative Aikido training photograph: Ignat Gorazd, CC BY-SA 2.0.
          Display crop only. Not ASK members. Official logo permission pending;
          text wordmark used.{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Aikido_open_lesson_for_kids;_August_2014_(02).jpg"
            target="_blank"
            rel="noreferrer"
          >
            Photo source
          </a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/2.0/"
            target="_blank"
            rel="noreferrer"
          >
            Image licence
          </a>
        </p>
      </footer>
    </>
  );
}
