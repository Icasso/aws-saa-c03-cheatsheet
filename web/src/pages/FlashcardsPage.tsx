import { useMemo, useState } from "react";
import content from "../data/content.json";
import type { AppContent } from "../types";
import { getProgress, toggleKnownCard } from "../hooks/useProgress";
import { useSwipe } from "../hooks/useSwipe";

const data = content as AppContent;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function FlashcardsPage() {
  const categories = useMemo(
    () => [...new Set(data.flashcards.map((c) => c.category))].sort(),
    []
  );

  const [category, setCategory] = useState("All");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [known, setKnown] = useState(() => new Set(getProgress().knownCards));

  const deck = useMemo(() => {
    const filtered =
      category === "All"
        ? data.flashcards
        : data.flashcards.filter((c) => c.category === category);
    return shuffled ? shuffle(filtered) : filtered;
  }, [category, shuffled]);

  const card = deck[index];

  function next() {
    setFlipped(false);
    setIndex((i) => (i + 1) % deck.length);
  }

  function prev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + deck.length) % deck.length);
  }

  function markKnown() {
    if (!card) return;
    const state = toggleKnownCard(card.term);
    setKnown(new Set(state.knownCards));
    next();
  }

  function resetDeck() {
    setIndex(0);
    setFlipped(false);
    setShuffled(false);
  }

  if (!card) {
    return <div className="page">No flashcards in this category.</div>;
  }

  const isKnown = known.has(card.term);

  const swipe = useSwipe({
    onSwipeLeft: next,
    onSwipeRight: prev,
  });

  return (
    <div className="page flashcards-page">
      <header className="flash-header">
        <div>
          <h1>Flashcards</h1>
          <p>{deck.length} cards · {known.size} marked known</p>
        </div>
        <div className="flash-controls">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setIndex(0); setFlipped(false); }}>
            <option value="All">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={() => { setShuffled(true); setIndex(0); setFlipped(false); }}>
            Shuffle
          </button>
          <button className="btn btn-secondary" onClick={resetDeck}>
            Reset
          </button>
        </div>
      </header>

      <div className="flash-meta">
        <span className="badge">{card.category}</span>
        <span>Card {index + 1} of {deck.length}</span>
        {isKnown && <span className="known-badge">Known</span>}
      </div>

      <button
        className={`flashcard ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        onTouchStart={swipe.onTouchStart}
        onTouchEnd={swipe.onTouchEnd}
        aria-label="Flip flashcard"
      >
        <div className="flashcard-inner">
          <div className="flashcard-face front">
            <p className="flash-label">Term</p>
            <h2>{card.term}</h2>
            <p className="flash-hint">Tap to flip · swipe to navigate</p>
          </div>
          <div className="flashcard-face back">
            <p className="flash-label">Definition</p>
            <p>{card.definition}</p>
          </div>
        </div>
      </button>

      <div className="flash-actions flash-actions-bar">
        <button className="btn btn-secondary" onClick={prev}>Previous</button>
        <button className="btn btn-secondary" onClick={() => setFlipped((f) => !f)}>
          {flipped ? "Show term" : "Show answer"}
        </button>
        <button className="btn btn-primary" onClick={markKnown}>
          Got it — next
        </button>
        <button className="btn btn-secondary" onClick={next}>Next</button>
      </div>

      <div className="progress-dots">
        {deck.slice(0, Math.min(deck.length, 20)).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`dot ${i === index ? "active" : ""} ${known.has(deck[i].term) ? "known" : ""}`}
            onClick={() => { setIndex(i); setFlipped(false); }}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
        {deck.length > 20 && <span className="dot-more">+{deck.length - 20}</span>}
      </div>
    </div>
  );
}
