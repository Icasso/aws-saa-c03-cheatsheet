import { Link } from "react-router-dom";
import content from "../data/content.json";
import type { AppContent } from "../types";
import { getProgress } from "../hooks/useProgress";

const data = content as AppContent;

export default function HomePage() {
  const progress = getProgress();
  const lastAttempt = progress.examAttempts[0];

  return (
    <div className="page home-page">
      <section className="hero">
        <p className="eyebrow">AWS Certified Solutions Architect — Associate</p>
        <h1>Last-mile revision for SAA-C03</h1>
        <p className="lede">
          Interactive study guides, flashcards, and a 65-question practice exam pulled from your
          markdown review kit.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/practice">
            Start Practice Exam
          </Link>
          <Link className="btn btn-secondary" to="/flashcards">
            Review Flashcards
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{data.meta.duration} min</span>
          <span className="stat-label">Exam duration</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.meta.questionCount}</span>
          <span className="stat-label">Practice questions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.meta.passingScore}</span>
          <span className="stat-label">Passing score</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.flashcards.length}</span>
          <span className="stat-label">Flashcards</span>
        </div>
      </section>

      {lastAttempt && (
        <section className="panel">
          <h2>Last practice attempt</h2>
          <p>
            {lastAttempt.score}/{lastAttempt.total} correct on{" "}
            {new Date(lastAttempt.date).toLocaleString()}
          </p>
        </section>
      )}

      <section className="panel">
        <h2>Domain weightings</h2>
        <div className="domain-bars">
          {data.domains.map((d) => (
            <div key={d.number} className="domain-row">
              <div className="domain-label">
                <span>D{d.number}</span>
                <strong>{d.name}</strong>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${d.weight}%` }} />
              </div>
              <span className="domain-weight">{d.weight}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Top 10 things to remember</h2>
        <ol className="top-ten-list">
          {data.topTen.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong> — {item.detail}
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h2>Recommended study order</h2>
        <ol className="study-order">
          <li>
            <Link to="/study/aws-services-map-memorize">AWS Services Map</Link> — fast, high recall
          </li>
          <li>
            <Link to="/study/well-architected-framework">Well-Architected Framework</Link> — pillar
            vocabulary
          </li>
          <li>
            <Link to="/practice">Practice Exam</Link> — timed, 65 questions
          </li>
          <li>
            <Link to="/study/domain1-design-secure-architectures">Domain guides</Link> — review
            misses
          </li>
          <li>
            <Link to="/study/exam-scenario-playbook">Exam Scenario Playbook</Link> — 50 patterns
          </li>
          <li>
            <Link to="/flashcards">Flashcards</Link> + test-day tactics before exam day
          </li>
        </ol>
      </section>
    </div>
  );
}
