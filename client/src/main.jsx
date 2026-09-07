
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

// ==========================================
// i18next INITIALIZATION
// ==========================================
import "./i18n/i18n";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>

      <AuthProvider>

        <LanguageProvider>
          <App />
        </LanguageProvider>

      </AuthProvider>

    </BrowserRouter>
  </React.StrictMode>
);

