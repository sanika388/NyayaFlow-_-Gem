import "./App.css";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid, // Add these five
} from "recharts";
import {
  Upload,
  Calendar,
  Building,
  ShieldCheck,
  FileText,
  X,
  Save,
  LayoutDashboard,
  ClipboardCheck,
  Search,
  AlertCircle,
  Edit2,
  Trash2,
  Clock,
  Loader2,
  Landmark,
  Layers,
  LogOut,
} from "lucide-react";

const generateAppealContent = (item) => {
  const today = new Date().toLocaleDateString("en-IN");
  return `
FIRST APPEAL UNDER SECTION 19(1) OF THE RTI ACT, 2005

To,
The First Appellate Authority,
${item.ministry_name},
${item.dept_name}.

Date: ${today}

Subject: First Appeal under Section 19(1) regarding RTI Registration No: ${item.reg_number}

1. Name of Appellant: [Your Name]
2. Address: [Your Address]
3. Date of RTI Filing: ${item.filing_date}

4. Grounds for Appeal:
   DEEMED REFUSAL under Section 7(1). No response was received within the mandatory 30-day period.

5. Prayer:
   I request you to direct the CPIO to provide the requested information immediately and free of cost.

Verification:
I declare that the particulars stated above are true to the best of my knowledge.

  [PASTE SIGNATURE IMAGE HERE]

__________________________

Signature of the Appellant


Name: [Type Full Name]

Place: [Type City/State]

Date: ${new Date().toLocaleDateString("en-IN")}
  `;
};
const COLORS = ["#2563eb", "#f59e0b", "#ef4444"];
const generateAppealPDF = (item) => {
  const initialContent = generateAppealContent(item);

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>First Appeal - ${item.reg_number}</title>
        <style>
          body { font-family: "Times New Roman", serif; padding: 60px; line-height: 1.6; color: #000; }
          .toolbar { 
            background: #f8fafc; 
            padding: 15px; 
            position: fixed; 
            top: 0; left: 0; right: 0; 
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            gap: 12px;
            align-items: center;
            z-index: 1000;
          }
          .editable-area { 
            white-space: pre-wrap; 
            font-size: 15px; 
            border: 1px dashed #cbd5e1; 
            padding: 30px;
            outline: none;
            margin-top: 60px;
          }
          .btn { background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
          .btn-lang { background: #64748b; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
          @media print { .toolbar { display: none; } .editable-area { border: none; padding: 0; margin-top: 0; } }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button class="btn" onclick="window.print()">Download / Print PDF</button>
          <button class="btn-lang" onclick="updateLang('en')">English</button>
          <button class="btn-lang" onclick="updateLang('hi')">Hindi (हिंदी)</button>
          <button class="btn-lang" onclick="updateLang('mr')">Marathi (मराठी)</button>
        </div>

        <div id="appeal-content" class="editable-area" contenteditable="true">${initialContent}</div>

        <script>
          // We pass the data into the window so the buttons can use it
          const itemData = ${JSON.stringify(item)};
          
          // These are the same templates but inside the script tag of the popup
          const templates = {
            en: (item) => \`${generateAppealContent(item)}\`,
            hi: (item) => \`सूचना का अधिकार अधिनियम, 2005 की धारा 19(1) के तहत प्रथम अपील... (Paste Full Hindi Template Here)\`,
            mr: (item) => \`माहिती अधिकार अधिनियम, २००५ च्या कलम १९(१) अन्वये प्रथम अपील... (Paste Full Marathi Template Here)\`
          };

          function updateLang(lang) {
            const container = document.getElementById('appeal-content');
            if (lang === 'hi') {
                container.innerText = \`${RTI_TEMPLATES.hi(item)}\`;
            } else if (lang === 'mr') {
                container.innerText = \`${RTI_TEMPLATES.mr(item)}\`;
            } else {
                container.innerText = \`${initialContent}\`;
            }
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
const RTI_TEMPLATES = {
  mr: (item) => `
    माहिती अधिकार अधिनियम, २००५ च्या कलम १९(१) अन्वये प्रथम अपील
    
    प्रति,
    प्रथम अपिलीय अधिकारी,
    ${item.ministry_name}, ${item.dept_name}
    
    विषय: माहिती अधिकार अर्ज क्र. ${item.reg_number} बाबत प्रथम अपील.
    
    १. अपिलाचे नाव: [तुमचे नाव येथे लिहा]
    २. पत्ता: [तुमचा पत्ता येथे लिहा]
    
    ३. मूळ अर्जाचा तपशील:
       - नोंदणी क्रमांक: ${item.reg_number}
       - अर्ज केल्याचा दिनांक: ${new Date(item.filing_date).toLocaleDateString("en-IN")}
    
    ४. अपिलाचे कारण: 
       कलम ७(१) अन्वये निर्धारित ३० दिवसांच्या कालावधीत कोणतीही माहिती प्राप्त झाली नाही (Deemed Refusal).
    
    ५. अपेक्षित दाद:
       कृपया जन माहिती अधिकाऱ्यास विनंती केलेली माहिती विनामूल्य आणि त्वरित देण्याचे आदेश द्यावेत.
    
    सत्यता पडताळणी:
    मी याद्वारे घोषित करतो की वरील माहिती माझ्या माहितीनुसार सत्य आणि बिनचूक आहे.
    
    [येथे स्वाक्षरीची प्रतिमा टाका / PASTE SIGNATURE IMAGE HERE]
    __________________________
    अपीलकर्त्याची स्वाक्षरी
    
    नाव: [पूर्ण नाव टाइप करा]
    ठिकाण: [शहर/राज्य टाइप करा]
    दिनांक: ${new Date().toLocaleDateString("en-IN")}
  `,
  hi: (item) => `
    सूचना का अधिकार अधिनियम, 2005 की धारा 19(1) के तहत प्रथम अपील
    
    सेवा में,
    प्रथम अपीलीय अधिकारी,
    ${item.ministry_name}, ${item.dept_name}
    
    विषय: आरटीआई आवेदन संख्या ${item.reg_number} के संबंध में प्रथम अपील।
    
    1. अपीलकर्ता का नाम: [अपना नाम यहाँ लिखें]
    2. पता: [अपना पता यहाँ लिखें]
    
    3. आरटीआई आवेदन का विवरण:
       - पंजीकरण संख्या: ${item.reg_number}
       - आवेदन की तिथि: ${new Date(item.filing_date).toLocaleDateString("en-IN")}
    
    4. अपील का आधार: 
       धारा 7(1) के तहत निर्धारित 30 दिनों के भीतर कोई जानकारी प्राप्त नहीं हुई (Deemed Refusal)।
    
    5. मांगा गया अनुतोष (Relief):
       कृपया जन सूचना अधिकारी को मांगी गई जानकारी निःशुल्क और तत्काल प्रदान करने का निर्देश दें।
    
    सत्यापन:
    मैं एतद्द्वारा घोषित करता हूँ कि ऊपर दी गई जानकारी मेरी सर्वोत्तम जानकारी के अनुसार सत्य है।
    
    [यहाँ हस्ताक्षर की छवि पेस्ट करें]
    __________________________
    अपीलकर्ता के हस्ताक्षर
    
    नाम: [पूरा नाम टाइप करें]
    स्थान: [शहर/राज्य टाइप करें]
    दिनांक: ${new Date().toLocaleDateString("en-IN")}
  `,
};

// Helper for date inputs - required for real-world deployment
const formatDateForInput = (dateStr) => {
  if (!dateStr || dateStr === "—" || dateStr === "") return "";
  try {
    const d = new Date(dateStr);
    return d.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

//   Cleans OCR hallucinations
const cleanOCRDate = (dateStr) => {
  if (!dateStr || dateStr === "—") return "";
  if (dateStr.length > 10 || dateStr.includes("/") || !dateStr.includes("-")) {
    return "";
  }
  return dateStr;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [history, setHistory] = useState([]);
  // ... any other states (isReviewing, data, etc.)

  const isLoggedIn = !!token;
  const [activeField, setActiveField] = useState(null);
  const [file, setFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [data, setData] = useState({});

  const [tableLoading, setTableLoading] = useState(false);

  const [isReviewing, setIsReviewing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentView, setCurrentView] = useState("audit");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cases, setCases] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const ministryList = [
    "Ministry of Agriculture & Farmers Welfare",
    "Ministry of AYUSH",
    "Ministry of Chemicals & Fertilizers",
    "Ministry of Civil Aviation",
    "Ministry of Coal",
    "Ministry of Commerce & Industry",
    "Ministry of Communications",
    "Ministry of Consumer Affairs, Food & Public Distribution",
    "Ministry of Corporate Affairs",
    "Ministry of Culture",
    "Ministry of Defence",
    "Ministry of Development of North Eastern Region",
    "Ministry of Earth Sciences",
    "Ministry of Education",
    "Ministry of Electronics & Information Technology",
    "Ministry of Environment, Forest & Climate Change",
    "Ministry of External Affairs",
    "Ministry of Finance",
    "Ministry of Fisheries, Animal Husbandry & Dairying",
    "Ministry of Food Processing Industries",
    "Ministry of Health & Family Welfare",
    "Ministry of Heavy Industries",
    "Ministry of Home Affairs",
    "Ministry of Housing & Urban Affairs",
    "Ministry of Information & Broadcasting",
    "Ministry of Jal Shakti",
    "Ministry of Labour & Employment",
    "Ministry of Law & Justice",
    "Ministry of Micro, Small & Medium Enterprises",
    "Ministry of Mines",
    "Ministry of Minority Affairs",
    "Ministry of New & Renewable Energy",
    "Ministry of Panchayati Raj",
    "Ministry of Parliamentary Affairs",
    "Ministry of Personnel, Public Grievances & Pensions",
    "Ministry of Petroleum & Natural Gas",
    "Ministry of Power",
    "Ministry of Railways",
    "Ministry of Road Transport & Highways",
    "Ministry of Rural Development",
    "Ministry of Science & Technology",
    "Ministry of Skill Development & Entrepreneurship",
    "Ministry of Social Justice & Empowerment",
    "Ministry of Statistics & Programme Implementation",
    "Ministry of Steel",
    "Ministry of Textiles",
    "Ministry of Tourism",
    "Ministry of Tribal Affairs",
    "Ministry of Women & Child Development",
    "Ministry of Youth Affairs & Sports",
  ];

  const sectionList = [
    "Administration Section",
    "Accounts Section",
    "Audit Section",
    "Cash Section",
    "Coordination Section",
    "Establishment Section",
    "General Section",
    "Legal Section",
    "Policy Section",
    "RTI Cell",
    "Technical Section",
    "Vigilance Section",
    "Advertisement Section",
    "O&M Section",
    "ISTM (Institute of Secretariat Training & Management)",
    "RTI-I Section",
    "IPS-IV Section",
  ];
  // 2. DEFINE THE FUNCTIONS
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    // DEBUG: Check if React actually has your typing
    console.log("Sending to Backend:", credentials);

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username: credentials.username.trim(), // Removes accidental spaces
        password: credentials.password.trim(),
      });

      const newToken = response.data.access_token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
    } catch (err) {
      // If the backend returns 401, this catches it
      setLoginError(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setHistory([]);
  };

  useEffect(() => {
    if (token) {
      // Assuming fetchHistory is defined elsewhere in your file
      fetchHistory(token);
    }
  }, [token]);

  const filteredHistory = useMemo(() => {
    // If there's no history at all, return an empty list
    if (!history || history.length === 0) return [];

    return history.filter((item) => {
      // 1. GHOST PROTECTION: More relaxed check
      // In a real system, we want to see it even if it's messy, unless it's totally empty
      const reg = item.reg_number || "";
      if (reg === "" || reg === "—") return false;

      // 2. SEARCH MATCH
      const search = searchQuery.toLowerCase();
      const matchesSearch =
        reg.toLowerCase().includes(search) ||
        (item.dept_name || "").toLowerCase().includes(search) ||
        (item.ministry_name || "").toLowerCase().includes(search);

      // 3. DEPARTMENT MATCH
      const matchesDept =
        selectedDept === "All Departments" || item.dept_name === selectedDept;

      // 4. DATE MATCH (The common culprit!)
      // If the date is invalid or "0000-00-00", we should still show it for audit
      // 4. DATE MATCH (FIXED FOR EMPTY DATES)
      const itemDate = new Date(item.filing_date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      // If date is invalid, keep it for audit. Otherwise, check boundaries safely.
      const matchesDate =
        isNaN(itemDate.getTime()) ||
        ((!start || itemDate >= start) && (!end || itemDate <= end));

      // 5. STATUS MATCH
      const diff = item.reply_date
        ? Math.max(
            0,
            Math.ceil(
              (new Date(item.reply_date) - new Date(item.filing_date)) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : null;
      let matchesStatus = true;
      if (statusFilter === "Compliant")
        matchesStatus = diff !== null && diff <= 30;
      else if (statusFilter === "Delayed")
        matchesStatus = diff !== null && diff > 30;
      else if (statusFilter === "Unanswered")
        matchesStatus =
          !item.reply_date || item.reply_date === "" || item.reply_date === "—";

      // The RTI must pass ALL tests to be seen
      return matchesSearch && matchesDept && matchesDate && matchesStatus;
    });
  }, [history, searchQuery, startDate, endDate, selectedDept, statusFilter]);
  const trendData = useMemo(() => {
    // 1. Use filteredHistory instead of history
    if (!filteredHistory || filteredHistory.length === 0) return [];

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize map
    const statsMap = {};

    // 2. Logic: If user picked a date range, only show those months.
    // Otherwise, default to your "Last 6 Months" logic.
    if (startDate && endDate) {
      let start = new Date(startDate);
      let end = new Date(endDate);
      let temp = new Date(start);

      while (temp <= end) {
        const mName = monthNames[temp.getMonth()];
        statsMap[mName] = { month: mName, filed: 0, resolved: 0 };
        temp.setMonth(temp.getMonth() + 1);
      }
    } else {
      // Fallback to your original "Last 6 Months" loop if no dates are selected
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mName = monthNames[d.getMonth()];
        statsMap[mName] = { month: mName, filed: 0, resolved: 0 };
      }
    }

    // 3. Loop through filteredHistory
    filteredHistory.forEach((rti) => {
      const getMonthName = (dateStr) => {
        if (!dateStr || dateStr === "—" || dateStr === "") return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : monthNames[d.getMonth()];
      };

      const fMonth = getMonthName(rti.filing_date);
      if (fMonth && statsMap[fMonth]) {
        statsMap[fMonth].filed++;
      }

      const rMonth = getMonthName(rti.reply_date);
      if (rMonth && statsMap[rMonth]) {
        statsMap[rMonth].resolved++;
      }
    });

    return Object.values(statsMap);
  }, [filteredHistory, startDate, endDate]); // Added all three dependencies

  const { stats, medianResponse, ministryStats } = useMemo(() => {
    const today = new Date();

    const validHistory = (filteredHistory || []).filter(
      (h) => h.reg_number && h.reg_number !== "—" && h.reg_number !== "",
    );

    const total = validHistory.length;
    const repliedCases = validHistory.filter(
      (h) => h.reply_date && h.reply_date !== "—" && h.reply_date !== "",
    );
    const unansweredCases = validHistory.filter(
      (h) => !h.reply_date || h.reply_date === "—" || h.reply_date === "",
    );
    const allDiffs = repliedCases
      .map((h) =>
        Math.ceil(
          (new Date(h.reply_date) - new Date(h.filing_date)) /
            (1000 * 60 * 60 * 24),
        ),
      )
      .sort((a, b) => a - b);
    const compliant = repliedCases.filter((h) => {
      const diff = Math.ceil(
        (new Date(h.reply_date) - new Date(h.filing_date)) /
          (1000 * 60 * 60 * 24),
      );
      return diff <= 30;
    }).length;

    const delayed = repliedCases.length - compliant;

    const deemed = unansweredCases.filter((h) => {
      // 2. THE DATE CHECK: If filing_date is missing or invalid, don't calculate!
      if (!h.filing_date || h.filing_date === "0000-00-00") return false;

      const filingDate = new Date(h.filing_date);
      if (isNaN(filingDate.getTime())) return false;

      const diff = Math.ceil((today - filingDate) / (1000 * 60 * 60 * 24));
      return diff > 30;
    }).length;
    const minMap = {};
    validHistory.forEach((h) => {
      // 1. Convert everything to lowercase first, then trim spaces
      let name = (h.ministry_name || "General / Unknown").trim().toLowerCase();

      // 2. Standardize the "of" and "and" for the display

      const cleanName = name
        .split(" ")
        .map((word) => {
          if (word === "of" || word === "and") return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");

      minMap[cleanName] = (minMap[cleanName] || 0) + 1;
    });
    const waiting = unansweredCases.length - deemed;
    const liveMinistryData = Object.keys(minMap)
      .map((name) => {
        // 1. Find all cases belonging to this specific ministry
        const deptCases = validHistory.filter((h) => {
          const raw = (h.ministry_name || "General / Unknown")
            .trim()
            .toLowerCase();

          const clean = raw
            .split(" ")
            .map((w) =>
              w === "of" || w === "and"
                ? w
                : w.charAt(0).toUpperCase() + w.slice(1),
            )
            .join(" ");
          return clean === name;
        });

        // 2. Filter cases that actually have a reply to calculate average
        const repliedCasesForDept = deptCases.filter(
          (h) => h.reply_date && h.reply_date !== "—",
        );

        let avg = 0;
        if (repliedCasesForDept.length > 0) {
          const totalDays = repliedCasesForDept.reduce((sum, h) => {
            const diff = Math.ceil(
              (new Date(h.reply_date) - new Date(h.filing_date)) /
                (1000 * 60 * 60 * 24),
            );
            return sum + (diff > 0 ? diff : 0);
          }, 0);
          avg = Math.round(totalDays / repliedCasesForDept.length);
        }

        return {
          name: name,
          total: deptCases.length,
          avg: avg > 0 ? avg : "—", // Returns the number or a dash if no replies
        };
      })
      .sort((a, b) => b.total - a.total);
    let median = 0;
    let p90 = 0;
    if (allDiffs.length > 0) {
      const mid = Math.floor(allDiffs.length / 2);
      median =
        allDiffs.length % 2 !== 0
          ? allDiffs[mid]
          : (allDiffs[mid - 1] + allDiffs[mid]) / 2;
      p90 =
        allDiffs[Math.floor(allDiffs.length * 0.9)] ||
        allDiffs[allDiffs.length - 1];
    }

    return {
      stats: { total, compliant, delayed, waiting, deemed, p90 },
      medianResponse: Math.round(median),
      ministryStats: liveMinistryData,
    };
  }, [filteredHistory]); // NEW: Now it re-runs when dates change

  const fetchHistory = async (passedToken = null) => {
    const activeToken = passedToken || token || localStorage.getItem("token");

    if (!activeToken) return;

    setTableLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/cases", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      // ये दोनों लाइनें डेटा दिखाने के लिए ज़रूरी हैं
      setHistory(response.data); // इससे आपकी टेबल भरेगी
      setCases(response.data); // इससे आपके चार्ट्स दिखेंगे
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setTableLoading(false);
    }
  };

  const deleteCase = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this record? This cannot be undone.",
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/cases/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchHistory();
        alert("Record deleted successfully.");
      } catch (err) {
        console.error("Delete error:", err);
        alert("Delete failed.");
      }
    }
  };

  const editCase = (item) => {
    const sanitizedData = {
      ...item,
      id: item.id,
      filing_date: formatDateForInput(item.filing_date),
      reply_date: formatDateForInput(item.reply_date),
    };
    setData(sanitizedData);
    setIsReviewing(true);
    if (item.filename)
      setPdfUrl(`http://localhost:5000/uploads/${item.filename}`);
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/upload",
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // 1. Capture the data from Gemini
      const { extracted_data, filename } = response.data;

      // 2. Map it to the state (cleaning dates for the HTML input)
      setData({
        ...extracted_data,
        filename: filename,
        filing_date: formatDateForInput(extracted_data.filing_date),
        reply_date: formatDateForInput(extracted_data.reply_date),
      });

      // 3. Set the PDF preview and Open the Review UI
      setPdfUrl(`http://127.0.0.1:5000/uploads/${filename}`);
      setIsReviewing(true);
    } catch (err) {
      console.error("Scan Error:", err);
      alert("Scan Failed. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSync = async () => {
    setLoading(true);
    try {
      // Send the edited/verified data to the database
      await axios.post(
        "http://127.0.0.1:5000/api/confirm-rti",
        data, // This is the state object you edited in the UI
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Data Synced to Database Successfully!");

      // Reset the UI
      setIsReviewing(false);
      setData(null);

      // Refresh the Audit table to show the new record
      fetchHistory();
    } catch (err) {
      console.error("Sync Error:", err);
      alert("Failed to save to database.");
    } finally {
      setLoading(false);
    }
  };
  const exportToCSV = () => {
    // 1. Check if we have data from your useMemo
    if (!ministryStats || ministryStats.length === 0) {
      alert("No analysis data available to export!");
      return;
    }

    const csvRows = [];

    // --- SECTION 1: SYSTEM HEADER & GLOBAL KPIs ---
    csvRows.push("NYAYAFLOW - RTI COMPLIANCE ANALYSIS REPORT");
    csvRows.push(`Generated On:,"${new Date().toLocaleString("en-IN")}"`);
    csvRows.push(""); // Spacer

    csvRows.push("EXECUTIVE SUMMARY (KPIs)");
    csvRows.push(`Total RTI Applications,${stats.total || 0}`);
    csvRows.push(`Compliant (within 30 days),${stats.compliant || 0}`);
    csvRows.push(`Delayed Responses,${stats.delayed || 0}`);
    csvRows.push(
      `Deemed Refusals (Over 30 days - No Reply),${stats.deemed || 0}`,
    );
    csvRows.push(`Pending/In-Progress,${stats.waiting || 0}`);
    csvRows.push(`Median Response Time,${medianResponse || 0} Days`);
    csvRows.push(`90th Percentile (P90) Response,${stats.p90 || 0} Days`);

    // Calculate Compliance Percentage for the report
    const complianceRate =
      stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(2) : 0;
    csvRows.push(`Overall Compliance Rate,${complianceRate}%`);

    csvRows.push(""); // Spacer
    csvRows.push(""); // Spacer

    // --- SECTION 2: MINISTRY PERFORMANCE TABLE ---
    csvRows.push("MINISTRY-WISE PERFORMANCE BREAKDOWN");
    csvRows.push("Ministry Name,Total Cases,Avg Turnaround Time (Days)");

    ministryStats.forEach((m) => {
      // We wrap values in quotes to handle commas in Ministry names
      const row = [m.name || "Unknown", m.total || 0, m.avg || "—"];
      csvRows.push(
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
      );
    });

    // --- SECTION 3: GENERATE FILE ---
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    // Professional naming convention
    const fileName = `NyayaFlow_Compliance_Audit_${new Date().toISOString().split("T")[0]}.csv`;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- REVIEW VIEW ---
  if (isReviewing) {
    return (
      <>
        <div
          style={{
            display: "flex",
            height: "100vh",
            backgroundColor: "#f0f2f5",
            padding: "20px",
            gap: "20px",
          }}
        >
          <div
            style={{
              flex: 1.5,
              position: "relative",
              backgroundColor: "white",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            {/* 1. The PDF Frame */}
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                style={{ border: "none", display: "block" }}
                title="PDF Preview"
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                No PDF
              </div>
            )}

            {/* 2. The Corrected Highlight Layer */}
            {activeField && data?.highlights?.[activeField] && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 100, // Pulls it in front of the PDF
                  pointerEvents: "none", // Allows scrolling "through" the highlight
                  border: "3px solid #2563eb", // Thicker blue border
                  backgroundColor: "rgba(37, 99, 235, 0.25)", // Semi-transparent blue fill

                  // Logic: Works whether backend sends "10" or "10%"
                  top:
                    typeof data.highlights[activeField].top === "number"
                      ? `${data.highlights[activeField].top}%`
                      : data.highlights[activeField].top,

                  left:
                    typeof data.highlights[activeField].left === "number"
                      ? `${data.highlights[activeField].left}%`
                      : data.highlights[activeField].left,

                  width:
                    typeof data.highlights[activeField].width === "number"
                      ? `${data.highlights[activeField].width}%`
                      : data.highlights[activeField].width,

                  height:
                    typeof data.highlights[activeField].height === "number"
                      ? `${data.highlights[activeField].height}%`
                      : data.highlights[activeField].height,

                  transition: "all 0.2s ease-in-out",
                }}
              />
            )}
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "30px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>Verify Metadata</h2>
              <button
                onClick={() => {
                  setIsReviewing(false);
                  setData(null);
                }}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <X />
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* 1. REG NUMBER */}
              <div>
                <label
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "800",
                    color: "#64748b",
                  }}
                >
                  REG NUMBER
                </label>
                <input
                  onFocus={() => setActiveField("reg_number")}
                  onBlur={() => setActiveField(null)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    marginTop: "5px",
                  }}
                  value={data?.reg_number || ""}
                  onChange={(e) =>
                    setData({ ...data, reg_number: e.target.value })
                  }
                />
              </div>

              {/* 2. MINISTRY */}
              <div>
                <label
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "800",
                    color: "#64748b",
                  }}
                >
                  MINISTRY
                </label>
                <input
                  onFocus={() => setActiveField("ministry_name")}
                  onBlur={() => setActiveField(null)}
                  list="ministry-options"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    marginTop: "5px",
                  }}
                  value={data?.ministry_name || ""}
                  onChange={(e) =>
                    setData({ ...data, ministry_name: e.target.value })
                  }
                />
                <datalist id="ministry-options">
                  {ministryList.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              {/* 3. DEPARTMENT */}
              <div>
                <label
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "800",
                    color: "#64748b",
                  }}
                >
                  DEPARTMENT
                </label>
                <input
                  onFocus={() => setActiveField("dept_name")}
                  onBlur={() => setActiveField(null)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    marginTop: "5px",
                  }}
                  value={data?.dept_name || ""}
                  onChange={(e) =>
                    setData({ ...data, dept_name: e.target.value })
                  }
                />
              </div>

              {/* 4. SPECIFIC SECTION */}
              <div>
                <label
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "800",
                    color: "#64748b",
                  }}
                >
                  SPECIFIC SECTION
                </label>
                <input
                  onFocus={() => setActiveField("section_name")}
                  onBlur={() => setActiveField(null)}
                  list="section-options"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    marginTop: "5px",
                  }}
                  value={data?.section_name || ""}
                  onChange={(e) =>
                    setData({ ...data, section_name: e.target.value })
                  }
                />
                <datalist id="section-options">
                  {sectionList.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* 5. DATES GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      color: "#64748b",
                    }}
                  >
                    FILING DATE
                  </label>
                  <input
                    onFocus={() => setActiveField("filing_date")}
                    onBlur={() => setActiveField(null)}
                    type="date"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      marginTop: "5px",
                    }}
                    value={data?.filing_date || ""}
                    onChange={(e) =>
                      setData({ ...data, filing_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      color: "#64748b",
                    }}
                  >
                    REPLY DATE
                  </label>
                  <input
                    onFocus={() => setActiveField("reply_date")}
                    onBlur={() => setActiveField(null)}
                    type="date"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      marginTop: "5px",
                    }}
                    value={data?.reply_date || ""}
                    onChange={(e) =>
                      setData({ ...data, reply_date: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  // Add this inside your onClick for the Commit button
                  const payload = {
                    ...data,
                    filename: data.filename, // Ensure the backend knows which PDF to link to
                  };
                  if (
                    !payload.reply_date ||
                    payload.reply_date.trim() === "" ||
                    payload.reply_date === "—"
                  ) {
                    payload.reply_date = null;
                  }
                  payload.id = data.id || data._id || null;

                  await axios.post(
                    "http://127.0.0.1:5000/api/confirm-rti",
                    payload,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  );

                  fetchHistory();
                  setIsReviewing(false);
                  setData(null);
                  alert("Success! Record saved.");
                } catch (err) {
                  alert(
                    "Save failed: " +
                      (err.response?.data?.error || "Check format"),
                  );
                }
              }}
              style={{
                width: "100%",
                background: "#2563eb",
                color: "white",
                padding: "18px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Commit & Sync Database
            </button>
          </div>
        </div>
      </>
    );
  }
  // 3. THE CONDITIONAL RETURN (This must be AFTER functions)
  if (!isLoggedIn) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1f5f9",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "24px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            textAlign: "center",
            width: "380px",
          }}
        >
          <ShieldCheck
            size={50}
            color="#2563eb"
            style={{
              marginBottom: "20px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <h2 style={{ color: "#1e293b", marginBottom: "10px" }}>
            NyayaFlow Admin
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.9rem",
              marginBottom: "30px",
            }}
          >
            Secure Deployment Portal
          </p>

          {/* ERROR FEEDBACK */}
          {loginError && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.8rem",
                marginBottom: "10px",
                fontWeight: "500",
              }}
            >
              {loginError}
            </p>
          )}

          <input
            type="text"
            placeholder="Admin Username"
            style={{
              width: "100%",
              padding: "12px",
              margin: "10px 0",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
            }}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              width: "100%",
              padding: "12px",
              margin: "10px 0",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
            }}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              marginTop: "20px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" style={{ margin: "auto" }} />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    );
  }
  // --- MAIN DASHBOARD VIEW ---
  return (
    <div
      style={{
        padding: "20px 40px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "30px",
          maxWidth: "1400px",
          margin: "0 auto 30px auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ShieldCheck size={36} color="#2563eb" />
          <h1
            style={{
              color: "#1e293b",
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "700",
            }}
          >
            न्यायFlow{" "}
            <span style={{ color: "#64748b", fontWeight: "400" }}>
              | Deployment v1.0
            </span>
          </h1>
        </div>

        <div
          style={{
            flex: 1,
            maxWidth: "400px",
            margin: "0 40px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "white",
              padding: "10px 20px",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <Search size={20} color="#94a3b8" style={{ marginRight: "12px" }} />
            <input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.9rem",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <nav
            style={{
              display: "flex",
              background: "#e2e8f0",
              padding: "4px",
              borderRadius: "12px",
            }}
          >
            <button
              onClick={() => setCurrentView("audit")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor:
                  currentView === "audit" ? "white" : "transparent",
                color: currentView === "audit" ? "#2563eb" : "#64748b",
              }}
            >
              <ClipboardCheck size={18} /> Audit
            </button>
            <button
              onClick={() => setCurrentView("analytics")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor:
                  currentView === "analytics" ? "white" : "transparent",
                color: currentView === "analytics" ? "#2563eb" : "#64748b",
              }}
            >
              <LayoutDashboard size={18} /> Stats
            </button>
          </nav>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: "#fee2e2",
              color: "#dc2626",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1600px", margin: "0 auto" }}>
        {currentView === "audit" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "400px 1fr",
                gap: "30px",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "40px",
                  borderRadius: "24px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    textAlign: "left",
                    marginBottom: "30px",
                    fontSize: "1.2rem",
                  }}
                >
                  Ingest Document
                </h3>
                <div
                  style={{
                    border: "2px dashed #e2e8f0",
                    padding: "40px",
                    borderRadius: "20px",
                    backgroundColor: "#fcfdfe",
                    marginBottom: "30px",
                  }}
                >
                  <Upload
                    size={48}
                    color="#cbd5e1"
                    style={{ marginBottom: "20px" }}
                  />
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ width: "100%", fontSize: "0.8rem" }}
                  />
                </div>
                <button
                  disabled={loading || !file}
                  onClick={async () => {
                    if (!file) return alert("Select a file!");
                    setLoading(true);
                    const fd = new FormData();
                    fd.append("file", file);

                    try {
                      const res = await axios.post(
                        "http://127.0.0.1:5000/api/upload",
                        fd,
                        { headers: { Authorization: `Bearer ${token}` } },
                      );

                      // --- THE EXTRACTION BLOCK ---
                      const filenameFromServer = res.data.filename;
                      const raw = res.data.extracted_data;

                      // Update the state so the metadata boxes on the right fill up
                      setData({
                        ...raw,
                        filename: filenameFromServer,
                        filing_date: formatDateForInput(raw.filing_date),
                        reply_date: formatDateForInput(raw.reply_date),
                      });

                      // Update the PDF URL so the viewer is ready
                      setPdfUrl(
                        `http://127.0.0.1:5000/uploads/${filenameFromServer}`,
                      );

                      // NOTE: setIsReviewing(true) is removed from here!
                      // This keeps the user on the dashboard to see the extracted data.
                      // ----------------------------
                    } catch (e) {
                      console.error("Gemini Scan Error:", e);
                      alert("Upload/Scan error. Check your backend console.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{
                    width: "100%",
                    background: loading ? "#94a3b8" : "#255fdb",
                    color: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {loading ? (
                    <>
                      <style>
                        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
                      </style>
                      <Loader2
                        size={20}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Extracting Data...
                    </>
                  ) : (
                    "Extract Data"
                  )}
                </button>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "40px",
                  borderRadius: "24px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <h3 style={{ marginBottom: "30px", fontSize: "1.2rem" }}>
                  Extracted Metadata
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "30px",
                  }}
                >
                  {[
                    {
                      label: "REG NUMBER",
                      val: `# ${data?.reg_number || "—"}`,
                      color: "#2563eb",
                    },
                    { label: "MINISTRY", val: data?.ministry_name || "—" },
                    { label: "DEPARTMENT", val: data?.dept_name || "—" },
                    { label: "SECTION", val: data?.section_name || "—" },
                    { label: "FILING DATE", val: data?.filing_date || "—" },
                    { label: "REPLY DATE", val: data?.reply_date || "—" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#f8fafc",
                        padding: "15px",
                        borderRadius: "12px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: "800",
                          color: "#64748b",
                        }}
                      >
                        {item.label}
                      </label>
                      <div
                        style={{
                          fontWeight: "bold",
                          marginTop: "3px",
                          color: item.color,
                        }}
                      >
                        {item.val}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setIsReviewing(true)}
                  // Added '?' here to prevent the crash
                  disabled={
                    !data?.reg_number || data?.reg_number === "Not Found"
                  }
                  style={{
                    padding: "12px 30px",
                    backgroundColor:
                      !data?.reg_number || data?.reg_number === "Not Found"
                        ? "#83ade8" // Use a clearer grey for disabled state
                        : "#1e40af",
                    color: "white",
                    borderRadius: "10px",
                    border: "none",
                    cursor:
                      !data?.reg_number || data?.reg_number === "Not Found"
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "bold",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  Verify & Audit
                </button>
              </div>
            </div>

            <div
              style={{
                background: "white",
                padding: "40px",
                borderRadius: "24px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "30px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Clock size={20} color="#64748b" />
                  <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                    Case History
                  </h3>
                  {tableLoading && (
                    <Loader2 className="animate-spin" size={18} />
                  )}
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Compliant">Compliant</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Unanswered">Unanswered</option>
                </select>
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <thead>
                  <tr
                    style={{
                      color: "#64748b",
                      fontSize: "0.75rem",
                      borderBottom: "1px solid #f1f5f9",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "15px", width: "14%" }}>
                      REG NUMBER
                    </th>
                    <th style={{ padding: "15px", width: "14%" }}>MINISTRY</th>
                    <th style={{ padding: "15px", width: "14%" }}>
                      DEPARTMENT
                    </th>
                    <th style={{ padding: "15px", width: "10%" }}>SECTION</th>
                    <th style={{ padding: "15px", width: "12%" }}>
                      FILING DATE (IN)
                    </th>
                    <th style={{ padding: "15px", width: "12%" }}>
                      REPLY DATE (OUT)
                    </th>
                    <th style={{ padding: "15px", width: "12%" }}>STATUS</th>
                    <th
                      style={{
                        padding: "15px",
                        width: "12%",
                        textAlign: "center",
                      }}
                    >
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => {
                    const today = new Date();
                    const filingDate = new Date(item.filing_date);
                    const replyDate =
                      item.reply_date && item.reply_date !== "—"
                        ? new Date(item.reply_date)
                        : null;

                    const diffInMs = replyDate
                      ? replyDate - filingDate
                      : today - filingDate;
                    const diffDays = Math.max(
                      0,
                      Math.ceil(diffInMs / (1000 * 60 * 60 * 24)),
                    );

                    let status = {
                      text: "",
                      color: "",
                      bg: "",
                      needsAppeal: false,
                      subtitle: "",
                    };

                    if (replyDate && !isNaN(replyDate.getTime())) {
                      if (diffDays <= 30) {
                        status = {
                          text: "COMPLIANT",
                          subtitle: `Replied in ${diffDays}d`,
                          color: "#16a34a",
                          bg: "#dcfce7",
                          needsAppeal: false,
                        };
                      } else {
                        status = {
                          text: "LATE REPLY",
                          subtitle: `${diffDays} days taken`,
                          color: "#2563eb",
                          bg: "#dbeafe",
                          needsAppeal: false,
                        };
                      }
                    } else {
                      if (diffDays <= 30) {
                        status = {
                          text: "IN PROGRESS",
                          subtitle: `${diffDays}d since filing`,
                          color: "#d97706",
                          bg: "#fef3c7",
                          needsAppeal: false,
                        };
                      } else {
                        status = {
                          text: "DEEMED REFUSED",
                          subtitle: `${diffDays}d - No Reply`,
                          color: "#dc2626",
                          bg: "#fee2e2",
                          needsAppeal: true,
                        };
                      }
                    }

                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.85rem",
                        }}
                      >
                        <td
                          style={{
                            padding: "16px",
                            fontWeight: "700",
                            color: "#1e293b",
                          }}
                        >
                          {item.reg_number}
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            color: "#64748b",
                            fontSize: "0.8rem",
                          }}
                        >
                          {item.ministry_name}
                        </td>
                        <td style={{ padding: "16px", fontWeight: "600" }}>
                          {item.dept_name}
                        </td>
                        <td style={{ padding: "16px", color: "#64748b" }}>
                          {item.section_name || "—"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {filingDate && !isNaN(filingDate.getTime())
                            ? filingDate.toLocaleDateString("en-GB")
                            : "—"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {replyDate && !isNaN(replyDate.getTime()) ? (
                            <span style={{ color: "#1e293b" }}>
                              {replyDate.toLocaleDateString("en-GB")}
                            </span>
                          ) : (
                            <span
                              style={{ color: "#94a3b8", fontStyle: "italic" }}
                            >
                              Pending...
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              background: status.bg,
                              color: status.color,
                              padding: "6px 10px",
                              borderRadius: "8px",
                              textAlign: "center",
                              width: "fit-content",
                              minWidth: "110px",
                              border: `1px solid ${status.color}33`,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "900",
                                fontSize: "0.65rem",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {status.text}
                            </div>
                            <div
                              style={{
                                fontSize: "0.6rem",
                                opacity: 0.8,
                                fontWeight: "600",
                              }}
                            >
                              {status.subtitle}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            {status.needsAppeal && (
                              <button
                                onClick={() => generateAppealPDF(item)}
                                style={{
                                  background: "#dc2626",
                                  color: "white",
                                  border: "none",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "0.7rem",
                                  fontWeight: "bold",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <FileText size={14} /> Draft Appeal
                              </button>
                            )}
                            <button
                              onClick={() => editCase(item)}
                              style={{
                                border: "none",
                                background: "#f1f5f9",
                                padding: "8px",
                                borderRadius: "6px",
                                color: "#2563eb",
                                cursor: "pointer",
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteCase(item.id)}
                              style={{
                                border: "none",
                                background: "#f1f5f9",
                                padding: "8px",
                                borderRadius: "6px",
                                color: "#dc2626",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === "analytics" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "25px" }}
          >
            {/* 1. TOP ROW: Custom Date Filters */}
            <div
              className="glass-card"
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
                padding: "20px",
              }}
            >
              {/* --- NEW DATE FILTER BLOCK STARTS HERE --- */}
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <Calendar size={20} color="#64748b" />{" "}
                {/* Kept your icon, it looks good! */}
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: "#64748b",
                  }}
                >
                  From:
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginLeft: "10px",
                  }}
                >
                  To:
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  style={{
                    padding: "8px 16px",
                    marginLeft: "10px",
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    color: "#475569",
                    fontWeight: "bold",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#e2e8f0")}
                  onMouseOut={(e) => (e.target.style.background = "#f1f5f9")}
                >
                  Clear
                </button>
              </div>
              <button
                onClick={exportToCSV}
                className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-blue-600 hover:to-blue-700 text-slate-200 hover:text-white border border-slate-700/50 hover:border-blue-400/50 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/20 active:scale-95"
              >
                {/* The Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-y-0.5 transition-transform duration-300"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>

                {/* Button Text */}
                <span className="text-xs font-bold tracking-widest uppercase">
                  Export Audit Report
                </span>

                {/* Subtle Shine Effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
              {/* Keeps the label pushed perfectly to the right side */}
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.8rem",
                  color: "#64748b",
                  fontWeight: "bold",
                }}
              >
                DATA SOURCE: nyaya_core
              </span>
            </div>

            {/* 2. MIDDLE ROW: Compliance Overview (Centered) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "25px",
              }}
            >
              <div className="glass-card" style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "15px" }}>
                  RTI Compliance Performance
                </h3>
                <div style={{ width: "100%", height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Compliant", value: stats.compliant },
                          { name: "Delayed", value: stats.delayed },
                          {
                            name: "Unanswered",
                            value: stats.waiting + stats.deemed,
                          },
                        ]}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        <Label
                          value={`${stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0}%`}
                          position="center"
                          fill="#1e293b"
                          style={{ fontSize: "1.8rem", fontWeight: "bold" }}
                        />
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 3. BOTTOM ROW: KPI Boxes (Keep exactly as is) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "15px",
              }}
            >
              {[
                { label: "Total RTIs", val: stats.total, color: "#dd2bad" },
                { label: "Compliant", val: stats.compliant, color: "#2563eb" },
                { label: "Delayed", val: stats.delayed, color: "#f59e0b" },
                { label: "Waiting", val: stats.waiting, color: "#dc2626" },
                {
                  label: "DEEMED REFUSAL",
                  val: stats.deemed,
                  color: "#c74040",
                },
                {
                  label: "Avg. Delay",
                  val: `${medianResponse}d`,
                  color: "#64748b",
                },
                { label: "P-90", val: `${stats.p90}d`, color: "#7c3aed" },
              ].map((box, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    borderBottom: `4px solid ${box.color}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "#64748b",
                      fontWeight: "800",
                    }}
                  >
                    {box.label}
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: "bold",
                      marginTop: "5px",
                    }}
                  >
                    {box.val}
                  </div>
                </div>
              ))}
            </div>
            {/* ... after the Pie Chart / Middle Row <div> ... */}

            {/* NEW TREND ANALYSIS ROW */}
            <div
              className="glass-card"
              style={{ padding: "25px", marginBottom: "25px" }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "20px",
                  color: "#1e293b",
                }}
              >
                Filing vs. Resolution Trends (Accountability Timeline)
              </h3>
              <div style={{ width: "100%", height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    onClick={(data) => {
                      if (data && data.activeLabel) {
                        // If clicking the same month again, clear the filter (toggle)
                        setSelectedMonth(
                          selectedMonth === data.activeLabel
                            ? null
                            : data.activeLabel,
                        );
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10} // Adds a little space below the months
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      allowDecimals={false} // This is the key for 100% accuracy
                      domain={[0, "auto"]} // Starts at 0 and grows with your data
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                    />
                    <Line
                      type="linear" /* <--- Changed to Linear for accuracy */
                      dataKey="filed"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: "#2563eb",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 7 }}
                      name="RTIs Filed"
                    />
                    <Line
                      type="linear" /* <--- Changed to Linear for accuracy */
                      dataKey="resolved"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: "#22c55e",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 7 }}
                      name="Replies Received"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "#64748b",
                  marginTop: "10px",
                  fontStyle: "italic",
                }}
              >
                * Tracking monthly throughput to identify systemic delays in
                public record processing.
              </p>
            </div>

            {/* ... before the KPI Boxes or Ministry Table ... */}
            {/* 4. PERFORMANCE DETAIL TABLE (Keep exactly as is) */}
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: "20px", color: "#1e293b" }}>
                Ministry Performance Detail
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #f1f5f9",
                      color: "#8296b1",
                      fontSize: "0.8rem",
                    }}
                  >
                    <th style={{ padding: "15px" }}>MINISTRY NAME</th>
                    <th style={{ padding: "15px" }}>TOTAL CASES</th>
                    <th style={{ padding: "15px" }}>AVG. RESPONSE TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {ministryStats.map((item, index) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td
                        style={{
                          padding: "16px",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {item.name}
                      </td>
                      <td style={{ padding: "16px", color: "#64748b" }}>
                        {item.total}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "bold",
                            backgroundColor:
                              item.avg === "—"
                                ? "#f1f5f9"
                                : item.avg > 30
                                  ? "#fee2e2"
                                  : "#dcfce7",
                            color:
                              item.avg === "—"
                                ? "#3863a3"
                                : item.avg > 30
                                  ? "#ef4444"
                                  : "#22c55e",
                            display: "inline-block",
                          }}
                        >
                          {item.avg === "—" ? "Pending" : `${item.avg} Days`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
