import { createContext, useContext, useState, useEffect } from "react";

export const translations = {
  en: {
    // App & Taglines
    appName: "Smart Civic Reporting",
    tagline: "Report. Track. Resolve.",
    subTagline: "Login to report and track civic issues in your locality.",
    welcome: "Welcome",
    citizen: "Citizen",
    taglineDashboard: "Report civic problems in your locality easily and track progress live.",

    // Navbar
    home: "Home",
    reportIssue: "Report Issue",
    myComplaints: "My Complaints",
    notifications: "Notifications",
    profile: "Profile",
    logout: "Logout",

    // Actions & Buttons
    reportNewIssue: "+ Report New Issue",
    reportAnotherIssue: "➕ Report Another Issue",
    submitComplaint: "Submit Complaint",
    delete: "Delete",
    backToLogin: "Back to Login",
    createAccount: "Create Account",
    officialStaffLogin: "Official & Staff Login",
    loginBtn: "Login",
    loggingIn: "Logging in...",
    officialPortalBtn: "Official Secure Login",
    trackLiveProgress: "📡 Track Live Progress ➔",
    backToComplaints: "Back to My Complaints",

    // Stats
    totalComplaints: "Total Complaints",
    myTotalComplaints: "My Total Complaints",
    inProgress: "In Progress",
    resolved: "Resolved",
    reported: "Reported",
    viewed: "Viewed",
    all: "All",

    // Form Fields
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    fullNamePlaceholder: "Full Name",
    phonePlaceholder: "Phone Number",
    addressPlaceholder: "Street Address",
    searchPlaceholder: "🔍 Search by Ticket ID, Issue, or Street Address...",
    forgotPassword: "Forgot Password / Reset Account?",
    resetPasswordTitle: "Reset your account password to regain access.",
    saveNewPassword: "Save New Password",
    newPasswordPlaceholder: "Enter New Password",

    // Messages
    loadingComplaints: "Loading complaints from cloud...",
    noComplaintsFound: "No matching complaints found",
    noComplaintsYet: "You haven't reported any civic issues yet.",
    emptyHelp: "Try clearing your search or status filter, or report a new civic issue.",
    accountStatus: "Account Status",
    activeVerified: "Active & Verified",
    demoCredentials: "Demo Official & Staff Accounts:"
  },

  te: {
    // App & Taglines
    appName: "స్మార్ట్ సివిక్ రిపోర్టింగ్",
    tagline: "ఫిర్యాదు చేయండి. ట్రాక్ చేయండి. పరిష్కరించండి.",
    subTagline: "మీ పరిసరాల్లోని ప్రజా సమస్యలను నివేదించడానికి మరియు ట్రాక్ చేయడానికి లాగిన్ చేయండి.",
    welcome: "స్వాగతం",
    citizen: "పౌరుడు",
    taglineDashboard: "మీ ప్రాంతంలోని పౌర సమస్యలను సులభంగా నివేదించండి మరియు పురోగతిని ట్రాక్ చేయండి.",

    // Navbar
    home: "హోమ్",
    reportIssue: "సమస్యను నివేదించండి",
    myComplaints: "నా ఫిర్యాదులు",
    notifications: "నోటిఫికేషన్‌లు",
    profile: "ప్రొఫైల్",
    logout: "లాగ్ అవుట్",

    // Actions & Buttons
    reportNewIssue: "+ కొత్త సమస్యను నివేదించండి",
    reportAnotherIssue: "➕ మరో సమస్యను నివేదించండి",
    submitComplaint: "ఫిర్యాదు సమర్పించండి",
    delete: "తొలగించు",
    backToLogin: "లాగిన్‌కి తిరిగి వెళ్ళండి",
    createAccount: "ఖాతా సృష్టించండి",
    officialStaffLogin: "అధికారులు & సిబ్బంది లాగిన్",
    loginBtn: "లాగిన్",
    loggingIn: "లాగిన్ అవుతోంది...",
    officialPortalBtn: "అధికారిక సురక్షిత లాగిన్",
    trackLiveProgress: "📡 ప్రత్యక్ష పురోగతిని చూడండి ➔",
    backToComplaints: "నా ఫిర్యాదులకు తిరిగి వెళ్ళండి",

    // Stats
    totalComplaints: "మొత్తం ఫిర్యాదులు",
    myTotalComplaints: "నా మొత్తం ఫిర్యాదులు",
    inProgress: "పురోగతిలో ఉంది",
    resolved: "పరిష్కరించబడింది",
    reported: "నివేదించబడింది",
    viewed: "పరిశీలించబడింది",
    all: "అన్నీ",

    // Form Fields
    emailPlaceholder: "మీ ఇమెయిల్ నమోదు చేయండి",
    passwordPlaceholder: "మీ పాస్‌వర్డ్ నమోదు చేయండి",
    fullNamePlaceholder: "పూర్తి పేరు",
    phonePlaceholder: "ఫోన్ నంబర్",
    addressPlaceholder: "చిరునామా",
    searchPlaceholder: "🔍 టికెట్ ఐడీ లేదా చిరునామా ద్వారా శోధించండి...",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా / ఖాతా రీసెట్?",
    resetPasswordTitle: "ఖాతా యాక్సెస్ పునరుద్ధరించడానికి కొత్త పాస్‌వర్డ్ సెట్ చేయండి.",
    saveNewPassword: "కొత్త పాస్‌వర్డ్ భద్రపరచండి",
    newPasswordPlaceholder: "కొత్త పాస్‌వర్డ్ నమోదు చేయండి",

    // Messages
    loadingComplaints: "క్లౌడ్ నుండి ఫిర్యాదులు లోడ్ అవుతున్నాయి...",
    noComplaintsFound: "ఎలాంటి ఫిర్యాదులు కనుగొనబడలేదు",
    noComplaintsYet: "మీరు ఇంకా ఎలాంటి పౌర సమస్యలను నివేదించలేదు.",
    emptyHelp: "మీ శోధనను మార్చండి లేదా కొత్త సమస్యను నివేదించండి.",
    accountStatus: "ఖాతా స్థితి",
    activeVerified: "యాక్టివ్ & ధృవీకరించబడింది",
    demoCredentials: "అధికారులు & సిబ్బంది డెమో ఖాతాలు:"
  },

  hi: {
    // App & Taglines
    appName: "स्मार्ट सिविक रिपोर्टिंग",
    tagline: "रिपोर्ट करें। ट्रैक करें। समाधान पाएं।",
    subTagline: "अपने क्षेत्र की नागरिक समस्याओं को दर्ज और ट्रैक करने के लिए लॉगिन करें।",
    welcome: "स्वागत है",
    citizen: "नागरिक",
    taglineDashboard: "अपने क्षेत्र की नागरिक समस्याओं को आसानी से दर्ज करें और स्थिति ट्रैक करें।",

    // Navbar
    home: "होम",
    reportIssue: "समस्या रिपोर्ट करें",
    myComplaints: "मेरी शिकायतें",
    notifications: "सूचनाएं",
    profile: "प्रोफाइल",
    logout: "लॉग आउट",

    // Actions & Buttons
    reportNewIssue: "+ नई समस्या दर्ज करें",
    reportAnotherIssue: "➕ दूसरी समस्या दर्ज करें",
    submitComplaint: "शिकायत सबमिट करें",
    delete: "हटाएं",
    backToLogin: "लॉगिन पर वापस जाएं",
    createAccount: "खाता बनाएं",
    officialStaffLogin: "अधिकारी एवं कर्मचारी लॉगिन",
    loginBtn: "लॉगिन",
    loggingIn: "लॉगिन हो रहा है...",
    officialPortalBtn: "अधिकारिक सुरक्षित लॉगिन",
    trackLiveProgress: "📡 लाइव प्रगति ट्रैक करें ➔",
    backToComplaints: "मेरी शिकायतों पर वापस जाएं",

    // Stats
    totalComplaints: "कुल शिकायतें",
    myTotalComplaints: "मेरी कुल शिकायतें",
    inProgress: "प्रगति पर है",
    resolved: "समाधान हो गया",
    reported: "रिपोर्ट किया गया",
    viewed: "देखा गया",
    all: "सभी",

    // Form Fields
    emailPlaceholder: "अपना ईमेल दर्ज करें",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    fullNamePlaceholder: "पूरा नाम",
    phonePlaceholder: "फ़ोन नंबर",
    addressPlaceholder: "पता",
    searchPlaceholder: "🔍 टिकट आईडी या पते से खोजें...",
    forgotPassword: "पासवर्ड भूल गए / खाता रीसेट करें?",
    resetPasswordTitle: "खाता पुनः प्राप्त करने के लिए नया पासवर्ड सेट करें।",
    saveNewPassword: "नया पासवर्ड सहेजें",
    newPasswordPlaceholder: "नया पासवर्ड दर्ज करें",

    // Messages
    loadingComplaints: "क्लाउड से शिकायतें लोड हो रही हैं...",
    noComplaintsFound: "कोई शिकायत नहीं मिली",
    noComplaintsYet: "आपने अभी तक कोई नागरिक समस्या दर्ज नहीं की है।",
    emptyHelp: "खोज फ़िल्टर बदलें या नई नागरिक समस्या दर्ज करें।",
    accountStatus: "खाता स्थिति",
    activeVerified: "सक्रिय और सत्यापित",
    demoCredentials: "अधिकारी एवं कर्मचारी डेमो खाते:"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("preferred_language") || "en";
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem("preferred_language", lang);
    }
  };

  const t = (key, fallback = "") => {
    const currentLangDict = translations[language] || translations.en;
    if (currentLangDict && currentLangDict[key]) {
      return currentLangDict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: [
      { code: "en", label: "English" },
      { code: "te", label: "తెలుగు" },
      { code: "hi", label: "हिंदी" }
    ] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en",
      setLanguage: () => {},
      t: (key, fallback = "") => fallback || key,
      availableLanguages: []
    };
  }
  return context;
};
