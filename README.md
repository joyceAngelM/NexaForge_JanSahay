JanSahay - सरकारी योजना, अब आसान
JanSahay is a voice-first AI platform helping rural citizens across India access government welfare schemes in their own language.

Problem Statement
Millions of rural citizens in India miss out on government welfare schemes because rules are written in complex English, apps assume smartphone skills, and documents are confusing. Only 30 percent of eligible people ever manage to apply successfully.

Our Solution
JanSahay solves this with a voice-first AI platform. Citizens simply speak their query in their local language, and the AI instantly finds and explains eligible schemes in simple spoken words. No reading, no typing, and no smartphone skills are required.

Key Features
The platform includes a Voice AI Assistant that supports 9 Indian languages. There is an AI Chatbot that allows users to upload Aadhaar or PAN for instant scheme matching. A Scheme Catalog offers 500 plus schemes with ratings and reviews. A Scheme Comparison Tool lets users compare benefits, documents, and success rates. An Eligibility Checker uses AI to match user profiles with confidence scores. An Application Tracker provides real time status updates. A Deadline Calendar helps users never miss application deadlines. A CSC Locator helps find nearest Common Service Centers.

Tech Stack
The frontend is built with React.js as a mobile first PWA. The backend uses Node.js REST API. Voice features use the Web Speech API. The AI Core runs on Ollama with Llama 3.2 as a local LLM. Translation is handled by Google Translate API supporting 9 plus languages. Authentication uses OTP mobile login with no passwords required.

System Architecture
The system follows a modular client server architecture. The user layer consists of a React PWA with voice UI. This connects to an API Gateway built with Node.js that handles OTP authentication, scheme data, CSC lookup, and translation proxying. The data layer stores scheme catalogs, encrypted user profiles, and application trackers. The AI layer runs Ollama with Llama 3.2 locally on the device or edge. External APIs include Google Translate and planned integrations with DigiLocker. The platform is offline first, meaning core features work without internet, and privacy first, meaning documents never leave the user's device.

Implementation Methodology
The project follows Agile methodology with two week sprints. Phase one covers foundation including scheme catalog, OTP login, and basic voice support for Hindi and English in four weeks. Phase two covers AI core including Llama 3.2 integration, document upload, and eligibility matching in four weeks. Phase three covers support tools including application tracker, deadline calendar, and CSC locator in three weeks. Phase four covers language expansion to 9 languages with offline translation cache in three weeks. Phase five is a rural pilot testing in five villages with feedback collection and UI iteration over four weeks. Phase six is scaling with state wide rollout and DigiLocker integration over six weeks.

Technical Challenges and Solutions
The team faced seven major challenges. First, running AI on low end devices was difficult, so they used a quantized 4 bit model with WASM runtime. Second, speech accuracy for local dialects was poor, so they added keyword spotting, phonetic matching, and user confirmation steps. Third, low or no internet connectivity in rural areas required an offline first approach using IndexedDB cache and SMS fallback. Fourth, users were concerned about document privacy, so all Aadhaar and PAN processing happens locally on the device using Ollama, never sent to servers. Fifth, multi language UI scaling for 9 languages was managed with i18n and dynamic JSON loading. Sixth, voice latency on 2G networks was reduced by caching frequent queries and pre loading common responses. Seventh, user trust and adoption was improved through CSC center onboarding, WhatsApp sharing, and a voice first design that requires no reading.

Scalability
The platform is designed for 10 million concurrent users. The backend scales horizontally using Kubernetes with auto scaling based on request volume. The database is sharded by state or region with read replicas for the scheme catalog. The AI layer uses load balanced Ollama instances with cloud LLM overflow as fallback. Static assets are served via CDN with scheme data cached at edge. Current support includes 9 languages but can scale to 50 plus languages. Current support includes 500 schemes but can scale to 3000 plus schemes including all state and central schemes. Cost per user is approximately 2 rupees per month due to offline first design and local LLM. Target growth is 500,000 users across 5 states in year one, 5 million users across 15 states in year two, and 50 million users pan India in year three.

JanSahay - Making Government Welfare Accessible for Every Citizen

