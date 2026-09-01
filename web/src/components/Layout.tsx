import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/study", label: "Guides" },
  { to: "/flashcards", label: "Cards" },
  { to: "/practice", label: "Exam" },
];

function NavLinks({ className }: { className?: string }) {
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            isActive ? `nav-link active ${className ?? ""}`.trim() : `nav-link ${className ?? ""}`.trim()
          }
        >
          {item.label}
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
        <NavLinks className="bottom-nav-link" />
      </nav>
    </div>
  );
}
