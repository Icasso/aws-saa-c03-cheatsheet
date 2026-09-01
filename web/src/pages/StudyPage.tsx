import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import content from "../data/content.json";
import type { AppContent } from "../types";
import MarkdownView from "../components/MarkdownView";

const data = content as AppContent;

export default function StudyPage() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const guides = useMemo(
    () => [...data.studyGuides].sort((a, b) => a.order - b.order),
    []
  );

  const activeGuide = guides.find((g) => g.id === guideId) ?? guides[0];

  const filteredGuides = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page study-page">
      <div className="study-mobile-picker">
        <label className="sr-only" htmlFor="guide-select">
          Choose study guide
        </label>
        <select
          id="guide-select"
          className="guide-select"
          value={activeGuide?.id ?? ""}
          onChange={(e) => navigate(`/study/${e.target.value}`)}
        >
          {guides.map((guide) => (
            <option key={guide.id} value={guide.id}>
              {guide.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-secondary guide-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? "Hide list" : "All guides"}
        </button>
      </div>

      <aside className={`study-sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2>Study Guides</h2>
        <input
          className="search-input"
          placeholder="Search guides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="guide-list">
          {filteredGuides.map((guide) => (
            <li key={guide.id}>
              <Link
                to={`/study/${guide.id}`}
                className={guide.id === activeGuide?.id ? "guide-link active" : "guide-link"}
                onClick={() => setSidebarOpen(false)}
              >
                {guide.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <section className="study-content">
        {activeGuide ? (
          <>
            <header className="study-header">
              <h1>{activeGuide.title}</h1>
              <span className="badge">{activeGuide.filename}</span>
            </header>
            <MarkdownView content={activeGuide.content} />
          </>
        ) : (
          <p>Select a guide from the sidebar.</p>
        )}
      </section>
    </div>
  );
}
