import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
// import BeginnerLevel from "./components/Levels/BeginnerLevel/BeginnerLevel.tsx";
// import VocabularyQuiz from "./components/Levels/BeginnerLevel/VocabularyQuiz/VocabularyQuiz.tsx";
// import WordQuiz from "./components/QuizComponents/VocabularyQuizTest/WordQuiz.tsx";
import Dictionary from "./pages/Dictionary/Dictionary.tsx";
import GrammarCheckerPage from "./pages/GrammarCheckerPage/GrammarCheckerPage.tsx";
import ChatPage from "./pages/ChatPage/ChatPage.tsx";
import ErrorRoute from "./components/ErrorRoute/ErrorRoute.tsx";
import UnderConstruction from "./components/UnderConstruction/UnderConstruction.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  //PAGES

  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/dictionary",
    element: <Dictionary />,
  },

  { path: "/grammar-checker", element: <GrammarCheckerPage /> },

  //PAGES

  //LEVEL COMPONENTS
  //   !!UnderConstruction
  //   {
  //     path: "/level/beginner",
  //     element: <BeginnerLevel />,
  //   },
  //   {
  //     path: "/level/beginner/vocabulary-quiz",
  //     element: <VocabularyQuiz />,
  //   },
  //   {
  //     path: "/level/beginner/vocabulary-quiz/:quizNumber",
  //     element: <WordQuiz />,
  //   },
  //   !!UnderConstruction

  //LEVEL COMPONENTS

  // CHAT PAGE
  { path: "/chat", element: <ChatPage /> },
  // CHAT PAGE

  { path: "/soon", element: <UnderConstruction /> },

  {
    path: "/*",
    element: <ErrorRoute />,
  },
]);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
