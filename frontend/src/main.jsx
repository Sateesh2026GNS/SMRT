import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

const LoadingFallback = () => (
  <div
    className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-900"
    role="status"
    aria-live="polite"
    aria-label="Loading application"
  >
    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-900/40">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent dark:border-teal-400" />
    </div>
    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Loading SMRT…</p>
    <p className="ui-hint mt-1 text-center">Preparing your workspace</p>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<LoadingFallback />}>
              <App />
            </Suspense>
          </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
