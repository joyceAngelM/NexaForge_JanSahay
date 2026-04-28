import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [voiceLanguage, setVoiceLanguage] = useState('te');
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [ratings, setRatings] = useState({});
  const [compareScheme1, setCompareScheme1] = useState(null);
  const [compareScheme2, setCompareScheme2] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  
  // AI Chatbot States
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', content: 'Namaste! I am JanSahay AI Assistant. Upload your Aadhaar or PAN card, or tell me about yourself, and I will find the best schemes for you! 🇮🇳' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [isDocumentAnalyzing, setIsDocumentAnalyzing] = useState(false);

  const [stats, setStats] = useState({
    totalSchemes: 0,
    activeApplications: 0,
    eligibleSchemes: 0,
    approvedApplications: 0,
    pendingApplications: 0
  });

  const successStories = [
    { id: 1, name: "Ramesh Kumar", village: "Punjab", district: "Ludhiana", scheme: "PM-KISAN", story: "Got ₹6000 directly in my bank account within 2 weeks! Now I can buy better seeds for my farm.", rating: 5, date: "Jan 15, 2026" },
    { id: 2, name: "Lakshmi Devi", village: "Telangana", district: "Hyderabad", scheme: "Ayushman Bharat", story: "Free heart surgery for my father at Apollo Hospital. Saved over ₹3 lakhs! God bless this scheme.", rating: 5, date: "Feb 3, 2026" },
    { id: 3, name: "Suresh Patel", village: "Gujarat", district: "Ahmedabad", scheme: "Mudra Yojana", story: "Got ₹5 lakh loan to expand my grocery shop. No guarantee needed! My business has doubled.", rating: 5, date: "Jan 28, 2026" },
    { id: 4, name: "Mary Thomas", village: "Kerala", district: "Kottayam", scheme: "Sukanya Samriddhi", story: "Opened account for my daughter. 7.6% interest is much better than FD! Her future is secure.", rating: 4, date: "Feb 10, 2026" },
    { id: 5, name: "Amit Singh", village: "Uttar Pradesh", district: "Lucknow", scheme: "PM Awas Yojana", story: "Got ₹2.67 lakh subsidy for my new house. Now my family has a permanent home.", rating: 5, date: "Mar 1, 2026" }
  ];

  const languages = [
    { name: 'हिन्दी', code: 'hi' },
    { name: 'English', code: 'en' },
    { name: 'ಕನ್ನಡ', code: 'kn' },
    { name: 'తెలుగు', code: 'te' },
    { name: 'தமிழ்', code: 'ta' },
    { name: 'മലയാളം', code: 'ml' },
    { name: 'বাংলা', code: 'bn' },
    { name: 'मराठी', code: 'mr' },
    { name: 'ગુજરાતી', code: 'gu' }
  ];

  const quickSuggestions = [
    "Tell me about PM-KISAN",
    "Health schemes for my family",
    "Business loan schemes",
    "Schemes for women",
    "Housing scheme details",
    "Check my eligibility"
  ];

  useEffect(() => {
    fetchSchemes();
    loadApplications();
    loadReminders();
    loadRatings();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [schemes, applications]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  const sendNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const calculateStats = () => {
    const eligibleCount = schemes.filter(s => 
      s.category === 'farmer' || s.category === 'health' || s.category === 'women'
    ).length;
    
    const approvedCount = applications.filter(a => a.status === 'Approved').length;
    const pendingCount = applications.filter(a => a.status === 'Under Review').length;
    
    setStats({
      totalSchemes: schemes.length,
      activeApplications: applications.length,
      eligibleSchemes: eligibleCount,
      approvedApplications: approvedCount,
      pendingApplications: pendingCount
    });
  };

  const speakText = (text, langCode) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceLangMap = { 'hi': 'hi-IN', 'te': 'te-IN', 'kn': 'kn-IN', 'ta': 'ta-IN', 'ml': 'ml-IN', 'bn': 'bn-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 'en': 'en-US' };
    utterance.lang = voiceLangMap[langCode] || 'hi-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const fetchSchemes = async () => {
    try {
      const response = await fetch('/api/schemes');
      const data = await response.json();
      if (data.success) setSchemes(data.schemes);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadApplications = () => {
    const saved = localStorage.getItem('applications');
    if (saved) setApplications(JSON.parse(saved));
  };

  const loadReminders = () => {
    const saved = localStorage.getItem('reminders');
    if (saved) setReminders(JSON.parse(saved));
  };

  const loadRatings = () => {
    const saved = localStorage.getItem('ratings');
    if (saved) setRatings(JSON.parse(saved));
  };

  const saveApplications = (newApps) => {
    setApplications(newApps);
    localStorage.setItem('applications', JSON.stringify(newApps));
  };

  const saveReminders = (newReminders) => {
    setReminders(newReminders);
    localStorage.setItem('reminders', JSON.stringify(newReminders));
  };

  const saveRatings = (newRatings) => {
    setRatings(newRatings);
    localStorage.setItem('ratings', JSON.stringify(newRatings));
  };

  const applyForScheme = (scheme) => {
    const newApp = {
      id: Date.now(),
      name: scheme.name,
      appliedDate: new Date().toLocaleDateString(),
      status: 'Under Review',
      category: scheme.category
    };
    saveApplications([...applications, newApp]);
    sendNotification('Application Submitted', `Your application for ${scheme.name} has been submitted!`);
    alert('Application submitted successfully!');
  };

  const addReminder = (schemeName) => {
    const deadline = prompt(`Enter deadline date for ${schemeName} (YYYY-MM-DD):`);
    if (deadline) {
      const newReminder = {
        id: Date.now(),
        schemeName: schemeName,
        deadline: deadline,
        createdAt: new Date().toLocaleDateString()
      };
      saveReminders([...reminders, newReminder]);
      alert(`Reminder set for ${schemeName} on ${deadline}`);
    }
  };

  const rateScheme = (schemeName, rating) => {
    const newRatings = { ...ratings, [schemeName]: rating };
    saveRatings(newRatings);
    alert(`You rated ${schemeName} ${rating} stars!`);
  };

  const downloadApplicationForm = (schemeName) => {
    const formContent = `APPLICATION FORM - ${schemeName.toUpperCase()}\n\n1. Full Name: _______________\n2. Father's Name: _______________\n3. Date of Birth: _______________\n4. Aadhaar Number: _______________\n5. Mobile Number: _______________\n6. Address: _______________\n7. Annual Income: _______________\n8. Occupation: _______________\n9. Bank Account Number: _______________\n10. IFSC Code: _______________\n\nDeclaration: I hereby declare that all information provided is true.\n\nSignature: _______________\nDate: _______________\n\nSubmit to: Nearest CSC Center or Government Office\nHelpline: 1800-180-1111`;
    
    const blob = new Blob([formContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${schemeName.replace(/ /g, '_')}_Application_Form.txt`;
    link.click();
    alert('Application form downloaded!');
  };

  const findNearbyCSC = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        window.open(`https://www.google.com/maps/search/Common+Service+Center+CSC/@${latitude},${longitude},12z`, '_blank');
      }, () => {
        window.open('https://www.google.com/maps/search/Common+Service+Center+CSC/', '_blank');
      });
    } else {
      window.open('https://www.google.com/maps/search/Common+Service+Center+CSC/', '_blank');
    }
  };

  const addToCompare = (scheme) => {
    if (!compareScheme1) {
      setCompareScheme1(scheme);
      alert(`${scheme.name} added to compare. Select another scheme.`);
    } else if (!compareScheme2 && compareScheme1.id !== scheme.id) {
      setCompareScheme2(scheme);
      setShowCompare(true);
    } else {
      alert('Already have 2 schemes. Click "Clear Compare" to compare new ones.');
    }
  };

  const clearCompare = () => {
    setCompareScheme1(null);
    setCompareScheme2(null);
    setShowCompare(false);
  };

  const shareOnWhatsApp = (schemeName) => {
    const message = `JanSahay - Government Scheme Alert\n\nScheme: ${schemeName}\nApply via JanSahay\nApply now: http://localhost:3000`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const downloadSchemeSummary = (scheme) => {
    const summary = `JANSAHAY - SCHEME SUMMARY\n\n${scheme.name}\nCategory: ${scheme.category}\nBenefits: ${scheme.benefits?.join(', ')}\nDocuments: ${scheme.documents?.join(', ')}\nHelpline: 1800-180-1111`;
    const blob = new Blob([summary], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${scheme.name.replace(/ /g, '_')}_Summary.txt`;
    link.click();
  };

  const sendOTP = async () => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber })
      });
      const data = await response.json();
      if (data.success) {
        setShowOtpInput(true);
        alert('OTP sent! Check backend terminal');
      }
    } catch (error) {
      alert('Error sending OTP');
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp })
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        alert('Welcome to JanSahay!');
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      alert('Error verifying OTP');
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      const recognitionLangMap = { 'hi': 'hi-IN', 'te': 'te-IN', 'kn': 'kn-IN', 'ta': 'ta-IN', 'ml': 'ml-IN', 'bn': 'bn-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 'en': 'en-IN' };
      recognition.lang = recognitionLangMap[voiceLanguage] || 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceResponse(`Listening in ${voiceLanguage.toUpperCase()}...`);
      };

      recognition.onresult = async (event) => {
        const query = event.results[0][0].transcript;
        setVoiceQuery(query);
        setIsListening(false);
        setVoiceResponse('Processing...');
        
        try {
          const response = await fetch('/api/voice/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, language: voiceLanguage })
          });
          const data = await response.json();
          setVoiceResponse(data.response);
          speakText(data.response, voiceLanguage);
        } catch (error) {
          setVoiceResponse('Error. Please try again.');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceResponse('Please try again. Make sure microphone is enabled.');
      };

      recognition.start();
    } else {
      alert('Voice recognition not supported. Please use Chrome browser.');
    }
  };

  // AI Chatbot Functions
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsDocumentAnalyzing(true);
    setUploadedDocument(file);
    
    setTimeout(() => {
      const fileName = file.name.toLowerCase();
      let extractedData = {};
      
      if (fileName.includes('aadhaar')) {
        extractedData = { type: 'Aadhaar Card', recognized: true };
        setDocumentData(extractedData);
        addChatMessage('bot', '✅ Aadhaar Card analyzed successfully! Based on your Aadhaar, you may be eligible for PM-KISAN, Ayushman Bharat, PM Awas Yojana, and more. Tell me your occupation to find the best matches!');
      } 
      else if (fileName.includes('pan')) {
        extractedData = { type: 'PAN Card', recognized: true };
        setDocumentData(extractedData);
        addChatMessage('bot', '✅ PAN Card analyzed successfully! Based on your PAN, you may be eligible for Mudra Yojana (business loans), housing schemes, and tax benefits. Tell me your business or occupation!');
      }
      else {
        setDocumentData({ type: 'Document', recognized: false });
        addChatMessage('bot', '📄 Document uploaded. For better analysis, please upload Aadhaar or PAN card, or tell me about yourself - your age, occupation, and income.');
      }
      
      setIsDocumentAnalyzing(false);
    }, 2000);
  };

  const addChatMessage = (role, content) => {
    setChatMessages(prev => [...prev, { role, content }]);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    addChatMessage('user', userMessage);
    setChatInput('');
    
    setTimeout(() => {
      let botReply = '';
      const msg = userMessage.toLowerCase();
      
      if (msg.includes('kisan') || msg.includes('farmer')) {
        botReply = 'PM-KISAN Scheme: Farmers get ₹6000/year in 3 installments of ₹2000. Eligibility: Landholding farmers. Documents: Aadhaar, land records, bank account. Helpline: 155261';
      }
      else if (msg.includes('health') || msg.includes('ayushman')) {
        botReply = 'Ayushman Bharat: ₹5 lakh free health insurance per family. Cashless treatment at 20,000+ hospitals. Eligibility: Families below poverty line. Helpline: 14555';
      }
      else if (msg.includes('house') || msg.includes('home') || msg.includes('awas')) {
        botReply = 'PM Awas Yojana: ₹2.67 lakh interest subsidy for home loans. Priority to women. Eligibility: Annual income up to ₹6 lakh. Helpline: 1800-11-3377';
      }
      else if (msg.includes('business') || msg.includes('loan') || msg.includes('mudra')) {
        botReply = 'Mudra Yojana: Loans up to ₹10 lakh without collateral. Three types: Shishu (₹50k), Kishor (₹5L), Tarun (₹10L). Apply at any bank. Helpline: 1800-180-1111';
      }
      else if (msg.includes('girl') || msg.includes('daughter') || msg.includes('sukanya')) {
        botReply = 'Sukanya Samriddhi: 7.6% interest rate. Deposit ₹250-1.5L/year for girl child below 10 years. Tax benefits under 80C.';
      }
      else if (msg.includes('scheme') || msg.includes('eligible')) {
        if (documentData?.recognized) {
          botReply = `Based on your ${documentData.type}, you may be eligible for: PM-KISAN (₹6000/year for farmers), Ayushman Bharat (₹5L health cover), PM Awas (housing subsidy). Which one would you like to know more about?`;
        } else {
          botReply = 'I can help you find schemes! Please tell me: Are you a farmer, business owner, salaried employee, or student? Also share your annual income range.';
        }
      }
      else {
        botReply = 'Namaste! 🙏 I am JanSahay AI Assistant. You can:\n\n📤 Upload Aadhaar/PAN card for personalized recommendations\n🗣️ Ask about PM-KISAN, Ayushman Bharat, Mudra Loan, PM Awas, Sukanya Samriddhi\n📋 Check eligibility by telling me your occupation and income\n\nWhat would you like to know?';
      }
      
      addChatMessage('bot', botReply);
    }, 1000);
  };

  const searchOfficers = () => {
    const searchTermLocal = document.getElementById('officerSearch')?.value;
    if (searchTermLocal) {
      const officersList = document.getElementById('officers-list');
      officersList.innerHTML = `
        <div class="officer-card"><div class="officer-icon">👨‍💼</div><div class="officer-info"><h4>District Collector - ${searchTermLocal}</h4><p>📞 1800-123-4567</p></div></div>
        <div class="officer-card"><div class="officer-icon">👩‍💼</div><div class="officer-info"><h4>Block Development Officer - ${searchTermLocal}</h4><p>📞 1800-123-4568</p></div></div>
        <div class="officer-card"><div class="officer-icon">👨‍⚕️</div><div class="officer-info"><h4>Chief Medical Officer - ${searchTermLocal}</h4><p>📞 104</p></div></div>
      `;
    } else {
      alert('Please enter a district name');
    }
  };

  const filteredSchemes = schemes.filter(scheme =>
    scheme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="tricolor-bg"></div>
        <div className="login-card">
          <div className="ashoka-chakra">🔄</div>
          <h1>JanSahay</h1>
          <p className="tagline">Government Scheme Assistant | सरकारी योजना सहायक</p>
          <h2>Secure Sign In</h2>
          <input type="tel" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
          {!showOtpInput ? (
            <button className="login-btn" onClick={sendOTP}>Send Secure OTP</button>
          ) : (
            <>
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <button className="login-btn" onClick={verifyOTP}>Verify & Login</button>
            </>
          )}
          <div className="emergency-footer">
            <span>🚓 100</span><span>🚑 102</span><span>👩 1091</span><span>👶 1098</span><span>🆘 112</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="tricolor-header"><div className="saffron"></div><div className="white"></div><div className="green"></div></div>
      
      <header className="header">
        <div className="logo"><span className="ashoka">🔄</span><h1>JanSahay <span className="govt">GOVERNMENT OF INDIA</span></h1></div>
        <div className="language-selector">
          {languages.slice(0, 5).map(lang => (
            <button key={lang.code} className={`lang-btn ${selectedLanguage === lang.code ? 'active' : ''}`} onClick={() => setSelectedLanguage(lang.code)}>
              {lang.name}
            </button>
          ))}
        </div>
      </header>

      <nav className="nav-bar">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button className={`nav-item ${activeTab === 'schemes' ? 'active' : ''}`} onClick={() => setActiveTab('schemes')}>📋 Schemes</button>
        <button className={`nav-item ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>⚖️ Compare</button>
        <button className={`nav-item ${activeTab === 'voice' ? 'active' : ''}`} onClick={() => setActiveTab('voice')}>🎤 Voice</button>
        <button className={`nav-item ${activeTab === 'eligibility' ? 'active' : ''}`} onClick={() => setActiveTab('eligibility')}>✅ Eligibility</button>
        <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 Calendar</button>
        <button className={`nav-item ${activeTab === 'stories' ? 'active' : ''}`} onClick={() => setActiveTab('stories')}>🌟 Stories</button>
        <button className={`nav-item ${activeTab === 'officers' ? 'active' : ''}`} onClick={() => setActiveTab('officers')}>👮 Officers</button>
        <button className={`nav-item ${activeTab === 'reminders' ? 'active' : ''}`} onClick={() => setActiveTab('reminders')}>⏰ Reminders</button>
        <button className={`nav-item ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')}>📋 My Apps</button>
        <button className={`nav-item ${activeTab === 'chatbot' ? 'active' : ''}`} onClick={() => setActiveTab('chatbot')}>🤖 AI Chat</button>
      </nav>

      <div className="quick-actions">
        <button onClick={findNearbyCSC} className="quick-btn">📍 Find CSC Center</button>
        <button onClick={() => setActiveTab('compare')} className="quick-btn">⚖️ Compare Schemes</button>
        <button onClick={() => setActiveTab('voice')} className="quick-btn">🎤 Voice Assistant</button>
        <button onClick={() => setActiveTab('eligibility')} className="quick-btn">✅ Check Eligibility</button>
        <button onClick={() => setActiveTab('chatbot')} className="quick-btn">🤖 AI Chatbot</button>
      </div>

      {activeTab === 'schemes' && (
        <div className="search-section">
          <input type="text" placeholder="🔍 Search schemes by name, category, or benefits..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      )}

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-container">
            <h2>📊 Your Dashboard</h2>
            <div className="welcome-card"><p>Welcome back! Here's your scheme assistance summary.</p></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-number">{stats.totalSchemes}</div><div className="stat-label">Total Schemes</div></div>
              <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-number">{stats.eligibleSchemes}</div><div className="stat-label">You May Qualify</div></div>
              <div className="stat-card"><div className="stat-icon">📝</div><div className="stat-number">{stats.activeApplications}</div><div className="stat-label">Applications</div></div>
              <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-number">{stats.pendingApplications}</div><div className="stat-label">Under Review</div></div>
              <div className="stat-card"><div className="stat-icon">🎉</div><div className="stat-number">{stats.approvedApplications}</div><div className="stat-label">Approved</div></div>
              <div className="stat-card"><div className="stat-icon">⭐</div><div className="stat-number">{Object.keys(ratings).length}</div><div className="stat-label">Schemes Rated</div></div>
            </div>
          </div>
        )}

        {activeTab === 'schemes' && (
          <div className="schemes-container">
            <h2>Government Schemes ({filteredSchemes.length})</h2>
            <div className="schemes-grid">
              {filteredSchemes.map((scheme, index) => (
                <div key={index} className="scheme-card">
                  <div className="scheme-icon">
                    {scheme.category === 'health' && '🏥'}
                    {scheme.category === 'housing' && '🏠'}
                    {scheme.category === 'women' && '👩'}
                    {scheme.category === 'business' && '💼'}
                    {scheme.category === 'farmer' && '🌾'}
                  </div>
                  <h3>{scheme.name}</h3>
                  <span className={`category-badge ${scheme.category}`}>{scheme.category}</span>
                  <div className="rating">
                    {'⭐'.repeat(ratings[scheme.name] || 0)}{'☆'.repeat(5 - (ratings[scheme.name] || 0))}
                    <select onChange={(e) => rateScheme(scheme.name, parseInt(e.target.value))} value={ratings[scheme.name] || 0}>
                      <option value="0">Rate</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
                    </select>
                  </div>
                  {scheme.benefits && (
                    <div className="benefits"><strong>Benefits:</strong><ul>{scheme.benefits.slice(0, 2).map((b, i) => <li key={i}>{b}</li>)}</ul></div>
                  )}
                  <div className="scheme-actions">
                    <button className="apply-btn" onClick={() => applyForScheme(scheme)}>Apply</button>
                    <button className="reminder-btn" onClick={() => addReminder(scheme.name)}>⏰ Remind</button>
                    <button className="compare-btn" onClick={() => addToCompare(scheme)}>⚖️ Compare</button>
                    <button className="download-btn" onClick={() => downloadApplicationForm(scheme.name)}>📄 Form</button>
                    <button className="whatsapp-btn" onClick={() => shareOnWhatsApp(scheme.name)}>📱 Share</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="compare-container">
            <h2>⚖️ Compare Schemes</h2>
            {!showCompare ? (
              <div className="compare-select">
                <p>Select 2 schemes to compare by clicking "Compare" on scheme cards</p>
                {compareScheme1 && <div className="selected-scheme">✓ Selected: {compareScheme1.name}</div>}
                <button onClick={clearCompare} className="clear-btn">Clear Selection</button>
              </div>
            ) : (
              <div className="compare-table">
                <button onClick={clearCompare} className="clear-btn">Clear Compare</button>
                <div className="compare-row"><div className="compare-feature">Feature</div><div className="compare-scheme">{compareScheme1?.name}</div><div className="compare-scheme">{compareScheme2?.name}</div></div>
                <div className="compare-row"><div className="compare-feature">Category</div><div className="compare-scheme">{compareScheme1?.category}</div><div className="compare-scheme">{compareScheme2?.category}</div></div>
                <div className="compare-row"><div className="compare-feature">Benefits</div><div className="compare-scheme">{compareScheme1?.benefits?.slice(0,2).join(', ')}</div><div className="compare-scheme">{compareScheme2?.benefits?.slice(0,2).join(', ')}</div></div>
                <div className="compare-row"><div className="compare-feature">Rating</div><div className="compare-scheme">{'⭐'.repeat(ratings[compareScheme1?.name] || 0)}</div><div className="compare-scheme">{'⭐'.repeat(ratings[compareScheme2?.name] || 0)}</div></div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="voice-container">
            <div className="voice-card">
              <div className="voice-icon" onClick={startListening}>{isListening ? '🎤🔴 Listening...' : '🎤 Click to Speak'}</div>
              <div className="voice-lang-selector">
                <label>Select Language:</label>
                <select value={voiceLanguage} onChange={(e) => setVoiceLanguage(e.target.value)} className="voice-lang">
                  <option value="te">తెలుగు</option><option value="kn">ಕನ್ನಡ</option><option value="hi">हिन्दी</option><option value="ta">தமிழ்</option><option value="ml">മലയാളം</option><option value="en">English</option>
                </select>
              </div>
              {voiceQuery && (<div className="voice-query"><strong>You said:</strong><p>{voiceQuery}</p></div>)}
              {voiceResponse && (<div className="voice-response"><strong>Assistant:</strong><p>{voiceResponse}</p><button onClick={() => speakText(voiceResponse, voiceLanguage)}>🔊 Listen Again</button></div>)}
            </div>
          </div>
        )}

        {activeTab === 'eligibility' && (
          <div className="eligibility-container">
            <div className="eligibility-card">
              <h2>✅ Check Eligibility</h2>
              <div className="eligibility-form">
                <div className="form-group"><label>Age</label><input type="number" id="age" placeholder="Enter your age" /></div>
                <div className="form-group"><label>Income</label><select id="income"><option value="">Select</option><option value="below_50000">Below ₹50k</option><option value="50000_2lakh">₹50k-2L</option><option value="2lakh_5lakh">₹2-5L</option><option value="above_5lakh">Above ₹5L</option></select></div>
                <div className="form-group"><label>Occupation</label><select id="occupation"><option value="">Select</option><option value="farmer">Farmer</option><option value="business">Business</option><option value="salaried">Salaried</option></select></div>
                <div className="form-group"><label>Gender</label><select id="gender"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                <button className="check-eligibility-btn" onClick={() => {
                  const age = document.getElementById('age')?.value;
                  const income = document.getElementById('income')?.value;
                  const occupation = document.getElementById('occupation')?.value;
                  const gender = document.getElementById('gender')?.value;
                  let eligible = schemes.filter(s => 
                    (s.category === 'farmer' && occupation === 'farmer') ||
                    (s.category === 'women' && gender === 'female') ||
                    (s.category === 'health' && (age < 18 || age > 60)) ||
                    (s.category === 'business' && occupation === 'business')
                  );
                  const resultsDiv = document.getElementById('eligibility-results');
                  if (eligible.length > 0) {
                    resultsDiv.innerHTML = `<h3>You are eligible for ${eligible.length} schemes!</h3>${eligible.map(s => `<div class="eligible-scheme"><strong>${s.name}</strong><p>${s.benefits?.join(', ')}</p></div>`).join('')}`;
                  } else {
                    resultsDiv.innerHTML = '<div class="no-results"><p>No schemes match. Helpline: 1800-180-1111</p></div>';
                  }
                }}>Find Eligible Schemes</button>
              </div>
              <div id="eligibility-results" className="eligibility-results"></div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="calendar-container">
            <h2>📅 Scheme Deadline Calendar - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <div className="calendar">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <div key={day} className="calendar-day-header">{day}</div>)}
              {getCalendarDays().map((date, idx) => {
                const hasDeadline = date && reminders.some(r => new Date(r.deadline).getDate() === date);
                return <div key={idx} className={`calendar-date ${hasDeadline ? 'has-deadline' : ''}`}>{date}</div>;
              })}
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="stories-container">
            <h2>🌟 Success Stories</h2>
            <div className="stories-grid">
              {successStories.map((story) => (
                <div key={story.id} className="story-card">
                  <div className="story-header"><div className="story-avatar">👤</div><div><h3>{story.name}</h3><p>{story.village}</p></div></div>
                  <div className="story-badge">{story.scheme}</div>
                  <p className="story-text">"{story.story}"</p>
                  <div className="story-footer"><div className="story-rating">{'⭐'.repeat(story.rating)}</div><span>{story.date}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'officers' && (
          <div className="officers-container">
            <div className="officers-card">
              <h2>👮 Find Government Officers</h2>
              <div className="search-officer"><input type="text" id="officerSearch" placeholder="Enter district name" /><button onClick={searchOfficers}>Search</button></div>
              <div id="officers-list" className="officers-list">
                <div className="officer-card"><div className="officer-icon">👨‍💼</div><div className="officer-info"><h4>District Collector</h4><p>📞 1800-123-4567</p></div></div>
                <div className="officer-card"><div className="officer-icon">👩‍💼</div><div className="officer-info"><h4>Block Development Officer</h4><p>📞 1800-123-4568</p></div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="reminders-container">
            <div className="reminders-card">
              <h2>⏰ Scheme Reminders</h2>
              {reminders.length === 0 ? (<p>No reminders set. Click "Remind" on any scheme.</p>) : (
                reminders.map(rem => {
                  const daysLeft = Math.ceil((new Date(rem.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  return <div key={rem.id} className="reminder-card"><strong>{rem.schemeName}</strong><p>Deadline: {rem.deadline}</p><span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span></div>;
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="tracker-container">
            <div className="tracker-card">
              <h2>📋 My Applications</h2>
              {applications.length === 0 ? (<p>No applications yet. Click "Apply" on any scheme.</p>) : (
                applications.map(app => (
                  <div key={app.id} className="application-card">
                    <div className="app-icon">{app.category === 'farmer' && '🌾'}{app.category === 'health' && '🏥'}</div>
                    <div className="app-info"><h4>{app.name}</h4><p>Applied: {app.appliedDate}</p><span className="status pending">{app.status}</span></div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="chatbot-fullpage">
            <div className="chatbot-fullpage-header">
              <h2>🤖 JanSahay AI Assistant</h2>
              <p>Upload your Aadhaar/PAN or chat to find the best government schemes for you!</p>
            </div>
            <div className="chatbot-fullpage-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === 'bot' ? '🤖' : '👤'}</div>
                  <div className="message-content"><p>{msg.content}</p></div>
                </div>
              ))}
              {isDocumentAnalyzing && (<div className="chat-message bot"><div className="message-avatar">🤖</div><div className="message-content"><p>📄 Analyzing document...</p></div></div>)}
            </div>
            <div className="chatbot-fullpage-upload">
              <label className="upload-btn">📤 Upload Aadhaar Card<input type="file" accept=".pdf,.jpg,.png" onChange={handleDocumentUpload} hidden /></label>
              <label className="upload-btn">📤 Upload PAN Card<input type="file" accept=".pdf,.jpg,.png" onChange={handleDocumentUpload} hidden /></label>
              {documentData && <div className="upload-success">✅ {documentData.type} analyzed!</div>}
            </div>
            <div className="chatbot-fullpage-suggestions">
              {quickSuggestions.map((suggestion, i) => (
                <button key={i} className="suggestion-chip" onClick={() => { setChatInput(suggestion); sendChatMessage(); }}>{suggestion}</button>
              ))}
            </div>
            <div className="chatbot-fullpage-input">
              <input type="text" placeholder="Ask about PM-KISAN, Ayushman Bharat, Mudra Loan..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()} />
              <button onClick={sendChatMessage}>Send 📤</button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="emergency"><h4>📞 Emergency Helplines</h4><p>🚓 Police: 100 | 🚑 Ambulance: 102 | 👩 Women: 1091 | 👶 Child: 1098 | 🆘 Emergency: 112</p></div>
          <div className="copyright"><p>© 2026 JanSahay - Government of India</p></div>
        </div>
      </footer>

      {/* Floating Chatbot Button */}
      <div className="chatbot-container">
        {!showChatbot ? (
          <button className="chatbot-toggle-btn" onClick={() => setShowChatbot(true)}>🤖</button>
        ) : (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <div><span className="chatbot-icon">🤖</span> JanSahay AI</div>
              <button className="chatbot-close" onClick={() => setShowChatbot(false)}>✕</button>
            </div>
            <div className="chatbot-messages">
              {chatMessages.slice(-6).map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === 'bot' ? '🤖' : '👤'}</div>
                  <div className="message-content"><p>{msg.content.substring(0, 100)}...</p></div>
                </div>
              ))}
            </div>
            <div className="chatbot-input">
              <input type="text" placeholder="Ask me..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()} />
              <button onClick={sendChatMessage}>📤</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;