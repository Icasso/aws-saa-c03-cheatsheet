import { NavLink, Outlet } from "react-router-dom";
import NavIcon from "./NavIcon";

const navItems = [
  { to: "/", label: "Home", icon: "home" as const, end: true },
  { to: "/study", label: "Guides", icon: "guides" as const },
  { to: "/flashcards", label: "Cards", icon: "cards" as const },
  { to: "/practice", label: "Exam", icon: "exam" as const },
];

function NavLinks({ mobile }: { mobile?: boolean }) {
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            isActive
              ? `nav-link active${mobile ? " bottom-nav-link" : ""}`
              : `nav-link${mobile ? " bottom-nav-link" : ""}`
          }
        >
          {mobile && <NavIcon name={item.icon} />}
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </>
  );
}

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">SAA</span>
          <strong>SAA-C03</strong>
        </div>
        <nav className="nav nav-desktop" aria-label="Main navigation">
          <NavLinks />
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <NavLinks mobile />
      </nav>
    </div>
  );
}
