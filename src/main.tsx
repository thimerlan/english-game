import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import Dictionary from "./pages/Dictionary/Dictionary.tsx";
import ChatPage from "./pages/ChatPage/ChatPage.tsx";
import ErrorRoute from "./components/ErrorRoute/ErrorRoute.tsx";
import UnderConstruction from "./components/UnderConstruction/UnderConstruction.tsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },

  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/dictionary",
    element: <Dictionary />,
  },

  { path: "/grammar-checker", element: <UnderConstruction /> },

  { path: "/chat", element: <ChatPage /> },

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
