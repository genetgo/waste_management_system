import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * RoleBasedRoute - ተጠቃሚዎች በሮላቸው መሰረት ብቻ ወደ ዳሽቦርድ እንዲገቡ የሚፈቅድ የጥበቃ ማሽን
 * @param {Array} allowedRoles - ለዚህ ገጽ የተፈቀዱ የተጠቃሚዎች ሚና ዝርዝር
 */
const RoleBasedRoute = ({ allowedRoles }) => {
  // 📌 ቶክን እና ሮል መረጃዎችን ከ localStorage ላይ እናነባለን
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // ለምሳሌ: 'Resident', 'Business Owner', 'System Administrator'

  // 1. ተጠቃሚው ሎግኢን ካላደረገ (ቶክን ከሌለው) በቀጥታ ወደ መግቢያ ገጽ (Login) ይመለሳል
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. ተጠቃሚው ሎግኢን አድርጓል ነገር ግን የተፈቀደው ሮል ዝርዝር ውስጥ ከሌለ ወደ unauthorized ይመራል
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. ሁሉም ነገር ትክክል ከሆነ ወደ ፈለገው ዳሽቦርድ ገጽ (Child Routes) እንዲያልፍ ይፈቀድለታል
  return <Outlet />;
};

export default RoleBasedRoute;