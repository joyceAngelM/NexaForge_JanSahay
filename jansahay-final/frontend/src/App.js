import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [activeTab, setActiveTab] = useState('schemes');
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const [showTracker, setShowTracker] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [parsedScheme, setParsedScheme] = useState(null);

  // Languages in native script
  const languages = [
    { name: 'हिन्दी', code: 'hi', native: true },
    { name: 'English', code: 'en', native: false },
    { name: 'ಕನ್ನಡ', code: 'kn', native: true },
    { name: 'తెలుగు', code: 'te', native: true },
    { name: 'தமிழ்', code: 'ta', native: true },
    { name: 'മലയാളം', code: 'ml', native: true },
    { name: 'বাংলা', code: 'bn', native: true },
    { name: 'मराठी', code: 'mr', native: true },
    { name: 'ગુજરાતી', code: 'gu', native: true },
    { name: 'ଓଡ଼ିଆ', code: 'or', native: true }
  ];

  useEffect(() => {
    fetchSchemes();
    loadApplications();
  }, []);

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

  const saveApplications = (newApps) => {
    setApplications(newApps);
    localStorage.setItem('applications', JSON.stringify(newApps));
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
    alert(`✅ Applied for ${scheme.name}! Your application is under review.`);
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
        alert('Welcome to JanSahay! 🇮🇳');
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      alert('Error verifying OTP');
    }
  };

  // Voice Recognition
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      const langMap = {
        'hi': 'hi-IN', 'en': 'en-IN', 'kn': 'kn-IN', 'te': 'te-IN',
        'ta': 'ta-IN', 'ml': 'ml-IN', 'bn': 'bn-IN', 'mr': 'mr-IN',
        'gu': 'gu-IN', 'or': 'or-IN'
      };
      recognition.lang = langMap[selectedLanguage] || 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceResponse('🎤 Listening... Speak now');
      };

      recognition.onresult = async (event) => {
        const query = event.results[0][0].transcript;
        setVoiceQuery(query);
        setIsListening(false);
        setVoiceResponse(`🤔 I heard: "${query}". Let me help you...`);
        
        try {
          const response = await fetch('/api/voice/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, language: selectedLanguage })
          });
          const data = await response.json();
          setVoiceResponse(data.response);
          
          const utterance = new SpeechSynthesisUtterance(data.response);
          const voiceLangMap = { 'hi': 'hi-IN', 'en': 'en-US', 'kn': 'kn-IN', 'te': 'te-IN', 'ta': 'ta-IN' };
          utterance.lang = voiceLangMap[selectedLanguage] || 'hi-IN';
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          setVoiceResponse('Sorry, something went wrong. Please try again.');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceResponse('Please try again. Make sure your microphone is working.');
      };

      recognition.start();
    } else {
      alert('Voice recognition not supported. Please use Chrome browser.');
    }
  };

  const repeatVoice = () => {
    if (voiceResponse) {
      const utterance = new SpeechSynthesisUtterance(voiceResponse);
      const voiceLangMap = { 'hi': 'hi-IN', 'en': 'en-US', 'kn': 'kn-IN', 'te': 'te-IN', 'ta': 'ta-IN' };
      utterance.lang = voiceLangMap[selectedLanguage] || 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Share on WhatsApp
  const shareOnWhatsApp = (schemeName) => {
    const message = `🇮🇳 *JanSahay - Government Scheme Alert* 🇮🇳\n\n📋 *Scheme:* ${schemeName}\n✅ Apply via JanSahay - Your Government Scheme Assistant\n🔗 Apply now: http://localhost:3000\n\nजनसहाय - सरकारी योजना सहायक`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Download Scheme Summary
  const downloadSchemeSummary = (scheme) => {
    const summary = `========================================
  JANSAHAY - GOVERNMENT SCHEME SUMMARY
========================================

📋 SCHEME NAME: ${scheme.name}
📂 CATEGORY: ${scheme.category.toUpperCase()}

💰 BENEFITS:
${scheme.benefits?.map(b => `  • ${b}`).join('\n') || '  • Financial assistance provided'}

📄 REQUIRED DOCUMENTS:
${scheme.documents?.map(d => `  • ${d}`).join('\n') || '  • Aadhaar Card\n  • Income Certificate\n  • Residence Proof'}

✅ AI VERIFIED: Yes

📞 FOR MORE INFORMATION:
  • Helpline: 1800-180-1111
  • Website: http://localhost:3000

========================================
  JanSahay - सरकारी योजना सहायक
  Government Scheme Assistant
========================================`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${scheme.name.replace(/ /g, '_')}_Summary.txt`;
    link.click();
    alert(`📥 Downloaded: ${scheme.name} summary`);
  };

  // Check Eligibility
  const checkEligibility = () => {
    const age = document.getElementById('age')?.value;
    const income = document.getElementById('income')?.value;
    const occupation = document.getElementById('occupation')?.value;
    const gender = document.getElementById('gender')?.value;
    
    let eligibleSchemes = [];
    
    schemes.forEach(scheme => {
      if (scheme.category === 'farmer' && occupation === 'farmer') {
        eligibleSchemes.push(scheme);
      } else if (scheme.category === 'women' && gender === 'female') {
        eligibleSchemes.push(scheme);
      } else if (scheme.category === 'health' && (age < 18 || age > 60)) {
        eligibleSchemes.push(scheme);
      } else if (scheme.category === 'business' && occupation === 'business') {
        eligibleSchemes.push(scheme);
      } else if (scheme.category === 'housing' && income === 'below_50000') {
        eligibleSchemes.push(scheme);
      } else if (scheme.category === 'education' && (occupation === 'student' || age < 25)) {
        eligibleSchemes.push(scheme);
      }
    });
    
    const resultsDiv = document.getElementById('eligibility-results');
    if (eligibleSchemes.length > 0) {
      resultsDiv.innerHTML = `
        <h3>🎉 You are eligible for ${eligibleSchemes.length} schemes!</h3>
        ${eligibleSchemes.map(scheme => `
          <div class="eligible-scheme">
            <strong>${scheme.name}</strong>
            <p>${scheme.benefits?.join(', ') || 'Financial assistance and government support'}</p>
            <button onclick="document.getElementById('apply-btn-${scheme.name.replace(/ /g, '')}').click()">Apply Now →</button>
          </div>
        `).join('')}
      `;
    } else {
      resultsDiv.innerHTML = `
        <div class="no-results">
          <p>📋 Based on your inputs, no schemes match currently.</p>
          <p>Contact your local BDO office for personalized assistance.</p>
          <p>📞 Helpline: 1800-180-1111</p>
        </div>
      `;
    }
  };

  const searchOfficers = () => {
    const searchTerm = document.getElementById('officerSearch')?.value;
    if (searchTerm) {
      const officersList = document.getElementById('officers-list');
      officersList.innerHTML = `
        <div class="officer-card">
          <div class="officer-icon">👨‍💼</div>
          <div class="officer-info">
            <h4>District Collector - ${searchTerm}</h4>
            <p>📞 1800-123-4567</p>
            <p>📧 collector@${searchTerm}.gov.in</p>
            <p>📍 District Office, ${searchTerm}</p>
          </div>
        </div>
        <div class="officer-card">
          <div class="officer-icon">👩‍💼</div>
          <div class="officer-info">
            <h4>Block Development Officer - ${searchTerm}</h4>
            <p>📞 1800-123-4568</p>
            <p>📧 bdo@${searchTerm}.gov.in</p>
            <p>📍 Block Office, ${searchTerm}</p>
          </div>
        </div>
        <div class="officer-card">
          <div class="officer-icon">👨‍⚕️</div>
          <div class="officer-info">
            <h4>Chief Medical Officer - ${searchTerm}</h4>
            <p>📞 104</p>
            <p>📧 cmo@health.${searchTerm}.gov.in</p>
            <p>📍 District Hospital, ${searchTerm}</p>
          </div>
        </div>
      `;
    } else {
      alert('Please enter a district name');
    }
  };

  const filteredSchemes = schemes.filter(scheme =>
    scheme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="tricolor-bg"></div>
        <div className="login-card">
          <div className="ashoka-chakra">🔄</div>
          <h1>🇮🇳 JanSahay</h1>
          <p className="tagline">सरकारी योजना सहायक | Government Scheme Assistant</p>
          <h2>Secure Sign In</h2>
          <div className="input-group">
            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>
          {!showOtpInput ? (
            <button className="login-btn" onClick={sendOTP}>Send Secure OTP</button>
          ) : (
            <>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button className="login-btn" onClick={verifyOTP}>Verify & Login</button>
            </>
          )}
          <div className="emergency-footer">
            <span>🚓 100</span>
            <span>🚑 102</span>
            <span>👩 1091</span>
            <span>👶 1098</span>
            <span>🆘 112</span>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="app">
      <div className="tricolor-header">
        <div className="saffron"></div>
        <div className="white"></div>
        <div className="green"></div>
      </div>

      <header className="header">
        <div className="logo">
          <span className="ashoka">🔄</span>
          <h1>JanSahay <span className="govt">GOVERNMENT OF INDIA</span></h1>
        </div>
        <div className="language-selector">
          {languages.slice(0, 6).map(lang => (
            <button
              key={lang.code}
              className={`lang-btn ${selectedLanguage === lang.code ? 'active' : ''}`}
              onClick={() => setSelectedLanguage(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </header>

      <nav className="nav-bar">
        <button className={`nav-item ${activeTab === 'schemes' ? 'active' : ''}`} onClick={() => setActiveTab('schemes')}>
          📋 All Schemes
        </button>
        <button className={`nav-item ${activeTab === 'voice' ? 'active' : ''}`} onClick={() => setActiveTab('voice')}>
          🎤 Voice Assistant
        </button>
        <button className={`nav-item ${activeTab === 'eligibility' ? 'active' : ''}`} onClick={() => setActiveTab('eligibility')}>
          ✅ Check Eligibility
        </button>
        <button className={`nav-item ${activeTab === 'officers' ? 'active' : ''}`} onClick={() => setActiveTab('officers')}>
          👮 Find Officers
        </button>
        <button className={`nav-item ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')}>
          📋 My Applications
        </button>
      </nav>

      {activeTab === 'schemes' && (
        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search schemes by name, category, or benefits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <main className="main-content">
        {activeTab === 'schemes' && (
          <div className="schemes-container">
            <h2>🇮🇳 Government Schemes <span className="scheme-count">({filteredSchemes.length} schemes)</span></h2>
            <div className="schemes-grid">
              {filteredSchemes.map((scheme, index) => (
                <div key={index} className="scheme-card">
                  <div className="scheme-icon">
                    {scheme.category === 'health' && '🏥'}
                    {scheme.category === 'housing' && '🏠'}
                    {scheme.category === 'women' && '👩'}
                    {scheme.category === 'business' && '💼'}
                    {scheme.category === 'farmer' && '🌾'}
                    {scheme.category === 'education' && '📚'}
                  </div>
                  <h3>{scheme.name}</h3>
                  <span className={`category-badge ${scheme.category}`}>
                    {scheme.category === 'health' && '🏥 Health'}
                    {scheme.category === 'housing' && '🏠 Housing'}
                    {scheme.category === 'women' && '👩 Women & Child'}
                    {scheme.category === 'business' && '💼 Business'}
                    {scheme.category === 'farmer' && '🌾 Farmer'}
                    {scheme.category === 'education' && '📚 Education'}
                  </span>
                  {scheme.benefits && scheme.benefits.length > 0 && (
                    <div className="benefits">
                      <strong>Benefits:</strong>
                      <ul>
                        {scheme.benefits.slice(0, 2).map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="scheme-actions">
                    <button className="apply-btn" onClick={() => applyForScheme(scheme)}>
                      📝 Apply Now
                    </button>
                    <button className="whatsapp-btn" onClick={() => shareOnWhatsApp(scheme.name)}>
                      📱 Share
                    </button>
                    <button className="download-btn" onClick={() => downloadSchemeSummary(scheme)}>
                      📥 Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="voice-container">
            <div className="voice-card">
              <div className="voice-icon" onClick={startListening}>
                {isListening ? '🎤🔴 Listening...' : '🎤 Click to Speak'}
              </div>
              
              <select onChange={(e) => setSelectedLanguage(e.target.value)} className="voice-lang" value={selectedLanguage}>
                <option value="hi">हिन्दी</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="te">తెలుగు</option>
                <option value="ta">தமிழ்</option>
                <option value="ml">മലയാളം</option>
                <option value="bn">বাংলা</option>
                <option value="mr">मराठी</option>
                <option value="gu">ગુજરાતી</option>
                <option value="en">English</option>
              </select>
              
              {voiceQuery && (
                <div className="voice-query">
                  <strong>You said:</strong>
                  <p>"{voiceQuery}"</p>
                </div>
              )}
              
              {voiceResponse && (
                <div className="voice-response">
                  <strong>JanSahay Assistant:</strong>
                  <p>{voiceResponse}</p>
                  <button onClick={repeatVoice} className="repeat-btn">🔊 Repeat</button>
                </div>
              )}
              
              <div className="quick-commands">
                <p>Quick voice commands:</p>
                <button onClick={() => setVoiceQuery("PM-KISAN scheme details")}>🌾 PM-KISAN</button>
                <button onClick={() => setVoiceQuery("Health insurance schemes")}>🏥 Health</button>
                <button onClick={() => setVoiceQuery("Schemes for women")}>👩 Women</button>
                <button onClick={() => setVoiceQuery("Business loan schemes")}>💼 Business</button>
                <button onClick={() => setVoiceQuery("Housing schemes")}>🏠 Housing</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eligibility' && (
          <div className="eligibility-container">
            <div className="eligibility-card">
              <h2>✅ Check Scheme Eligibility</h2>
              <p>Answer a few questions to find schemes you qualify for</p>
              
              <div className="eligibility-form">
                <div className="form-group">
                  <label>Your Age</label>
                  <input type="number" id="age" placeholder="Enter your age" />
                </div>
                
                <div className="form-group">
                  <label>Annual Income (₹)</label>
                  <select id="income">
                    <option value="">Select income range</option>
                    <option value="below_50000">Below ₹50,000</option>
                    <option value="50000_2lakh">₹50,000 - ₹2 Lakh</option>
                    <option value="2lakh_5lakh">₹2 Lakh - ₹5 Lakh</option>
                    <option value="above_5lakh">Above ₹5 Lakh</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Occupation</label>
                  <select id="occupation">
                    <option value="">Select occupation</option>
                    <option value="farmer">Farmer / Kisan</option>
                    <option value="business">Business Owner</option>
                    <option value="salaried">Salaried Employee</option>
                    <option value="student">Student</option>
                    <option value="housewife">Housewife</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Gender</label>
                  <select id="gender">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <button className="check-eligibility-btn" onClick={checkEligibility}>
                  Find Eligible Schemes
                </button>
              </div>
              
              <div id="eligibility-results" className="eligibility-results"></div>
            </div>
          </div>
        )}

        {activeTab === 'officers' && (
          <div className="officers-container">
            <div className="officers-card">
              <h2>👮 Find Government Officers</h2>
              <p>Contact officials for scheme assistance</p>
              
              <div className="search-officer">
                <input type="text" id="officerSearch" placeholder="Enter district name (e.g., Bangalore, Delhi)" />
                <button onClick={searchOfficers}>Search</button>
              </div>
              
              <div id="officers-list" className="officers-list">
                <div className="officer-card">
                  <div className="officer-icon">👨‍💼</div>
                  <div className="officer-info">
                    <h4>District Collector</h4>
                    <p>📞 1800-123-4567</p>
                    <p>📧 collector@gov.in</p>
                    <p>📍 District Office, City</p>
                  </div>
                </div>
                <div className="officer-card">
                  <div className="officer-icon">👩‍💼</div>
                  <div className="officer-info">
                    <h4>Block Development Officer</h4>
                    <p>📞 1800-123-4568</p>
                    <p>📧 bdo@panchayat.gov.in</p>
                    <p>📍 Block Office, Taluk</p>
                  </div>
                </div>
                <div className="officer-card">
                  <div className="officer-icon">👨‍⚕️</div>
                  <div className="officer-info">
                    <h4>Chief Medical Officer</h4>
                    <p>📞 104</p>
                    <p>📧 cmo@health.gov.in</p>
                    <p>📍 District Hospital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="tracker-container">
            <div className="tracker-card">
              <h2>📋 My Scheme Applications</h2>
              {applications.length === 0 ? (
                <div className="no-applications">
                  <p>No applications yet.</p>
                  <p>Browse schemes and click "Apply Now" to track your applications here.</p>
                </div>
              ) : (
                <div className="applications-list">
                  {applications.map(app => (
                    <div key={app.id} className="application-card">
                      <div className="app-icon">
                        {app.category === 'farmer' && '🌾'}
                        {app.category === 'health' && '🏥'}
                        {app.category === 'housing' && '🏠'}
                        {app.category === 'women' && '👩'}
                        {app.category === 'business' && '💼'}
                      </div>
                      <div className="app-info">
                        <h4>{app.name}</h4>
                        <p>Applied on: {app.appliedDate}</p>
                        <span className={`status ${app.status === 'Approved' ? 'approved' : 'pending'}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="emergency">
            <h4>📞 Emergency Helplines</h4>
            <p>🚓 Police: 100 | 🚑 Ambulance: 102 | 👩 Women Helpline: 1091 | 👶 Child Helpline: 1098 | 🆘 Emergency: 112</p>
          </div>
          <div className="copyright">
            <p>© 2026 JanSahay - Government of India | सरकारी योजना सहायक</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;