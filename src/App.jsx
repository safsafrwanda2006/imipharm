// File: src/App.jsx
import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import FileManager from "./pages/FileManager.jsx";
import FileViewer from "./pages/FileViewer.jsx";
import MedicinesTable from "./pages/MedicinesTable.jsx";

function App() {
  const [showResults, setShowResults] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showManagePharm, setShowManagePharm] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [showDashBoard, setShowDashBoard] = useState(false);
  const [showSideBar, setShowSideBar] = useState(false);
  const [showSideBarAdmin, setShowSideBarAdmin] = useState(false);
  const [showBareIcons, setShowBareIcons] = useState(true);
  const [showBareIconsAdmin, setShowBareIconsAdmin] = useState(true);
  const [showSubscribersTable, setShowSubscribersTable] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [gettingPharm, setGettingPharm] = useState(false);
  const [activePage, setActivePage] = useState("files");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [cities, setCities] = useState([]);
  const [missingMedicines, setMissingMedicines] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [lastSearch, setLastSearch] = useState("");
  const [SubscribtionPlan, setSubscribtionPlan] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [auth, setAuth] = useState(false);
  const [mySub, setMySub] = useState(null);
  const [selectedPlanMonths, setSelectedPlanMonths] = useState(null); // 1 | 3 | 6
  const [selectedPlanTotal, setSelectedPlanTotal] = useState(0);
  const [receiptId, setReceiptId] = useState("");
  const [showLanguages, setShowLanguages] = useState(false);
  const [showNumber, setShowNumber] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbacks, setfeedbacks] = useState([]);
  const [marketDemand, setMarketDemand] = useState([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");
  const [remember, setRemember] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const resetMode = params.get("reset") === "1" && !!params.get("token");

  const fetchMarketDemand = async () => {
    setMarketLoading(true);
    setMarketError("");
    try {
      const res = await axios.get(
        `http://localhost:8081/me/market-demand?min=${DEMAND_MIN}&limit=50`,
        { withCredentials: true },
      );
      setMarketDemand(res.data || []);
    } catch (e) {
      setMarketError(
        e?.response?.data?.Error || "Failed to load market demand",
      );
    } finally {
      setMarketLoading(false);
    }
  };

  const doLogin = async () => {
    const res = await axios.post(
      "http://localhost:8081/login",
      { email, password, remember },
      { withCredentials: true },
    );
    setUser(res.data.user);
  };
  const isPharmacy = user?.role === "pharmacy";
  const planMonths = mySub?.plan_months ?? null; // from DB after login
  const hasMissingFeature = planMonths === 3 || planMonths === 6; // Standard or Premium
  const isBasicSubscriber = planMonths === 1;

  const hasMarketDemand = planMonths === 3 || planMonths === 6;
  const DEMAND_MIN = 15;

  // ✅ language: state-based + localStorage fixed (lazy init)
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem("language");
      return saved === "rw" || saved === "en" ? saved : "en";
    } catch {
      return "en";
    }
  });

  const [width, setWidth] = useState(250);
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);
  const searchRef = useRef(null);
  const aboutRef = useRef(null);

  const [values, setValues] = useState({
    email: "",
    pharmacyname: "",
    pharmacylocation: "",
    city: "",
    password: "",
  });

  const [loginValue, setLoginValue] = useState({
    email: "",
    password: "",
  });

  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);

  const I18N = {
    en: {
      // header/menu
      location: "location",
      language: "language",
      pharmacies: "pharmacies",

      // search
      searchPlaceholder: "Search for your medicine ..",
      filterByCityTitle: "Filter by city name",
      searchBtn: "Search Medicine",
      addPharmacyBtn: "Add Your Pharmacy",

      // hero
      heroTitle: "Find Your Medicine Instantly",
      heroDesc:
        "Discover nearby pharmacies that have your medicine available in real time.",

      // results
      resultsTitle: "Your medicine is available at these pharmacies",
      noPharmacyFound: "No pharmacy found for this medicine",
      inCity: "In:",

      // subscription plans
      plansTitle: "Choose the Right Plan to Grow Your Pharmacy",
      plansFooterTitle: "Don’t let customers miss your pharmacy.",
      plansFooterDesc:
        "Join imiPharm today and make your medicines easier to find.",

      basicPlan: "Basic plan",
      standardPlan: "Standard Plan",
      premiumPlan: "Premium Plan",
      mostPopular: "🔥 Most Popular",

      startSmall: "Start small. Stay visible.",
      betterVisibility: "Better visibility. Better results.",

      month: "month",
      months: "months",
      total: "Total:",

      twoMonthsFreeBanner: "2 Months FREE with Premium Plan",
      twoMonthsFree: "🎉 Get 2 Months FREE",

      listed: "✔ Listed in medicine search results",
      locationInstant: "✔ Customers can find your location instantly",
      dashboardAccess: "✔ Access to pharmacy dashboard",
      missingNotif: "✔ Receive notifications about missing medicines",
      everythingInStandard: "✔ Everything in Standard",
      maxExposure: "✔ Maximum exposure for 6 months",
      brandPresence: "✔ Stronger brand presence",
      bestValue: "✔ Best value for money",
      higherTrust: "✔ Higher customer trust",
      everythingInBasic: "✔ Everything in Basic",
      longerVisibility: "✔ Longer visibility for stable growth",
      consistentReach: "✔ More consistent customer reach",
      priorityListing: "✔ Priority listing in search results",

      premiumBadge: "Premium",
      standardBadge: "Standard",
      basicBadge: "Basic",

      listed: "✔ Listed in medicine search results",
      locationInstant: "✔ Customers can find your location instantly",
      dashboardAccess: "✔ Access to pharmacy dashboard (manage medicines)",
      missingNotif: "✔ Missing medicines insights (based on searches)",
      marketDemandFeature:
        "✔ Market demand (high-search medicines you don’t have)",
      priorityListing: "✔ Higher ranking in search results",
      topPriorityListing: "✔ Top ranking in search results",

      basicNote:
        "Basic keeps you visible in search. Upgrade to get insights and priority ranking.",
      standardNote:
        "For growing pharmacies: priority ranking + insights about missing medicines and market demand.",
      premiumNote:
        "Maximum growth: top ranking + full insights for long-term advantage.",
      // plan notes + CTA
      basicNote:
        "Perfect for pharmacies who want flexibility with no long-term commitment.",
      premiumNote: "Best choice for pharmacies serious about long-term growth.",
      standardNote:
        "Recommended for growing pharmacies that want steady customer flow.",
      activateBasic: "Activate Basic Plan",
      upgradePremium: "Upgrade to Premium & Save",
      chooseStandard: "Choose Standard & Grow",

      // auth
      login: "Login",
      register: "Register",
      paymentNumber: "Payment Reference Number",
      view: "View Number",
      newRegistration: "New registration",
      email: "email..",
      password: "password",
      pharmacyName: "Pharmacy name..",
      pharmacyLocation: "Pharmacy location URL..",
      city: "city ..",
      receiptPlaceholder: "Receipt / Transaction ID",

      confirmPaymentOf: "Confirm payment of",
      for: "for",
      afterPayment:
        "After payment, enter your receipt/transaction ID below to activate your subscription.",
      choosePlanFirst: "Please choose a plan first.",
      receiptRequired: "Receipt ID is required",
      fillAllRequired: "Please fill all required fields",
      registerFailed: "Register failed",
      passwordIncorrect: "Invalid email or password",

      // dashboard pharmacy
      pharmacyStatus: "Pharmacy Status:",
      sideBar: "Side Bar",
      dashboard: "Dashboard",
      missingMedicinesTitle: "Some medicines your pharmacy may not have",
      missingMedicinesDesc:
        "Based on the user’s search, we noticed that the following medicines are not available in your pharmacy.",
      noMissing: "No missing medicines at the moment.",
      notifications: "Notifications & Messages",
      loading: "Loading...",
      noMessages: "No messages yet.",
      refresh: "Refresh",
      subscriptions: "Subscriptions",
      subscriptionDeadline: "Subscription & Dedline",
      renewal: "Renewal:",
      expired: "Expired",
      subscriptionRenew: "subscription Renew",
      subscriptionPlans: "subscription plans",
      setting: "Setting & Feedback",
      sendFeedback: "send a feedback",
      changeSetting: "change setting",

      // admin
      admins: "Admins",
      manageAdmins: "Manage Admains",
      addNewAdmin: "Add New Admin",
      remove: "Remove",
      endedSubsTitle: "The following pharmacies has an ended subscription",

      // alerts
      enterMedicineName: "Please enter medicine name",
      searchFirstMedicine: "Please search for a medicine first",
      searchFailed: "Search failed",
      searchByCityFailed: "Search by city failed",
      messageSent: "Message sent",
      failedSend: "Failed to send",
      failedLoadMessages: "Failed to load messages",

      // footer
      contactUs: "Contact Us",
      reachOut: "Feel free to reach out for collaboration or opportunities.",
      rights: "All rights reserved.",
      footerTagline: "Search medicines. Find pharmacies. Save time.",
      footerDesc:
        "imiPharm helps customers discover medicine availability across nearby pharmacies, while enabling pharmacies to manage listings and subscriptions easily.",
      footerEmail: "Email",
      footerWhatsApp: "WhatsApp",

      footerProduct: "Product",
      footerSearch: "Medicine Search",
      footerPlans: "Subscription Plans",
      footerDashboard: "Pharmacy Dashboard",
      footerNotifications: "Notifications",

      footerCompany: "Company",
      footerAbout: "About",
      footerContact: "Contact",
      footerCareers: "Careers",
      footerPress: "Press",

      footerResources: "Resources",
      footerHelpCenter: "Help Center",
      footerSupport: "Support",
      footerStatus: "System Status",
      footerFAQ: "FAQ",

      footerLegal: "Legal",
      footerPrivacy: "Privacy Policy",
      footerTerms: "Terms of Service",
      footerCookies: "Cookie Policy",
      footerSecurity: "Security",

      footerNewsletterTitle: "Stay in the loop",
      footerNewsletterDesc:
        "Get important updates about imiPharm, new features, and improvements.",
      footerNewsletterPlaceholder: "Enter your email",
      footerSubscribe: "Subscribe",
      footerNewsletterSoon: "Newsletter feature will be added soon.",
      footerBuiltFor: "Built for Rwanda • Designed for clarity and trust.",
      footerLanguage: "Language",
      footerLangHint: "Language switch is available from the header.",
    },

    rw: {
      // header/menu
      location: "ahantu",
      language: "ururimi",
      pharmacies: "pharmacies",

      // search
      searchPlaceholder: "Shakisha umuti wawe ..",
      filterByCityTitle: "Shungura ukoresheje izina ry'umujyi",
      searchBtn: "Shakisha Umuti",
      addPharmacyBtn: "Ongeraho Pharmacy Yawe",

      // hero
      heroTitle: "Shaka Umuti Wawe Byihuse",
      heroDesc:
        "Menya pharmacies ziri hafi yawe zifite umuti wawe uboneka ako kanya.",

      // results
      resultsTitle: "Umuti wawe uboneka muri izi pharmacies",
      noPharmacyFound: "Nta pharmacy ibonetse kuri uyu muti",
      inCity: "Mu:",

      // subscription plans
      plansTitle: "Hitamo gahunda ikwiriye kuzamura pharmacy yawe",
      plansFooterTitle: "Ntukemere abakiriya kubura pharmacy yawe.",
      plansFooterDesc:
        "Iyandikishe kuri imiPharm uyu munsi kugira ngo imiti yawe iboneke byoroshye.",

      basicPlan: "Gahunda y'ibanze",
      standardPlan: "Gahunda isanzwe",
      premiumPlan: "Gahunda yihariye",
      mostPopular: "🔥 Icyamamare cyane",

      startSmall: "Tangirira hasi. Guma ugaragara.",
      betterVisibility: "Kugaragara kurushaho. Ibisubizo byiza.",

      month: "ukwezi",
      months: "amezi",
      total: "Igiteranyo:",

      twoMonthsFreeBanner: "Amezi 2 ku buntu muri Premium",
      twoMonthsFree: "🎉 Amezi 2 KU BUNTU",

      // plan bullets (keep simple)
      listed: "✔ Ugaragara mu gushakisha imiti",
      locationInstant: "✔ Abakiriya babona aho uri byoroshye",
      dashboardAccess: "✔ Ugera kuri dashboard ya pharmacy",
      missingNotif: "✔ Uhabwa amakuru y'imiti ibura",
      everythingInStandard: "✔ Ibyose biri muri Standard",
      maxExposure: "✔ Kugaragara cyane mu mezi 6",
      brandPresence: "✔ Kwiyongera ku izina/brand",
      bestValue: "✔ Agaciro keza ku mafaranga",
      higherTrust: "✔ Kwizerwa kurushaho",
      everythingInBasic: "✔ Ibyose biri muri Basic",
      longerVisibility: "✔ Kugaragara igihe kirekire",
      consistentReach: "✔ Kugera ku bakiriya buri gihe",
      priorityListing: "✔ Priority mu bisubizo",

      premiumBadge: "Premium",
      standardBadge: "Standard",
      basicBadge: "Basic",

      listed: "✔ Ugaragara mu gushakisha imiti",
      locationInstant: "✔ Abakiriya babona aho uri byoroshye",
      dashboardAccess: "✔ Ugera kuri dashboard (gucunga imiti)",
      missingNotif: "✔ Imibare y’imiti ibura (ishingiye ku bushakashatsi)",
      marketDemandFeature:
        "✔ Market demand (imiti ishakishwa cyane utari ufite)",
      priorityListing: "✔ Uza imbere mu bisubizo byo gushakisha",
      topPriorityListing: "✔ Uza ku isonga buri gihe mu bisubizo",

      basicNote:
        "Basic igufasha kugaragara mu gushakisha. Upgrade ubone insights na priority.",
      standardNote:
        "Ku gukura: priority + insights ku miti ibura na market demand.",
      premiumNote:
        "Ibyiza kurusha byose: top priority + full insights igihe kirekire.",
      // notes + CTA
      basicNote:
        "Ikwiriye pharmacies zishaka ubworoherane nta masezerano maremare.",
      premiumNote: "Ibyiza ku pharmacies zishaka gukura mu gihe kirekire.",
      standardNote: "Inama nziza ku pharmacies zishaka abakiriya buri gihe.",
      activateBasic: "Fungura Basic",
      upgradePremium: "Hitamo Premium & Zigama",
      chooseStandard: "Hitamo Standard",

      // auth
      login: "Injira",
      register: "Iyandikishe",
      paymentNumber: "Nomero y'ikorwa ry'ubwishyu",
      view: "Reba nomero",
      newRegistration: "Kwiyandikisha nshya",
      email: "imeri..",
      password: "ijambo banga",
      pharmacyName: "Izina rya pharmacy..",
      pharmacyLocation: "Aho pharmacy iherereye (link)URL..",
      city: "umujyi ..",
      receiptPlaceholder: "Receipt / Transaction ID",

      confirmPaymentOf: "Emeza kwishyura",
      for: "kuri",
      afterPayment:
        "Nyuma yo kwishyura, shyiramo Transaction ID/Receipt kugira ngo subscription ikore.",
      choosePlanFirst: "Banza uhitamo plan.",
      receiptRequired: "Receipt ID irakenewe",
      fillAllRequired: "Uzuza fields zose zisabwa",
      registerFailed: "Kwiyandikisha byanze",
      passwordIncorrect: "Ijambo banga si ryo",

      // dashboard pharmacy
      pharmacyStatus: "Status ya Pharmacy:",
      sideBar: "Side Bar",
      dashboard: "Dashboard",
      missingMedicinesTitle: "Imiti ushobora kuba udafite",
      missingMedicinesDesc:
        "Dushingiye ku byo abakiriya bashakisha, iyi miti ishobora kuba idahari muri pharmacy yawe.",
      noMissing: "Nta miti ibura ubu.",
      notifications: "Ubutumwa & Notifications",
      loading: "Birimo gupakururwa...",
      noMessages: "Nta butumwa.",
      refresh: "Ongera",
      subscriptions: "Subscriptions",
      subscriptionDeadline: "Subscription & Deadline",
      renewal: "Igihe gisigaye:",
      expired: "Byarangiye",
      subscriptionRenew: "Ongera Subscription",
      subscriptionPlans: "Reba Plans",
      setting: "Settings & Feedback",
      sendFeedback: "Ohereza feedback",
      changeSetting: "Hindura settings",

      // admin
      admins: "Admins",
      manageAdmins: "Gucunga Admins",
      addNewAdmin: "Ongeraho Admin",
      remove: "Kuraho",
      endedSubsTitle: "Pharmacies zifite subscription yarangiye",

      // alerts
      enterMedicineName: "Andika izina ry'umuti",
      searchFirstMedicine: "Banza ushakishe umuti",
      searchFailed: "Gushakisha byanze",
      searchByCityFailed: "Gushakisha ku mujyi byanze",
      messageSent: "Ubutumwa bwoherejwe",
      failedSend: "Kohereza byanze",
      failedLoadMessages: "Kuzana messages byanze",

      // footer
      contactUs: "Twandikire",
      reachOut: "Twandikire ku bufatanye cyangwa amahirwe.",
      rights: "Uburenganzira bwose burabitswe.",
      footerTagline: "Shakisha imiti. Bona pharmacies. Zigama igihe.",
      footerDesc:
        "imiPharm ifasha abakiriya kumenya aho umuti uboneka muri pharmacies ziri hafi, kandi igafasha pharmacies gucunga listings na subscriptions byoroshye.",
      footerEmail: "Imeri",
      footerWhatsApp: "WhatsApp",

      footerProduct: "Igicuruzwa",
      footerSearch: "Gushakisha imiti",
      footerPlans: "Gahunda za Subscription",
      footerDashboard: "Dashboard ya Pharmacy",
      footerNotifications: "Notifications",

      footerCompany: "Ikigo",
      footerAbout: "Ibyerekeye",
      footerContact: "Twandikire",
      footerCareers: "Akazi",
      footerPress: "Itangazamakuru",

      footerResources: "Ibikoresho",
      footerHelpCenter: "Ubufasha",
      footerSupport: "Support",
      footerStatus: "Imiterere ya system",
      footerFAQ: "Ibibazo bikunze kubazwa",

      footerLegal: "Amategeko",
      footerPrivacy: "Politiki y'ibanga",
      footerTerms: "Amabwiriza yo gukoresha",
      footerCookies: "Politiki ya Cookies",
      footerSecurity: "Umutekano",

      footerNewsletterTitle: "Komeza umenye amakuru",
      footerNewsletterDesc:
        "Uzakire amakuru mashya ya imiPharm, features nshya, n’ivugurura.",
      footerNewsletterPlaceholder: "Andika imeri yawe",
      footerSubscribe: "Iyandikishe",
      footerNewsletterSoon: "Newsletter izongerwamo vuba.",
      footerBuiltFor: "Yubakiwe u Rwanda • Yakozwe ku bwizerwe n’ubusobanuro.",
      footerLanguage: "Ururimi",
      footerLangHint: "Guhindura ururimi biri hejuru ku header.",
    },
  };

  const t = (key) => I18N[language]?.[key] ?? I18N.en[key] ?? key;

  // ✅ persist language safely
  useEffect(() => {
    try {
      localStorage.setItem("language", language);
    } catch {}
  }, [language]);

  const setLang = (lang) => {
    setLanguage(lang);
    setShowLanguages(false);
    setShowSideMenu(false);
  };

  // -------------------------
  // resize logic
  // -------------------------
  const startResize = () => {
    isResizing.current = true;
  };
  const stopResize = () => {
    isResizing.current = false;
  };
  const resize = (e) => {
    if (isResizing.current) {
      const newWidth = e.clientX;
      if (newWidth >= 100 && newWidth <= 400) {
        setWidth(newWidth);
      }
    }
  };
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:8081/feedbacks", {
        withCredentials: true,
      });
      setfeedbacks(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?.role === "admin" && activePage === "feedbacks") {
      fetchFeedbacks();
    }
  }, [activePage, user]);

  const updateStatus = async (id, status) => {
    await axios.put(
      `http://localhost:8081/pharmacies/${id}`,
      { status },
      { withCredentials: true },
    );
    fetchPharmacies();
  };

  const checkAuth = async () => {
    try {
      const res = await axios.get("http://localhost:8081/check-auth", {
        withCredentials: true,
      });

      if (res.data.loggedIn) {
        setAuth(true);
        setUser(res.data.user);
      } else {
        setAuth(false);
        setUser(null);
      }
    } catch (e) {
      setAuth(false);
      setUser(null);
    }
  };

  const PLANS = {
    1: {
      name: "Basic",
      months: 1,
      total: 0,
      priceLabel: "FREE",
    },
    3: {
      name: "Standard",
      months: 3,
      total: 18000,
      priceLabel: "18,000 RWF / 3 months",
    },
    6: {
      name: "Premium",
      months: 6,
      total: 20000,
      priceLabel: "30,000 RWF / 6 months (2 months free)",
    },
  };
  const handleFeedback = async (e) => {
    e.preventDefault();
    const text = feedback.trim();
    if (!text) return;

    try {
      await axios.post(
        "http://localhost:8081/feedback",
        { feedback: text },
        { withCredentials: true },
      );
      setFeedback("");
      alert("Feedback sent");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.error || "Failed to send feedback");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedPlanMonths) {
      alert(t("choosePlanFirst"));
      return;
    }

    const isBasicChosen = selectedPlanMonths === 1;

    // ✅ receipt required only for paid plans
    if (!isBasicChosen && !receiptId.trim()) {
      alert(t("receiptRequired"));
      return;
    }

    if (
      !values.email ||
      !values.pharmacyname ||
      !values.pharmacylocation ||
      !values.city ||
      !values.password
    ) {
      alert(t("fillAllRequired"));
      return;
    }

    const payload = {
      ...values,
      plan_months: selectedPlanMonths,
      receipt_id: isBasicChosen ? "00000" : receiptId.trim(),
    };

    setShowLoading(true);
    try {
      const res = await axios.post("http://localhost:8081/register", payload, {
        withCredentials: true,
      });

      setShowRegister(false);
      setShowDashBoard(true);
      setShowLogin(false);
    } catch (err) {
      console.log("REGISTER ERROR:", err?.response?.data || err);
      alert(err?.response?.data?.Error || t("registerFailed"));
    } finally {
      setShowLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "pharmacy") {
      axios
        .get("http://localhost:8081/me/subscription", { withCredentials: true })
        .then((res) => setMySub(res.data))
        .catch((err) => console.log(err));
    }
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && user.role === "pharmacy" && activePage === "Notifications") {
      fetchMyMessages();
    }
  }, [activePage, user]);

  const fetchMyMessages = async () => {
    setMessagesLoading(true);
    setMessagesError("");
    try {
      const res = await axios.get("http://localhost:8081/me/messages", {
        withCredentials: true,
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
      setMessagesError(
        err?.response?.data?.Error ||
          err?.response?.data?.error ||
          t("failedLoadMessages"),
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessageToPharmacy = async (pharmacyId) => {
    const defaultMsg =
      "Action Required: Your imiPharm subscription is nearing its expiration date, Renew now to keep your pharmacy visible to customers and avoid any interruption in service. Stay connected, stay discoverable, and continue growing your business with imiPharm.";

    try {
      await axios.post(
        `http://localhost:8081/pharmacies/${pharmacyId}/messages`,
        { messageText: defaultMsg },
        { withCredentials: true },
      );
      alert(t("messageSent"));
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.Error ||
          err?.response?.data?.error ||
          t("failedSend"),
      );
    }
  };

  const markMessageRead = async (messageId) => {
    try {
      await axios.patch(
        `http://localhost:8081/me/messages/${messageId}/read`,
        {},
        { withCredentials: true },
      );
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: "read" } : m)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPharmacies = async () => {
    setGettingPharm(true);
    try {
      const res = await axios.get("http://localhost:8081/pharmacies", {
        withCredentials: true,
      });
      setPharmacies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGettingPharm(false);
    }
  };

  const fetchMissingMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:8081/missing-medicines", {
        withCredentials: true,
      });
      setMissingMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  function addMonths(date, months) {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d;
  }

  function remainingLabel(subscriptionDate, planMonths) {
    const start = new Date(subscriptionDate);
    const expiry = addMonths(start, planMonths);
    const now = new Date();

    const diff = expiry - now;
    if (diff <= 0) return t("expired");

    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

    // keep English format; if you want RW format tell me
    return `${days} days ${hours} hours left`;
  }

  const handleSearchByCity = async (cityName) => {
    if (!searchQuery.trim()) {
      alert(t("searchFirstMedicine"));
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8081/search-medicine-city?q=${searchQuery}&city=${cityName}`,
      );
      setSearchResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      alert(t("searchByCityFailed"));
    } finally {
      setShowCities(false);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8081/cities")
      .then((res) => setCities(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (isPharmacy && activePage === "missingmed" && hasMissingFeature) {
      fetchMissingMedicines();
    }
  }, [activePage, isPharmacy, hasMissingFeature]);

  useEffect(() => {
    if (!isPharmacy || !hasMissingFeature) return;

    axios
      .get("http://localhost:8081/missing-medicines", { withCredentials: true })
      .then((res) => setMissingMedicines(res.data))
      .catch((err) => console.error(err));
  }, [isPharmacy, hasMissingFeature]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setShowLoading(true);
    try {
      const res = await axios.post("http://localhost:8081/login", loginValue, {
        withCredentials: true,
      });
      if (res.data.Status === "Success") {
        setUser(res.data.user);
        setAuth(true);
        setShowLogin(false);
        fetchPharmacies();
      } else {
        alert(res.data.error);
      }
    } catch (err) {
      if (err.response && err.response.data?.err) {
        alert(err.response.data.error);
      } else {
        alert(t("passwordIncorrect"));
      }
    } finally {
      setShowLoading(false);
    }
  };

  const handleSearch = async (value = searchQuery) => {
    if (!value.trim()) {
      alert(t("enterMedicineName"));
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8081/search-medicine?q=${value}`,
      );
      setSearchResults(res.data);
      setShowResults(true);
      if (isPharmacy && hasMissingFeature) {
        fetchMissingMedicines();
      }
      setLastSearch(value);
    } catch (err) {
      console.error(err);
      alert(t("searchFailed"));
    }
  };

  const fetchSuggestions = async (value) => {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8081/medicine-suggestions?q=${value}`,
      );
      setSuggestions(res.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchPharmacies();
  }, [user]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/check-auth", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) setUser(res.data.user);
      });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, []);

  function deleteMissingMed(e) {
    e.preventDefault();
    axios.delete("http://localhost:8081/deletemissing", {
      withCredentials: true,
    });
  }

  return (
    <div
      className="page-container"
      onClick={() => {
        setShowSideMenu(false);
        setShowManagePharm(false);
        setShowSuggestions(false);
        setShowCities(false);
        setShowLanguages(false);
      }}
    >
      <header>
        <div className="head">
          <div className="btnAndname">
            <button
              className="account"
              onClick={() => {
                if (showRegister) {
                  setShowRegister(false);
                  setShowLogin(true);
                } else if (
                  user &&
                  (user.role === "admin" || user.role === "pharmacy")
                ) {
                  setUser(null);
                  setShowLogin(true);
                } else if (showResults) {
                  setShowResults(false);
                } else if (SubscribtionPlan) {
                  setSubscribtionPlan(false);
                } else {
                  setShowLogin((prev) => !prev);
                }
              }}
            >
              <img
                src={
                  SubscribtionPlan ||
                  showLogin ||
                  showResults ||
                  showRegister ||
                  (user && (user.role === "admin" || user.role === "pharmacy"))
                    ? "icons/back.png"
                    : "icons/user.png"
                }
                alt="Login"
              />
            </button>
            <h2 className="logo">
              <span className="subtitle">imi</span>
              <span className=" unique">Pharm</span>
            </h2>
          </div>

          <div className="search">
            <input
              type="text"
              ref={searchRef}
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSearchQuery(item.medicine_name);
                      setShowSuggestions(false);
                      handleSearch(item.medicine_name);
                    }}
                  >
                    {item.medicine_name}
                  </li>
                ))}
              </ul>
            )}
            <button className="seatchicon" onClick={handleSearch}>
              <img src="icons/search-interface-symbol.png" alt="" />
            </button>
            <button
              className="filter-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowCities((prev) => !prev);
              }}
            >
              <img src="icons/filter.png" alt="" />
            </button>
          </div>

          <div className="language-manager">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLanguages((prev) => !prev);
              }}
              className="language-btn"
            >
              <img src="icons/language.png" alt="" />
            </button>
          </div>

          <div className="menubtnforphone">
            <button
              className="mbtnforphone"
              onClick={(e) => {
                e.stopPropagation();
                setShowSideMenu((prev) => !prev);
              }}
              onMouseEnter={() => setShowSideMenu(true)}
            >
              <img
                src={showSideMenu ? "icons/close.png" : "icons/menu.png"}
                alt="menu"
              />
            </button>
          </div>

          <div className="btns">
            {/* <button className="menubtns">
              {t("location")}
              <img src="icons/location.png" alt="" />
              <img src="icons/down-chevron.png" alt="" />
            </button> */}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLanguages((prev) => !prev);
              }}
              className="menubtns"
            >
              {t("language")}
              <img src="icons/language.png" alt="" />
              <img src="icons/down-chevron.png" alt="" />
            </button>

            <button
              className="menubtns"
              type="button"
              onClick={(e) => {
                setShowManagePharm((prev) => !prev);
                e.stopPropagation();
              }}
            >
              {t("pharmacies")}
              <img src="icons/pharmacy (1).png" alt="" />
              <img src="icons/down-chevron.png" alt="" />
            </button>
            <button
              onClick={() => {
                const target = aboutRef.current;
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="menubtns"
            >
              {t("footerAbout")}
              <img src="/icons/info.png" alt="" />
              <img src="icons/down-chevron.png" alt="" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {showCities && cities.length > 0 && (
          <div onClick={(e) => e.stopPropagation()} className="cities-filter">
            <ul>
              <li className="city-title">{t("filterByCityTitle")}</li>

              {cities.map((item, index) => (
                <li key={index} onClick={() => handleSearchByCity(item.city)}>
                  <div className="cities-list">{item.city}</div>
                  <img src="icons/location.png" alt="" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {showLanguages && (
          <div onClick={(e) => e.stopPropagation()} className="languages">
            <button onClick={() => setLang("en")} type="button">
              English <img src="icons/usa.png" alt="" />
            </button>

            <button onClick={() => setLang("rw")} type="button">
              Kinyarwanda <img src="icons/rwanda (2).png" alt="" />
            </button>
          </div>
        )}

        {user &&
          user.role === "pharmacy" &&
          !showLogin &&
          !SubscribtionPlan && (
            <div
              className="dashboard dashX"
              onClick={(e) => e.stopPropagation()}
            >
              {mySub && (
                <div className={`status-for-pharm ${mySub.status}`}>
                  {t("pharmacyStatus")}{" "}
                  <span className="active-name">{mySub.status}</span>
                  <img
                    src={
                      mySub.status === "active"
                        ? "icons/active.png"
                        : "icons/pending.png"
                    }
                    alt=""
                  />
                </div>
              )}

              <button
                className="sidebarbtn"
                onClick={() => {
                  setShowSideBar((prev) => !prev);
                  setShowBareIcons((prev) => !prev);
                }}
              >
                <img src="icons/sidebarwhite.png" alt="" />
                <span className="tooltip">{t("sideBar")}</span>
              </button>

              {showBareIcons && (
                <div className="bareicons">
                  <button
                    className="barbtns"
                    onClick={() => setActivePage("files")}
                  >
                    <img src="icons/dashboard.png" alt="" />
                    <span className="tooltip">{t("dashboard")}</span>
                  </button>

                  {hasMissingFeature && (
                    <button
                      className="barbtns"
                      onClick={() => {
                        setActivePage("missingmed");
                        fetchMissingMedicines();
                      }}
                    >
                      <img src="icons/hospital.png" alt="" />
                      <span className="tooltip">
                        {t("missingMedicinesTitle")}
                      </span>
                    </button>
                  )}
                  {hasMarketDemand && (
                    <button
                      className="barbtns"
                      onClick={() => {
                        setActivePage("marketDemand");
                        fetchMarketDemand();
                      }}
                    >
                      <img src="icons/demand.png" alt="" />
                      <span className="tooltip">Market Demand</span>
                    </button>
                  )}

                  <button
                    className="barbtns"
                    onClick={() => setActivePage("Notifications")}
                  >
                    <img src="icons/notification.png" alt="" />
                    <span className="tooltip">{t("notifications")}</span>
                  </button>

                  <button
                    className="barbtns"
                    onClick={() => setActivePage("subsciption")}
                  >
                    <img src="icons/corporate.png" alt="" />
                    <span className="tooltip">{t("subscriptions")}</span>
                  </button>

                  <button
                    className="barbtns"
                    onClick={() => setActivePage("feedbacksPhar")}
                  >
                    <img src="icons/feedback.png" alt="" />
                    <span className="tooltip">Feedbacks</span>
                  </button>
                </div>
              )}

              {showSideBar && (
                <div
                  className="sidebar"
                  ref={sidebarRef}
                  style={{ width: `${width}px` }}
                  onMouseMove={resize}
                  onMouseUp={stopResize}
                >
                  <div className="bars">
                    <button
                      className="barbtns"
                      onClick={() => setActivePage("files")}
                    >
                      {t("dashboard")}{" "}
                      <img src="icons/dashboard (1).png" alt="" />
                    </button>

                    {hasMissingFeature && (
                      <button
                        className="barbtns"
                        onClick={() => setActivePage("missingmed")}
                      >
                        Missing medicens{" "}
                        <img src="icons/hospital (1).png" alt="" />
                      </button>
                    )}
                    {hasMarketDemand && (
                      <button
                        className="barbtns"
                        onClick={() => {
                          setActivePage("marketDemand");
                          fetchMarketDemand();
                        }}
                      >
                        Market Demand <img src="icons/demand.png" alt="" />
                      </button>
                    )}

                    <button
                      className="barbtns"
                      onClick={() => setActivePage("Notifications")}
                    >
                      Notification{" "}
                      <img src="icons/notification (1).png" alt="" />
                    </button>

                    <button
                      className="barbtns"
                      onClick={() => setActivePage("subsciption")}
                    >
                      Subscription <img src="icons/corporate (1).png" alt="" />
                    </button>

                    <button
                      className="barbtns"
                      onClick={() => setActivePage("feedbacksPhar")}
                    >
                      Feedbacks <img src="icons/feedback.png" alt="" />
                    </button>
                  </div>

                  <div className="resizer" onMouseDown={startResize}></div>
                </div>
              )}

              {activePage === "files" && (
                <div className="files">
                  <FileManager
                    language={language}
                    openFile={(file) => {
                      setSelectedFile(file);
                      setActivePage("viewer");
                    }}
                  />
                </div>
              )}

              {activePage === "files" && <MedicinesTable language={language} />}

              {activePage === "viewer" && (
                <FileViewer
                  language={language}
                  file={selectedFile}
                  goBack={() => setActivePage("files")}
                />
              )}

              {activePage === "missingmed" && (
                <div className="missinglist">
                  <h2>{t("missingMedicinesTitle")}</h2>
                  <p>{t("missingMedicinesDesc")}</p>

                  {missingMedicines.length === 0 ? (
                    <p>{t("noMissing")}</p>
                  ) : (
                    <ol>
                      {missingMedicines.map((m, index) => (
                        <div className="listcontainer" key={index}>
                          <li>{m.medicine_name}</li>
                          <div className="missingMedicine"></div>
                        </div>
                      ))}
                    </ol>
                  )}
                </div>
              )}
              {activePage === "marketDemand" && (
                <div className="market-demand">
                  <h2>Market Demand</h2>
                  <p>
                    Medicines searched {DEMAND_MIN}+ times in the last 30 days
                    that you don’t have.
                  </p>

                  {marketLoading && <p>{t("loading")}</p>}
                  {marketError && <p style={{ color: "red" }}>{marketError}</p>}

                  {!marketLoading &&
                    !marketError &&
                    marketDemand.length === 0 && (
                      <p>No high-demand medicines yet.</p>
                    )}

                  {!marketLoading &&
                    !marketError &&
                    marketDemand.length > 0 && (
                      <ul>
                        {marketDemand.map((x, i) => (
                          <li key={i}>
                            <b>{x.medicine_name}</b> — Searches:{" "}
                            {x.search_count}
                            {x.last_searched_at
                              ? ` — Last: ${new Date(x.last_searched_at).toLocaleString()}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    )}

                  <button onClick={fetchMarketDemand}>Refresh</button>
                </div>
              )}

              {activePage === "Notifications" && (
                <div className="notif">
                  <h2>{t("notifications")}</h2>

                  {messagesLoading && <p>{t("loading")}</p>}
                  {messagesError && (
                    <p style={{ color: "red" }}>{messagesError}</p>
                  )}

                  {!messagesLoading &&
                    !messagesError &&
                    messages.length === 0 && <p>{t("noMessages")}</p>}

                  {!messagesLoading &&
                    !messagesError &&
                    messages.length > 0 && (
                      <ul>
                        {messages.map((m) => (
                          <li key={m.id}>
                            <div
                              className={`messages ${m.status === "read" ? "read" : ""}`}
                              onClick={() => {
                                alert(m.message_text);
                                if (m.status !== "read") markMessageRead(m.id);
                              }}
                            >
                              <h3>
                                Admin: {m.message_text}
                                {m.status !== "read" ? " (new)" : ""}
                              </h3>
                              <p>{new Date(m.sent_at).toLocaleString()}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                  <button onClick={fetchMyMessages}>{t("refresh")}</button>
                </div>
              )}

              {activePage === "subsciption" && (
                <div className="subsc">
                  <h2>{t("subscriptionDeadline")}</h2>
                  {mySub && (
                    <h3>
                      {t("renewal")}{" "}
                      {remainingLabel(
                        mySub.subscription_date,
                        mySub.plan_months,
                      )}
                    </h3>
                  )}
                  <button
                    onClick={() => {
                      setSubscribtionPlan(true);
                      setShowManagePharm(false);
                    }}
                  >
                    {t("subscriptionRenew")}
                  </button>
                </div>
              )}

              {activePage === "feedbacksPhar" && (
                <div className="setting">
                  <h2>{t("setting")}</h2>
                  <form onSubmit={handleFeedback} className="feedback-form">
                    <textarea
                      placeholder="Write a feedback..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                    />
                    <button type="submit">{t("sendFeedback")}</button>
                  </form>
                </div>
              )}
            </div>
          )}

        {user && user.role === "admin" && !showLogin && !SubscribtionPlan && (
          <div className="dashboard" onClick={(e) => e.stopPropagation()}>
            <button
              className="sidebarbtn"
              onClick={() => {
                setShowSideBarAdmin((prev) => !prev);
                setShowBareIconsAdmin((prev) => !prev);
              }}
            >
              <img src="icons/sidebarwhite.png" alt="" />
              <span className="tooltip">SideBar</span>
            </button>

            {showBareIconsAdmin && (
              <div className="bareicons">
                <button
                  className="barbtns"
                  onClick={() => setActivePage("subtable")}
                >
                  <img src="icons/dashboard.png" alt="" />
                  <span className="tooltip">Dashboard</span>
                </button>

                <button
                  className="barbtns"
                  onClick={() => setActivePage("notifAdmin")}
                >
                  <img src="icons/notification.png" alt="" />
                  <span className="tooltip">Notifications</span>
                </button>

                <button
                  className="barbtns"
                  onClick={() => setActivePage("Admins")}
                >
                  <img src="icons/join.png" alt="" />
                  <span className="tooltip">{t("admins")}</span>
                </button>

                <button
                  className="barbtns"
                  onClick={() => setActivePage("feedbacks")}
                >
                  <img src="icons/feedback.png" alt="" />
                  <span className="tooltip">Setting</span>
                </button>
              </div>
            )}

            {showSideBarAdmin && (
              <div className="sidebar">
                <div className="bars">
                  <button
                    className="barbtns"
                    onClick={() => setActivePage("subtable")}
                  >
                    Dashboard <img src="icons/dashboard (1).png" alt="" />
                  </button>

                  <button
                    className="barbtns"
                    onClick={() => setActivePage("notifAdmin")}
                  >
                    Notification <img src="icons/notification (1).png" alt="" />
                  </button>

                  <button
                    className="barbtns"
                    onClick={() => setActivePage("Admins")}
                  >
                    Admins <img src="icons/join.png" alt="" />
                  </button>

                  <button
                    className="barbtns"
                    onClick={() => setActivePage("feedbacks")}
                  >
                    Setting <img src="icons/feedback.png" alt="" />
                  </button>
                </div>
              </div>
            )}

            {activePage === "subtable" && (
              <div className="subtable">
                <table>
                  <thead>
                    <tr>
                      <th>Pharmacy Name</th>
                      <th>City</th>
                      <th>Date of Subscription</th>
                      <th>Remaining</th>
                      <th>Receipt / TxId</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pharmacies.map((item) => (
                      <tr key={item.id}>
                        <td>{item.pharmacyname}</td>
                        <td>{item.city}</td>
                        <td>
                          {item.subscription_date
                            ? new Date(
                                item.subscription_date,
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* ✅ Remaining */}
                        <td>
                          {item.subscription_date && item.plan_months
                            ? remainingLabel(
                                item.subscription_date,
                                item.plan_months,
                              )
                            : "-"}
                        </td>

                        {/* ✅ Receipt / TxId */}
                        <td>{item.receipt_id ? item.receipt_id : "-"}</td>

                        <td className={`status-of-pharm ${item.status}`}>
                          {item.status}
                        </td>

                        <td>
                          <div className="action">
                            <button
                              className="button"
                              onClick={() => sendMessageToPharmacy(item.id)}
                            >
                              send message
                            </button>
                            <button
                              className="active"
                              onClick={() => updateStatus(item.id, "active")}
                            >
                              Activate
                            </button>
                            <button
                              onClick={() => updateStatus(item.id, "pending")}
                            >
                              pending
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activePage === "notifAdmin" && (
              <div className="missinglist">
                <h3>{t("endedSubsTitle")}</h3>
                <ol>
                  <li>Umubjza / kigali </li>
                  <li>Mustafa / kigali</li>
                  <li>Umuganda / kigali</li>
                  <li>Unonimas / Sudan</li>
                </ol>
              </div>
            )}

            {activePage === "Admins" && (
              <div className="admins">
                <h3>{t("manageAdmins")}</h3>
                <ol>
                  <li>
                    mustafa@gmail.com / mustafa <button>{t("remove")}</button>
                  </li>
                  <li>
                    imipharm@gmail.com / mustafa <button>{t("remove")}</button>
                  </li>
                </ol>
                <button>{t("addNewAdmin")}</button>
              </div>
            )}

            {activePage === "feedbacks" && (
              <div className="feedback-admin">
                <div className="feedback-admin-head">
                  <h3>Feedbacks</h3>
                  <button type="button" onClick={fetchFeedbacks}>
                    Refresh
                  </button>
                </div>

                {!feedbacks || feedbacks.length === 0 ? (
                  <p className="muted">No feedbacks yet.</p>
                ) : (
                  <ul className="feedback-list">
                    {feedbacks.map((f) => (
                      <li key={f.id} className="feedback-item">
                        <div className="feedback-meta">
                          <span className="chip">{f.role || "unknown"}</span>
                          <span className="date">
                            {f.created_at
                              ? new Date(f.created_at).toLocaleString()
                              : ""}
                          </span>
                        </div>
                        <p className="feedback-text">{f.feedback}</p>
                        {f.email && <p className="feedback-email">{f.email}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* ✅ HOME HERO (kept) */}
        {!showResults &&
          !showLogin &&
          !SubscribtionPlan &&
          (!user || (user.role !== "pharmacy" && user.role !== "admin")) && (
            <div className="midiconCont">
              <div className="midicon">
                <h1>{t("heroTitle")}</h1>
                <h3>{t("heroDesc")}</h3>

                <div className="hero-actions">
                  <button
                    onClick={() => searchRef.current?.focus()}
                    className="btn-primary"
                  >
                    {t("searchBtn")}
                  </button>

                  <button
                    onClick={() => {
                      setSubscribtionPlan(true);
                      setShowManagePharm(false);
                    }}
                    className="btn-secondary"
                  >
                    {t("addPharmacyBtn")}
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* ✅ RESULTS (kept) */}
        {showResults && (
          <div className="farmacess">
            <div className="search-results">
              <div className="spaceover"></div>
              <h2 className="medText">{t("resultsTitle")}</h2>

              {searchResults.length === 0 ? (
                <p>{t("noPharmacyFound")}</p>
              ) : (
                searchResults.map((item) => (
                  <div key={item.id}>
                    <a
                      href={item.pharmacylocation}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        className={`farmaces plan-${item.plan_months || 1}`}
                      >
                        <h3 id="farmName">
                          <i>Pharmacy</i>: <b>{item.pharmacyname}</b>
                          <span
                            className={`tier-badge pm-${item.plan_months || 1}`}
                          >
                            {item.plan_months === 6
                              ? t("premiumBadge")
                              : item.plan_months === 3
                                ? t("standardBadge")
                                : t("basicBadge")}
                          </span>
                        </h3>

                        <p>
                          {t("inCity")} {item.city}
                        </p>

                        <img
                          src="icons/location.png"
                          className="farmlocat"
                          alt=""
                        />
                      </button>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ✅ SUBSCRIPTION PLANS (NOT REMOVED) */}
        {SubscribtionPlan && !showResults && (
          <div className="plansContainer">
            <h2 className="plans-title">{t("plansTitle")}</h2>

            <div className="SubscribtionPlans">
              <div className="plan1 plan">
                <h3>{t("basicPlan")}</h3>
                <p className="plan-tagline">{t("startSmall")}</p>
                <p className="old-price">10,000 RWF</p>
                <h1>
                  FREE<span className="mo"></span>
                </h1>

                <ul>
                  <li>{t("listed")}</li>
                  <li>{t("locationInstant")}</li>
                  <li>{t("dashboardAccess")}</li>
                </ul>

                <p className="plan-note">{t("basicNote")}</p>

                <button
                  onClick={() => {
                    const plan = PLANS[1];
                    setSelectedPlanMonths(plan.months);
                    setSelectedPlanTotal(plan.total);
                    setShowLogin(true);
                    setShowRegister(true);
                    setSubscribtionPlan(false);
                  }}
                >
                  {t("activateBasic")}
                </button>
              </div>

              <div className="offer plan">
                <p>
                  {t("twoMonthsFreeBanner").replace("FREE", "")}{" "}
                  <span className="free">FREE</span>
                </p>

                <div className="plan2 plan">
                  <h3>{t("premiumPlan")}</h3>
                  <p className="plan-badge">{t("mostPopular")}</p>
                  <p className="old-price">7,000 RWF</p>
                  <h1>
                    5,000 <span className="mo">RWF / {t("month")}</span>
                  </h1>

                  <p className="plan-duration">
                    {t("total")} 20,000 RWF for 6 {t("months")}
                  </p>
                  <p className="old-price">
                    {t("total")} 30,000 RWF for 6{t("months")}
                  </p>

                  <p className="plan-highlight">{t("twoMonthsFree")}</p>

                  <ul>
                    <li>{t("everythingInStandard")}</li>
                    <li>{t("topPriorityListing")}</li>
                    <li>{t("maxExposure")}</li>
                    <li>{t("bestValue")}</li>
                    <li>{t("higherTrust")}</li>
                  </ul>

                  <p className="plan-note">{t("premiumNote")}</p>

                  <button
                    onClick={() => {
                      const plan = PLANS[6];
                      setSelectedPlanMonths(plan.months);
                      setSelectedPlanTotal(plan.total);
                      setShowLogin(true);
                      setShowRegister(true);
                      setSubscribtionPlan(false);
                    }}
                  >
                    {t("upgradePremium")}
                  </button>
                </div>
              </div>

              <div className="plan3 plan">
                <h3>{t("standardPlan")}</h3>
                <p className="plan-tagline">{t("betterVisibility")}</p>

                <h1>
                  6,000 <span className="mo">RWF / {t("month")}</span>
                </h1>

                <p className="plan-duration">
                  {t("total")} 18,000 RWF for 3 {t("months")}
                </p>

                <ul>
                  <li>{t("everythingInBasic")}</li>
                  <li>{t("priorityListing")}</li>
                  <li>{t("missingNotif")}</li>
                  <li>{t("marketDemandFeature")}</li>
                </ul>

                <p className="plan-note">{t("standardNote")}</p>

                <button
                  onClick={() => {
                    const plan = PLANS[3];
                    setSelectedPlanMonths(plan.months);
                    setSelectedPlanTotal(plan.total);
                    setShowLogin(true);
                    setShowRegister(true);
                    setSubscribtionPlan(false);
                  }}
                >
                  {t("chooseStandard")}
                </button>
              </div>
            </div>

            <div className="plans-footer-cta">
              <h3>{t("plansFooterTitle")}</h3>
              <p>{t("plansFooterDesc")}</p>
            </div>
          </div>
        )}

        {/* ✅ LOGIN/REGISTER (kept) */}
        {showLogin && !showResults && !SubscribtionPlan && (
          <div className="logincontain">
            {!showRegister ? (
              <form className="login" onSubmit={handleLogin}>
                <h1>{t("login")}</h1>

                <input
                  type="email"
                  placeholder={t("email")}
                  className="feilds"
                  onChange={(e) =>
                    setLoginValue({ ...loginValue, email: e.target.value })
                  }
                />

                <div className="password">
                  <input
                    type={showPasswordLogin ? "text" : "password"}
                    placeholder={t("password")}
                    className="passwordfeild"
                    onChange={(e) =>
                      setLoginValue({ ...loginValue, password: e.target.value })
                    }
                  />
                  <img
                    src={showPasswordLogin ? "icons/hide.png" : "icons/eye.png"}
                    alt=""
                    onClick={() => setShowPasswordLogin((prev) => !prev)}
                  />
                </div>

                <div className="authRow">
                  <label className="authCheck">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="authLinkBtn"
                    onClick={() => {
                      setForgotOpen(true);
                      setForgotMsg("");
                      setForgotEmail(email || "");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button className="loginbtn" type="submit">
                  {t("login")}
                </button>

                <button
                  type="button"
                  className="newregbtn"
                  onClick={() => {
                    setShowLogin(false);
                    setSubscribtionPlan(true);
                    setShowRegister(false);
                  }}
                >
                  <h3>{t("newRegistration")}</h3>
                </button>
              </form>
            ) : (
              <form className="register" onSubmit={handleRegister}>
                <div className="register-dev">
                  <div className="receipt">
                    <h1>{t("register")}</h1>

                    {!selectedPlanMonths && (
                      <p style={{ color: "red" }}>{t("choosePlanFirst")}</p>
                    )}

                    {selectedPlanMonths && selectedPlanMonths !== 1 && (
                      <div className="paymentNotice">
                        <h2>
                          {t("confirmPaymentOf")}{" "}
                          <b>{selectedPlanTotal.toLocaleString()} RWF</b>{" "}
                          {t("for")}{" "}
                          <b>
                            {selectedPlanMonths}{" "}
                            {selectedPlanMonths === 1
                              ? t("month")
                              : t("months")}
                          </b>
                        </h2>

                        <div className="payment-number">
                          <h3>{t("paymentNumber")}</h3>
                          <div className="number-sec">
                            {showNumber && <h4>0794101251</h4>}
                            <button
                              type="button"
                              onClick={() => setShowNumber(true)}
                            >
                              {t("view")}
                            </button>
                          </div>
                        </div>

                        <p>{t("afterPayment")}</p>

                        <input
                          type="text"
                          placeholder={t("receiptPlaceholder")}
                          className="feilds"
                          value={receiptId}
                          onChange={(e) => setReceiptId(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {selectedPlanMonths === 1 && (
                      <div className="paymentNotice">
                        <h2>Basic plan is FREE ✅</h2>
                        <p>
                          No payment or receipt is required. You will be
                          registered immediately.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="receipt-line"></div>

                  <div className="register-form">
                    <input
                      type="email"
                      placeholder={t("email")}
                      className="feilds"
                      onChange={(e) =>
                        setValues({ ...values, email: e.target.value })
                      }
                    />

                    <input
                      type="text"
                      placeholder={t("pharmacyName")}
                      className="feilds"
                      onChange={(e) =>
                        setValues({ ...values, pharmacyname: e.target.value })
                      }
                    />

                    <input
                      type="url"
                      placeholder={t("pharmacyLocation")}
                      className="feilds"
                      onChange={(e) =>
                        setValues({
                          ...values,
                          pharmacylocation: e.target.value,
                        })
                      }
                    />

                    <input
                      type="text"
                      placeholder={t("city")}
                      className="feilds"
                      onChange={(e) =>
                        setValues({ ...values, city: e.target.value })
                      }
                    />

                    <div className="password">
                      <input
                        type={showPasswordRegister ? "text" : "password"}
                        placeholder={t("password")}
                        className="passwordfeild"
                        onChange={(e) =>
                          setValues({ ...values, password: e.target.value })
                        }
                      />
                      <img
                        src={
                          showPasswordRegister
                            ? "icons/hide.png"
                            : "icons/eye.png"
                        }
                        alt=""
                        onClick={() => setShowPasswordRegister((prev) => !prev)}
                      />
                    </div>

                    <div className="line"></div>

                    <button className="loginbtn" type="submit">
                      {t("register")}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
        {forgotOpen && (
          <div
            className="authModalOverlay"
            onClick={() => setForgotOpen(false)}
          >
            <div className="authModal" onClick={(e) => e.stopPropagation()}>
              <h3>Reset Password</h3>
              <p>Enter your email and we will send a reset link.</p>

              <input
                className="authInput"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@pharmacy.com"
              />

              {forgotMsg && <div className="authHint">{forgotMsg}</div>}

              <div className="authModalActions">
                <button
                  className="authBtn ghost"
                  type="button"
                  onClick={() => setForgotOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="authBtn"
                  type="button"
                  disabled={forgotLoading}
                  onClick={async () => {
                    try {
                      setForgotLoading(true);
                      const r = await axios.post(
                        "http://localhost:8081/forgot-password",
                        { email: forgotEmail.trim() },
                        { withCredentials: true },
                      );
                      setForgotMsg(r.data?.message || "Check your email.");
                    } catch (e) {
                      setForgotMsg("Failed to send reset link.");
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                >
                  {forgotLoading ? "Sending..." : "Send link"}
                </button>
              </div>
            </div>
          </div>
        )}
        {showLoading && (
          <div className="loading">
            <h3>{t("loading")}</h3>
            <div className="loadinicon">
              <img src="icons/loading.png" alt="loading" />
            </div>
          </div>
        )}

        {showManagePharm && (
          <div
            className="managementofpharm"
            onClick={(e) => {
              e.stopPropagation();
              setShowSideMenu(false);
            }}
          >
            <button
              className="addpharm"
              onClick={() => {
                setSubscribtionPlan(true);
                setShowManagePharm(false);
              }}
            >
              <img src="icons/medicine.png" alt="" />
              <h3>{t("addPharmacyBtn")}</h3>
            </button>

            <button
              className="existpharm"
              onClick={() => {
                setShowLogin(true);
                setShowRegister(false);
                setShowManagePharm(false);
                setSubscribtionPlan(false);
              }}
            >
              Manage an existing Pharmacy
            </button>
          </div>
        )}

        {showSideMenu && (
          <div className="saidmenu" onClick={(e) => e.stopPropagation()}>
            {/* <button className="menubtns">
              {t("location")} <img src="icons/location.png" alt="" />
              <img src="icons/down-chevron.png" alt="" />
            </button> */}
            <button
              className="menubtns"
              onClick={(e) => {
                e.stopPropagation();
                setShowLanguages((prev) => !prev);
                setShowSideMenu(false);
              }}
            >
              {t("language")} <img src="icons/language.png" alt="" />
              <img src="icons/down-chevron.png" alt="" />
            </button>

            <button
              className="menubtns"
              onClick={() => setShowManagePharm(!showManagePharm)}
            >
              {t("pharmacies")} <img src="icons/pharmacy (1).png" alt="" />
              <img src="icons/down-chevron.png" alt="" />
            </button>
            <button
              className="menubtns"
              onClick={() => {
                const target = aboutRef.current;
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {t("footerAbout")}
              <img src="/icons/info.png" alt="" />
            </button>
          </div>
        )}
      </main>

      {showFooter && (
        <footer className="site-footer" onClick={(e) => e.stopPropagation()}>
          <div className="footer-top">
            {/* Brand */}
            <div className="footer-brand">
              <div className="brand-row">
                <div className="brand-logo" aria-hidden="true">
                  {/* لو عندك لوقو جاهز استبدلها بصورة */}
                  <img
                    src="icons/imiPharm-logo.png"
                    alt="imiPharm"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="brand-mark">iPh</span>
                </div>

                <div className="brand-text">
                  <h3 className="brand-name">imiPharm</h3>
                  <p className="brand-tagline">{t("footerTagline")}</p>
                </div>
              </div>

              <p className="brand-desc">{t("footerDesc")}</p>

              <div className="footer-contact">
                <a className="contact-link" href="mailto:imipharm@gmail.com">
                  <span className="contact-label">{t("footerEmail")}:</span>{" "}
                  imiPharm@gmail.com
                </a>
                <a
                  className="contact-link"
                  href="http://wa.me/250794101251"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="contact-label">{t("footerWhatsApp")}:</span>{" "}
                  +250 794 101 251
                </a>
              </div>
            </div>

            {/* Columns */}
            <div className="footer-columns">
              <div className="footer-col">
                <h4>{t("footerProduct")}</h4>
                <ul>
                  <li>
                    <a
                      onClick={() => {
                        searchRef.current?.focus();
                      }}
                    >
                      {t("footerSearch")}
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        setSubscribtionPlan(true);
                        setShowManagePharm(false);
                      }}
                    >
                      {t("footerPlans")}
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        setShowLogin(true);
                        setShowRegister(false);
                        setShowManagePharm(false);
                        setSubscribtionPlan(false);
                      }}
                    >
                      {t("footerDashboard")}
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        setShowLogin(true);
                        setShowRegister(false);
                        setShowManagePharm(false);
                        setSubscribtionPlan(false);
                      }}
                    >
                      {t("footerNotifications")}
                    </a>
                  </li>
                </ul>
              </div>

              <div ref={aboutRef} className="footer-col">
                <h4>{t("footerCompany")}</h4>
                <ul>
                  <li>
                    <a href="#contact">{t("footerContact")}</a>
                  </li>
                  <li>
                    <a href="#careers">{t("footerCareers")}</a>
                  </li>
                  <li>
                    <a href="#press">{t("footerPress")}</a>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>{t("footerResources")}</h4>
                <ul>
                  <li>
                    <a href="#help">{t("footerHelpCenter")}</a>
                  </li>
                  <li>
                    <a href="#support">{t("footerSupport")}</a>
                  </li>
                  <li>
                    <a href="#status">{t("footerStatus")}</a>
                  </li>
                  <li>
                    <a href="#faq">{t("footerFAQ")}</a>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>{t("footerLegal")}</h4>
                <ul>
                  <li>
                    <a href="#privacy">{t("footerPrivacy")}</a>
                  </li>
                  <li>
                    <a href="#terms">{t("footerTerms")}</a>
                  </li>
                  <li>
                    <a href="#cookies">{t("footerCookies")}</a>
                  </li>
                  <li>
                    <a href="#security">{t("footerSecurity")}</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter */}
            <div className="footer-newsletter">
              <h4>{t("footerNewsletterTitle")}</h4>
              <p>{t("footerNewsletterDesc")}</p>

              <form
                className="newsletter-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(t("footerNewsletterSoon"));
                }}
              >
                <input
                  type="email"
                  placeholder={t("footerNewsletterPlaceholder")}
                  required
                />
                <button type="submit">{t("footerSubscribe")}</button>
              </form>

              <div className="footer-social">
                <a href="mailto:imipharm@gmail.com" aria-label="Email">
                  <img src="icons/email.png" alt="Email" />
                </a>

                <a
                  href="http://wa.me/250794101251"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <img src="icons/whatsapp.png" alt="WhatsApp" />
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=61588469307259"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <img src="icons/facebook.png" alt="Facebook" />
                </a>

                <a
                  href="https://www.instagram.com/imipharm250/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <img src="icons/instgram.png" alt="Instagram" />
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="bottom-left">
              <p>
                © {new Date().getFullYear()} imiPharm. {t("rights")}
              </p>
              <p className="bottom-muted">{t("footerBuiltFor")}</p>
            </div>

            <div className="bottom-right">
              <button
                type="button"
                className="footer-lang"
                onClick={() => alert(t("footerLangHint"))}
              >
                {t("footerLanguage")} •{" "}
                {language === "rw" ? "Kinyarwanda" : "English"}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
