Checkpoint-1 
Helping Citizens Access Government Schemes — In Their Own Language.
Problem Statement -
In India, millions of eligible citizens miss out on government benefits —  not because they are not eligible, but because they don’t understand how to access them.
- Complex and lengthy government documents  
- Language barriers for non-English speakers  
- Low digital literacy in rural areas  
- Lack of awareness about available schemes  
This is not a lack of schemes — it is a lack of accessibility.

Our Idea — *JanSahay-Sarkari Yojana, Ab Aasaan.*

JanSahay is a voice-first web platform designed to simplify access to government schemes.
Users can:
🎤 Ask questions in their own language  
✅ Check eligibility through simple guided questions  
📄 Get clear, step-by-step guidance to apply  

Theme Alignment -Web Development for Digital Transformation & Social Impact

JanSahay leverages web technologies to transform how citizens interact with government services.
- Converts static scheme information into an interactive AI-driven experience  
- Uses voice-based interaction to remove literacy barriers  
- Makes digital services accessible to underserved communities  

This project contributes to:
Digital Transformation — by simplifying access through web + AI  
Social Impact — by empowering citizens with awareness and access.

Planned Features (MVP)
- Voice Input & Output (Regional Mother Tongue)  
- AI-powered Eligibility Checker  
- Simplified Scheme Information  
- Step-by-step Application Guidance  
- Language Toggle for accessibility  
  How It Works
1. User asks a query (voice/text)  
2. System processes requests using AI.
3. User answers simple eligibility questions.  
4. The system provides the result.
5. Guidance is given for the next steps.

Checkpoint-2
Technical Architecture & Innovation
JanSahay is designed as a voice-first web platform that bridges the gap between complex government documents and rural citizens.
Frontend:
- Built using React.js
- Component-based architecture for reusable UI
- Fast and responsive interface for a smooth user experience
- Designed for simplicity and accessibility (even for first-time users)

Backend:
- Built using Node.js
- Handles API requests and data processing
- Uses non-blocking I/O for efficient performance
- Supports file handling (PDF processing and uploads)

Voice Interaction
- Implemented using Web Speech API
- Enables:
    - Speech-to-text (user input)
    - Text-to-speech (system response)
- Supports multiple languages (planned: 12+ Indian languages)
- No additional cost (browser-based)

Document Processing
-PDF Parsing for extracting text from government documents
-Tesseract.js (OCR) for scanned documents
- Converts complex PDFs into simple, understandable information

AI & Language Processing
- Uses Ollama (Local LLM)  
  - Runs locally (no internet dependency for core logic)
  - Ensures faster and privacy-focused processing  
- Integrated Google Translate API
  - Enables multi-language support  
  - Makes system usable across different regions  

Authentication (User-Friendly Design)
- Phone number + OTP-based login  
- No email required  
- No password to remember  
Key Innovation
- Voice-first interaction removes literacy barriers  
- Local LLM reduces dependency on internet/cloud  
- Simplifies complex government documents into actionable steps  
- Focuses on accessibility rather than just information delivery  

Why This Matters
JanSahay is not just a technical solution — it is a digital bridge between:
Government systems  and Rural Citizens.

Checkpoint-3
JanSahay has been significantly enhanced with AI-powered voice assistance using *Ollama's Llama 3.2* model, enabling intelligent real-time responses about government schemes in Hindi and English. New features include one-click WhatsApp sharing of scheme details, downloadable scheme summaries as text files, and an application tracker that saves user submissions locally. The voice assistant now understands specific queries about PM-KISAN, Ayushman Bharat, Mudra loans, Sukanya Samriddhi, and PM Awas Yojana, providing instant accurate responses with text-to-speech feedback. The platform continues to support OTP mobile login, multilingual interface, PDF upload with AI parsing, eligibility checking, and officer locator.The working project video has been attached!


Making schemes not just available — but accessible and usable!
