interface QuizQuestion {
  id: number;
  question: string;
  variants: string[];
  leftVariants: string[];
  rightVariants: string[];
  correctAnswers: string[][];
  correct: number;
}

interface VocabularyQuizData {
  id: number;
  questions: QuizQuestion[];
}
