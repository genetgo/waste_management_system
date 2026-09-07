import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Language Context
const LanguageContext = createContext();

// Translation Dictionary (Amharic and English)
const translations = {
  en: {
    // Navigation / General
    dashboard: "Dashboard",
    schedule: "Collection Schedule",
    feedback: "Send Feedback",
    notifications: "Notifications",
    profile: "My Profile",
    logout: "Log Out",
    loading: "Loading...",
    unauthorized: "Unauthorized Access",
    
    // Roles
    resident: "Resident",
    businessOwner: "Business Owner",
    collector: "Waste Collector",
    municipalAdmin: "Municipal Administrator",
    systemAdmin: "System Administrator",

    // Dashboard & Form Specific
    welcome: "Welcome Back",
    pendingRequests: "Pending Requests",
    approvedTasks: "Approved Tasks",
    completedCollections: "Completed Collections",
    submitRequest: "Submit On-Demand Request",
    selectKifleKetema: "Select Kifle Ketema",
  },
  am: {
    // Navigation / General
    dashboard: "ዳሽቦርድ",
    schedule: "የቆሻሻ መሰብሰቢያ መርሃ-ግብር",
    feedback: "አስተያየት መስጫ",
    notifications: "ማስታወቂያዎች",
    profile: "የእኔ መገለጫ",
    logout: "ውጣ",
    loading: "በመጫን ላይ...",
    unauthorized: "ያልተፈቀደ መዳረሻ",

    // Roles
    resident: "ነዋሪ",
    businessOwner: "የንግድ ድርጅት ባለቤት",
    collector: "ቆሻሻ ሰብሳቢ",
    municipalAdmin: "የማዘጋጃ ቤት አስተዳዳሪ",
    systemAdmin: "የሲስተም አስተዳዳሪ",

    // Dashboard & Form Specific
    welcome: "እንኳን ደህና መጡ",
    pendingRequests: "በጥበቃ ላይ ያሉ ጥያቄዎች",
    approvedTasks: "የጸደቁ ተግባራት",
    completedCollections: "የተጠናቀቁ ስብስቦች",
    submitRequest: "ልዩ የቆሻሻ ማውጫ ጥያቄ አስገባ",
    selectKifleKetema: "ክፍለ ከተማ ይምረጡ",
  }
};

export const LanguageProvider = ({ children }) => {
  // Default language is Amharic ('am'), syncs with localStorage
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('dm_sys_lang') || 'am';
  });

  useEffect(() => {
    localStorage.setItem('dm_sys_lang', locale);
  }, [locale]);

  // Translate function helper
  const t = (key) => {
    return translations[locale][key] || translations['en'][key] || key;
  };

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'am') {
      setLocale(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context easily
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};