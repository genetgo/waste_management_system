
import React from "react";
import { Outlet } from "react-router-dom";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

export default function PublicLayout() {
  return (
    <div className="min-h-screen relative">

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Public Pages */}
      <Outlet />

    </div>
  );
}
