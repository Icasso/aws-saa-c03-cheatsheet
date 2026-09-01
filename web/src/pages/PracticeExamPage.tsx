import { useEffect, useMemo, useState } from "react";
import content from "../data/content.json";
import type { AppContent, Question } from "../types";
import {
  getProgress,
  recordExamAttempt,
  toggleFlaggedQuestion,
} from "../hooks/useProgress";

const data = content as AppContent;

type Mode = "setup" | "exam" | "review";
type Answers = Record<number, string[]>;

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

function scoreQuestion(q: Question, selected: string[]) {
  return arraysEqual(selected, q.correct);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PracticeExamPage() {
  const [mode, setMode] = useState<Mode>("setup");
  const [answers, setAnswers] = useState<Answers>({});
  const [current, setCurrent] = useState(0);
  const [timerOn, setTimerOn] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(data.meta.duration * 60);
  const [flagged, setFlagged] = useState<number[]>(() => getProgress().flaggedQuestions);
  const [domainFilter, setDomainFilter] = useState("All");

  const questions = useMemo(() => {
    if (domainFilter === "All") return data.questions;
    return data.questions.filter((q) => q.domain === domainFilter);
  }, [domainFilter]);

  const q = questions[current];
  const selected = answers[q?.id] ?? [];

  useEffect(() => {
    if (mode !== "exam" || !timerOn) return;
    if (secondsLeft <= 0) {
      setMode("review");
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [mode, timerOn, secondsLeft]);

  function startExam() {
    setAnswers({});
    setCurrent(0);
    setSecondsLeft(data.meta.duration * 60);
    setMode("exam");
  }

  function toggleAnswer(letter: string) {
    if (!q) return;
    setAnswers((prev) => {
      const existing = prev[q.id] ?? [];
      if (q.multiSelect) {
        const next = existing.includes(letter)
          ? existing.filter((l) => l !== letter)
          : [...existing, letter];
        return { ...prev, [q.id]: next };
      }
      return { ...prev, [q.id]: [letter] };
    });
  }

  function submitExam() {
    const correct = questions.filter((question) =>
      scoreQuestion(question, answers[question.id] ?? [])
    ).length;
    recordExamAttempt(correct, questions.length);
    setMode("review");
  }

  function toggleFlag(qid: number) {
    const state = toggleFlaggedQuestion(qid);
    setFlagged(state.flaggedQuestions);
  }

  const results = useMemo(() => {
    if (mode !== "review") return null;
    const correct = questions.filter((question) =>
      scoreQuestion(question, answers[question.id] ?? [])
    ).length;
    const pct = Math.round((correct / questions.length) * 100);
    return { correct, total: questions.length, pct };
  }, [mode, answers, questions]);

  if (mode === "setup") {
    return (
      <div className="page practice-setup">
        <h1>Practice Exam</h1>
        <p className="lede">
          {data.questions.length} scenario questions with instant scoring and explanations.
          Aim for 55+ correct (85%) before exam day.
        </p>

        <div className="panel setup-panel">
          <label>
            Filter by domain
            <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
              <option value="All">All domains ({data.questions.length} questions)</option>
              {["D1", "D2", "D3", "D4"].map((d) => (
                <option key={d} value={d}>
                  {d} ({data.questions.filter((q) => q.domain === d).length} questions)
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={timerOn}
              onChange={(e) => setTimerOn(e.target.checked)}
            />
            Enable {data.meta.duration}-minute timer (matches real exam)
          </label>

          <button className="btn btn-primary btn-large" onClick={startExam}>
            Start {domainFilter === "All" ? "Full" : domainFilter} Exam ({questions.length} Qs)
          </button>
        </div>

        <div className="panel">
          <h2>Scoring guide</h2>
          <ul className="score-guide">
            <li><strong>58–65:</strong> Ace-level — you're ready</li>
            <li><strong>50–57:</strong> Strong pass — review misses</li>
            <li><strong>42–49:</strong> Borderline — focus on weak domains</li>
            <li><strong>&lt;42:</strong> Reread domain files and retry</li>
          </ul>
        </div>
      </div>
    );
  }

  if (mode === "review" && results) {
    return (
      <div className="page practice-review">
        <header className="review-header">
          <h1>Results</h1>
          <div className={`score-badge score-${results.pct >= 85 ? "high" : results.pct >= 70 ? "mid" : "low"}`}>
            {results.correct}/{results.total} ({results.pct}%)
          </div>
        </header>

        <div className="review-actions">
          <button className="btn btn-primary" onClick={() => setMode("setup")}>
            New attempt
          </button>
          <button className="btn btn-secondary" onClick={() => { setMode("exam"); setCurrent(0); }}>
            Review questions
          </button>
        </div>

        <div className="question-list review-list">
          {questions.map((question) => {
            const sel = answers[question.id] ?? [];
            const correct = scoreQuestion(question, sel);
            return (
              <article key={question.id} className={`review-card ${correct ? "correct" : "incorrect"}`}>
                <header>
                  <span className="q-num">Q{question.id}</span>
                  <span className="badge">{question.domain}</span>
                  <span className={correct ? "result-tag pass" : "result-tag fail"}>
                    {correct ? "Correct" : `Answer: ${question.correct.join(", ")}`}
                  </span>
                </header>
                <p className="q-text">{question.question}</p>
                <ul className="option-list review-options">
                  {question.options.map((opt) => {
                    const isSelected = sel.includes(opt.letter);
                    const isCorrect = question.correct.includes(opt.letter);
                    let cls = "option";
                    if (isCorrect) cls += " option-correct";
                    if (isSelected && !isCorrect) cls += " option-wrong";
                    return (
                      <li key={opt.letter} className={cls}>
                        <strong>{opt.letter}.</strong> {opt.text}
                      </li>
                    );
                  })}
                </ul>
                {question.explanation && (
                  <p className="explanation"><strong>Why:</strong> {question.explanation}</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  if (!q) return null;

  const answeredCount = questions.filter((question) => (answers[question.id]?.length ?? 0) > 0).length;

  return (
    <div className="page practice-exam">
      <header className="exam-toolbar">
        <div>
          <h1>Practice Exam</h1>
          <p>{answeredCount}/{questions.length} answered</p>
        </div>
        {timerOn && <div className="timer">{formatTime(secondsLeft)}</div>}
        <button className="btn btn-primary" onClick={submitExam}>
          Submit exam
        </button>
      </header>

      <div className="question-nav-scroll" aria-label="Question navigation">
        <div className="question-nav">
          {questions.map((question, i) => {
            const answered = (answers[question.id]?.length ?? 0) > 0;
            const isFlagged = flagged.includes(question.id);
            return (
              <button
                key={question.id}
                className={`q-pill ${i === current ? "active" : ""} ${answered ? "answered" : ""} ${isFlagged ? "flagged" : ""}`}
                onClick={() => setCurrent(i)}
              >
                {question.id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="exam-layout">
        <section className="question-panel">
          <header className="question-header">
            <span className="q-num">Question {q.id}</span>
            <span className="badge">{q.domain}</span>
            {q.multiSelect && <span className="badge multi">Select all that apply</span>}
            <button
              className={`flag-btn ${flagged.includes(q.id) ? "active" : ""}`}
              onClick={() => toggleFlag(q.id)}
            >
              {flagged.includes(q.id) ? "Flagged" : "Flag"}
            </button>
          </header>

          <p className="q-text">{q.question}</p>

          <ul className="option-list">
            {q.options.map((opt) => {
              const isSelected = selected.includes(opt.letter);
              return (
                <li key={opt.letter}>
                  <button
                    className={`option-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleAnswer(opt.letter)}
                  >
                    <span className="option-letter">{opt.letter}</span>
                    <span>{opt.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="question-footer question-footer-desktop">
            <button className="btn btn-secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              Previous
            </button>
            <button
              className="btn btn-secondary"
              disabled={current === questions.length - 1}
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </div>

      <div className="exam-mobile-bar">
        <button className="btn btn-secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          Prev
        </button>
        <span className="exam-mobile-progress">
          {current + 1} / {questions.length}
        </span>
        <button
          className="btn btn-secondary"
          disabled={current === questions.length - 1}
          onClick={() => setCurrent((c) => c + 1)}
        >
          Next
        </button>
        <button className="btn btn-primary" onClick={submitExam}>
          Submit
        </button>
      </div>
    </div>
  );
}
