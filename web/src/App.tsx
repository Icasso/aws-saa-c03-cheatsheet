import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import StudyPage from "./pages/StudyPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import PracticeExamPage from "./pages/PracticeExamPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="study" element={<StudyPage />} />
        <Route path="study/:guideId" element={<StudyPage />} />
        <Route path="flashcards" element={<FlashcardsPage />} />
        <Route path="practice" element={<PracticeExamPage />} />
      </Route>
    </Routes>
  );
}
