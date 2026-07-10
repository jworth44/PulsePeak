import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./state/AuthContext";
import "./styles.css";
import "./styles-polish.css";
import "./styles-themes.css";

// Build stamp (vite define): confirms which build this browser is running.
// Check via DevTools console or `document.documentElement.dataset.build`.
try {
  document.documentElement.dataset.build = __BUILD_STAMP__;
  console.info(`PulsePeak build ${__BUILD_STAMP__}`);
} catch {
  /* non-browser context */
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
