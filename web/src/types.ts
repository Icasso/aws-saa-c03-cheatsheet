export interface Domain {
  number: number;
  name: string;
  weight: number;
}

export interface StudyGuide {
  id: string;
  filename: string;
  title: string;
  order: number;
  content: string;
}

export interface Flashcard {
  term: string;
  definition: string;
  category: string;
}

export interface QuestionOption {
  letter: string;
  text: string;
}

export interface Question {
  id: number;
  domain: string;
  question: string;
  options: QuestionOption[];
  correct: string[];
  multiSelect: boolean;
  explanation: string;
}

export interface AppContent {
  meta: {
    title: string;
    examCode: string;
    duration: number;
    questionCount: number;
    passingScore: number;
  };
  domains: Domain[];
  topTen: { title: string; detail: string }[];
  studyGuides: StudyGuide[];
  flashcards: Flashcard[];
  questions: Question[];
}
