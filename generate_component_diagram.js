const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// Canvas Dimensions - Ultra HD 4K Architecture Canvas
const W = 3800;
const H = 2500;

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateComponentDiagramSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060A13"/>
      <stop offset="50%" stop-color="#0B1322"/>
      <stop offset="100%" stop-color="#070D18"/>
    </linearGradient>

    <!-- Tier 1 Header Gradient (Client / Sky Blue) -->
    <linearGradient id="gradTier1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>

    <!-- Tier 2 Header Gradient (Backend / Emerald & Teal) -->
    <linearGradient id="gradTier2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Tier 3 Header Gradient (ML Service / Purple) -->
    <linearGradient id="gradTier3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#6D28D9"/>
    </linearGradient>

    <!-- Tier 4 Header Gradient (Database / Rose) -->
    <linearGradient id="gradTier4" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#BE123C"/>
    </linearGradient>

    <!-- Tier 5 Header Gradient (External / Teal) -->
    <linearGradient id="gradTier5" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0D9488"/>
      <stop offset="100%" stop-color="#0F766E"/>
    </linearGradient>

    <!-- Arrow Markers -->
    <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38BDF8"/>
    </marker>
    <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#34D399"/>
    </marker>
    <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#A855F7"/>
    </marker>
    <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#FB7185"/>
    </marker>
    <marker id="arrow-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#2DD4BF"/>
    </marker>
    <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#FBBF24"/>
    </marker>

    <!-- Drop Shadow Filters -->
    <filter id="shadowBox" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

  <!-- Subtle Blueprint Tech Grid Background -->
  <g stroke="#38BDF8" stroke-opacity="0.035" stroke-width="1">
    ${Array.from({ length: Math.floor(W / 60) }).map((_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="${H}"/>`).join('')}
    ${Array.from({ length: Math.floor(H / 60) }).map((_, i) => `<line x1="0" y1="${i * 60}" x2="${W}" y2="${i * 60}"/>`).join('')}
  </g>

  <!-- ==================== HEADER SECTION ==================== -->
  <g id="header">
    <rect x="70" y="30" width="${W - 140}" height="84" rx="14" fill="#0F172A" stroke="#1E293B" stroke-width="2" filter="url(#shadowBox)"/>
    <rect x="70" y="30" width="10" height="84" rx="4" fill="#38BDF8"/>
    
    <text x="105" y="70" font-family="'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="1">
      AYURWELL HEALTHCARE PLATFORM — UML COMPONENT ARCHITECTURE DIAGRAM
    </text>
    <text x="105" y="98" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500" fill="#94A3B8">
      Formal UML 2.5 Component Specification • Subsystem Topography • Explicit Interfaces &amp; Dependency Contracts • Polyglot Architecture
    </text>

    <!-- Header Chips / Legend -->
    <g transform="translate(${W - 1280}, 50)">
      <!-- Legend Item: Component -->
      <g transform="translate(0, 0)">
        <rect x="0" y="6" width="22" height="18" fill="#1E293B" stroke="#38BDF8" stroke-width="2" rx="2"/>
        <rect x="-4" y="9" width="7" height="4" fill="#38BDF8"/>
        <rect x="-4" y="16" width="7" height="4" fill="#38BDF8"/>
        <text x="32" y="21" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F1F5F9">UML Component</text>
      </g>
      <!-- Legend Item: Provided Interface -->
      <g transform="translate(180, 0)">
        <line x1="0" y1="15" x2="16" y2="15" stroke="#34D399" stroke-width="2.5"/>
        <circle cx="21" cy="15" r="5.5" fill="#0F172A" stroke="#34D399" stroke-width="2.5"/>
        <text x="36" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F1F5F9">Provided Interface (○)</text>
      </g>
      <!-- Legend Item: Required Interface -->
      <g transform="translate(390, 0)">
        <line x1="0" y1="15" x2="16" y2="15" stroke="#FBBF24" stroke-width="2.5"/>
        <path d="M 23 9 A 6 6 0 0 1 23 21" fill="none" stroke="#FBBF24" stroke-width="2.5"/>
        <text x="36" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F1F5F9">Required Interface ())</text>
      </g>
      <!-- Legend Item: Dependency -->
      <g transform="translate(600, 0)">
        <line x1="0" y1="15" x2="25" y2="15" stroke="#38BDF8" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrow-cyan)"/>
        <text x="38" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F1F5F9">«use» Dependency</text>
      </g>
      <!-- Legend Item: Microservice -->
      <g transform="translate(790, 0)">
        <rect x="0" y="5" width="20" height="20" rx="4" fill="#7C3AED" stroke="#C084FC" stroke-width="1.5"/>
        <text x="30" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F1F5F9">FastAPI Microservice</text>
      </g>
      <!-- Legend Item: Relational DB -->
      <g transform="translate(980, 0)">
        <rect x="0" y="5" width="20" height="20" rx="4" fill="#E11D48" stroke="#FDA4AF" stroke-width="1.5"/>
        <text x="30" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F1F5F9">PostgreSQL DB</text>
      </g>
    </g>
  </g>

  <!-- ==================== TIER 1: CLIENT PRESENTATION TIER ==================== -->
  <g id="tier1">
    <rect x="70" y="140" width="${W - 140}" height="390" rx="14" fill="#0B132B" stroke="#0284C7" stroke-width="2.5" filter="url(#shadowBox)"/>
    <rect x="70" y="140" width="${W - 140}" height="44" rx="14" fill="url(#gradTier1)"/>
    <rect x="70" y="170" width="${W - 140}" height="14" fill="url(#gradTier1)"/>
    <text x="95" y="170" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="900" fill="#FFFFFF" letter-spacing="1">
      «subsystem» PRESENTATION TIER — AYURWELL SINGLE PAGE APPLICATION (React 18.2 • TypeScript 5 • Vite 5 • Responsive PWA)
    </text>
    <rect x="${W - 380}" y="150" width="290" height="24" rx="12" fill="#0C4A6E"/>
    <text x="${W - 235}" y="167" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#7DD3FC" text-anchor="middle">
      Client Runtime: Browser DOM / ES Modules
    </text>

    <!-- 5 Client Components -->
    <!-- C1.1 Web UI Shell & Auth -->
    <g transform="translate(95, 205)">
      <rect width="690" height="295" rx="10" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
      <g transform="translate(650, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#38BDF8" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#38BDF8"/>
        <rect x="-4" y="11" width="7" height="4" fill="#38BDF8"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#38BDF8">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Web UI Shell &amp; Auth Component</text>
      <line x1="20" y1="68" x2="670" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#93C5FD">● AppLayout / ProtectedRoute</text>
      <text x="20" y="118" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#93C5FD">● AuthPage (Login, Register, OTP Verify)</text>
      <text x="20" y="142" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#93C5FD">● ProfilePage &amp; Onboarding Baseline</text>
      <text x="20" y="166" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#93C5FD">● TokenStorage (JWT Bearer Token Handler)</text>
      <text x="20" y="190" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#93C5FD">● AxiosHttpClient (CORS &amp; Auth Interceptors)</text>

      <rect x="20" y="215" width="650" height="62" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="238" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#38BDF8">PROVIDED INTERFACES:</text>
      <text x="180" y="238" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">WebClientRouter, UserSessionContext</text>
      <text x="35" y="260" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FBBF24">REQUIRED INTERFACES:</text>
      <text x="180" y="260" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">HTTP /api/auth/*, /api/users/*</text>
    </g>

    <!-- C1.2 Prakriti Assessment UI -->
    <g transform="translate(815, 205)">
      <rect width="690" height="295" rx="10" fill="#0F172A" stroke="#34D399" stroke-width="2"/>
      <g transform="translate(650, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#34D399" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#34D399"/>
        <rect x="-4" y="11" width="7" height="4" fill="#34D399"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#34D399">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Prakriti &amp; Dosha Assessment UI</text>
      <line x1="20" y1="68" x2="670" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#A7F3D0">● PrakritiQuizPage (30 Clinical Questions)</text>
      <text x="20" y="118" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#A7F3D0">● DoshaScoreRadar (Vata-Pitta-Kapha %)</text>
      <text x="20" y="142" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#A7F3D0">● AgniFireClassifier (Sama, Vishama, etc.)</text>
      <text x="20" y="166" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#A7F3D0">● PrakritiResultCard &amp; Recommendations</text>
      <text x="20" y="190" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#A7F3D0">● LocalStorage Diagnostic Cache Engine</text>

      <rect x="20" y="215" width="650" height="62" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="238" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#34D399">PROVIDED INTERFACES:</text>
      <text x="180" y="238" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">IDoshaEvaluationView, QuizStateContext</text>
      <text x="35" y="260" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FBBF24">REQUIRED INTERFACES:</text>
      <text x="180" y="260" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">HTTP /api/assessment/*</text>
    </g>

    <!-- C1.3 Diet Engine & Viruddha UI -->
    <g transform="translate(1535, 205)">
      <rect width="700" height="295" rx="10" fill="#0F172A" stroke="#FBBF24" stroke-width="2"/>
      <g transform="translate(660, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#FBBF24" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#FBBF24"/>
        <rect x="-4" y="11" width="7" height="4" fill="#FBBF24"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Dietary Engine &amp; Viruddha UI</text>
      <line x1="20" y1="68" x2="680" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDE68A">● DiseaseDietPlannerPage (7-Day Schedule)</text>
      <text x="20" y="118" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDE68A">● ViruddhaCheckerPage (Toxic Pairing Scan)</text>
      <text x="20" y="142" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDE68A">● BudgetPlannerPage (Daily ₹ Spend Optimizer)</text>
      <text x="20" y="166" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDE68A">● SeasonalRitucharyaPage (6 Ritu Regimens)</text>
      <text x="20" y="190" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDE68A">● RecipeExplorerPage &amp; Calorie Counter</text>

      <rect x="20" y="215" width="660" height="62" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="238" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FBBF24">PROVIDED INTERFACES:</text>
      <text x="180" y="238" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">IDietPlanView, IViruddhaScannerView</text>
      <text x="35" y="260" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FBBF24">REQUIRED INTERFACES:</text>
      <text x="180" y="260" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">HTTP /api/diet-plans/*, /api/viruddha/*</text>
    </g>

    <!-- C1.4 Women's Health UI -->
    <g transform="translate(2265, 205)">
      <rect width="690" height="295" rx="10" fill="#0F172A" stroke="#F472B6" stroke-width="2"/>
      <g transform="translate(650, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#F472B6" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#F472B6"/>
        <rect x="-4" y="11" width="7" height="4" fill="#F472B6"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#F472B6">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Women&apos;s Health &amp; Cycle Tracker UI</text>
      <line x1="20" y1="68" x2="670" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FBCFE8">● WomensHealthPage (Life-Stage Pathways)</text>
      <text x="20" y="118" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FBCFE8">● MenstrualCycleTracker (Follicular/Luteal)</text>
      <text x="20" y="142" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FBCFE8">● PregnancyTrimesterPlan (Iron &amp; Folate)</text>
      <text x="20" y="166" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FBCFE8">● MenopauseRasayana &amp; Hot Flash Tracker</text>
      <text x="20" y="190" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FBCFE8">● DailySymptomLogger (Flow, Mood, Pain)</text>

      <rect x="20" y="215" width="650" height="62" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="238" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#F472B6">PROVIDED INTERFACES:</text>
      <text x="180" y="238" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">IWomensHealthView, CycleCalendarProps</text>
      <text x="35" y="260" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FBBF24">REQUIRED INTERFACES:</text>
      <text x="180" y="260" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">HTTP /api/womens-health/*</text>
    </g>

    <!-- C1.5 AI Assistant & Analytics UI -->
    <g transform="translate(2985, 205)">
      <rect width="690" height="295" rx="10" fill="#0F172A" stroke="#818CF8" stroke-width="2"/>
      <g transform="translate(650, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#818CF8" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#818CF8"/>
        <rect x="-4" y="11" width="7" height="4" fill="#818CF8"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#818CF8">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">AI Assistant &amp; Analytics UI</text>
      <line x1="20" y1="68" x2="670" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#C7D2FE">● AiAssistantPage (Vedic Chat Dialogue)</text>
      <text x="20" y="118" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#C7D2FE">● AnalyticsPage (Macro &amp; Micro Breakdown)</text>
      <text x="20" y="142" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#C7D2FE">● RemindersPage (Circadian Dinacharya Alarms)</text>
      <text x="20" y="166" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#C7D2FE">● DatasetExplorerPage (ICMR-NIN IFCT 2017)</text>
      <text x="20" y="190" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#C7D2FE">● AyurScoreHolisticGauge &amp; Trend Charts</text>

      <rect x="20" y="215" width="650" height="62" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="238" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#818CF8">PROVIDED INTERFACES:</text>
      <text x="180" y="238" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">IAiChatView, IAnalyticsDashboard</text>
      <text x="35" y="260" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FBBF24">REQUIRED INTERFACES:</text>
      <text x="180" y="260" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">HTTP /api/llm/*, /api/analytics/*</text>
    </g>
  </g>

  <!-- ==================== INTER-TIER CONNECTOR BAR (REST API / HTTPS) ==================== -->
  <g id="api-contracts" transform="translate(70, 545)">
    <rect width="${W - 140}" height="46" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
    <text x="${(W - 140) / 2}" y="28" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="#38BDF8" text-anchor="middle" letter-spacing="1.5">
      ▼ HTTPS / TLS REST API GATEWAY CONTRACTS (JSON Payload • Bearer JWT Authentication • RFC 7519) ▼
    </text>
  </g>

  <!-- Clean Connectors from Tier 1 to Tier 2 (fill="none" prevents black polygon bug) -->
  <path d="M 440 500 L 440 598" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow-cyan)"/>
  <path d="M 1160 500 L 1160 598" fill="none" stroke="#34D399" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow-emerald)"/>
  <path d="M 1885 500 L 1885 598" fill="none" stroke="#FBBF24" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow-amber)"/>
  <path d="M 2610 500 L 2610 598" fill="none" stroke="#F472B6" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow-rose)"/>
  <path d="M 3330 500 L 3330 598" fill="none" stroke="#818CF8" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow-purple)"/>

  <!-- ==================== TIER 2: CORE APPLICATION & BUSINESS LOGIC TIER ==================== -->
  <g id="tier2">
    <rect x="70" y="605" width="${W - 140}" height="800" rx="14" fill="#061A19" stroke="#10B981" stroke-width="2.5" filter="url(#shadowBox)"/>
    <rect x="70" y="605" width="${W - 140}" height="44" rx="14" fill="url(#gradTier2)"/>
    <rect x="70" y="635" width="${W - 140}" height="14" fill="url(#gradTier2)"/>
    <text x="95" y="635" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="900" fill="#FFFFFF" letter-spacing="1">
      «subsystem» APPLICATION &amp; BUSINESS LOGIC TIER — AYURWELL SPRING BOOT CORE (Spring Boot 3.2 • Java 17 • Spring Security)
    </text>
    <rect x="${W - 400}" y="615" width="310" height="24" rx="12" fill="#064E3B"/>
    <text x="${W - 245}" y="632" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#A7F3D0" text-anchor="middle">
      Backend Server Runtime: Embedded Tomcat (Port 8080)
    </text>

    <!-- ROW 1 OF TIER 2: 4 Primary Domain Components -->
    <!-- C2.1 Security & Auth Component -->
    <g transform="translate(95, 665)">
      <rect width="875" height="335" rx="10" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
      <g transform="translate(835, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#38BDF8" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#38BDF8"/>
        <rect x="-4" y="11" width="7" height="4" fill="#38BDF8"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#38BDF8">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Security &amp; Identity Management Component</text>
      <line x1="20" y1="68" x2="855" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#93C5FD">CONTROLLERS:</text>
      <text x="140" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">AuthController, UserController</text>
      
      <text x="20" y="120" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#93C5FD">SERVICES:</text>
      <text x="140" y="120" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">AuthService, EmailOtpService, UserService, EmailService</text>

      <text x="20" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#93C5FD">SECURITY ENGINE:</text>
      <text x="170" y="146" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">JwtAuthenticationFilter, SecurityFilterChain, BCrypt (Cost 10)</text>

      <text x="20" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#93C5FD">CORE LOGIC:</text>
      <text x="140" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">SHA-256 OTP hashing • 10-min expiration window • Rate-limited bruteforce guard</text>

      <rect x="20" y="195" width="835" height="120" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="222" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#38BDF8">PROVIDED INTERFACES (Endpoints):</text>
      <text x="35" y="246" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">POST /api/auth/register, POST /api/auth/login, POST /api/auth/verify-otp</text>
      <text x="35" y="268" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">GET /api/users/profile, PUT /api/users/profile, POST /api/auth/resend-otp</text>
      <text x="35" y="295" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">REQUIRED REPOSITORIES / SERVICES:</text>
      <text x="310" y="295" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">UserRepository, UserProfileRepository, EmailOtpRepository</text>
    </g>

    <!-- C2.2 Prakriti Diagnostic Component -->
    <g transform="translate(995, 665)">
      <rect width="875" height="335" rx="10" fill="#0F172A" stroke="#34D399" stroke-width="2"/>
      <g transform="translate(835, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#34D399" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#34D399"/>
        <rect x="-4" y="11" width="7" height="4" fill="#34D399"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#34D399">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Prakriti &amp; Dosha Diagnostic Component</text>
      <line x1="20" y1="68" x2="855" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#A7F3D0">CONTROLLERS:</text>
      <text x="140" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">DoshaAssessmentController</text>

      <text x="20" y="120" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#A7F3D0">SERVICES:</text>
      <text x="140" y="120" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">DoshaAssessmentService</text>

      <text x="20" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#A7F3D0">ALGORITHMIC ENGINE:</text>
      <text x="190" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Weighted 30-Question Tridosha matrix (Vata, Pitta, Kapha distribution)</text>

      <text x="20" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#A7F3D0">DIAGNOSTIC LOGIC:</text>
      <text x="175" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Dominant Prakriti • Dwandwaja dual dosha • Agni digestive fire profiling</text>

      <rect x="20" y="195" width="835" height="120" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="222" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#34D399">PROVIDED INTERFACES (Endpoints):</text>
      <text x="35" y="246" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">POST /api/assessment/submit (Calculate &amp; Persist Tridosha Profile)</text>
      <text x="35" y="268" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">GET /api/assessment/history, GET /api/assessment/latest</text>
      <text x="35" y="295" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">REQUIRED REPOSITORIES / SERVICES:</text>
      <text x="310" y="295" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">DoshaAssessmentRepository, UserProfileRepository</text>
    </g>

    <!-- C2.3 Dietary Planner & Viruddha Ahara Component -->
    <g transform="translate(1895, 665)">
      <rect width="895" height="335" rx="10" fill="#0F172A" stroke="#FBBF24" stroke-width="2"/>
      <g transform="translate(855, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#FBBF24" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#FBBF24"/>
        <rect x="-4" y="11" width="7" height="4" fill="#FBBF24"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Dietary Engine &amp; Viruddha Ahara Component</text>
      <line x1="20" y1="68" x2="875" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#FDE68A">CONTROLLERS:</text>
      <text x="140" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">DietPlannerController, RecipeController, ViruddhaCheckerController</text>

      <text x="20" y="120" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#FDE68A">SERVICES:</text>
      <text x="140" y="120" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">DietPlannerService, ViruddhaCheckerService, RecipeService</text>

      <text x="20" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#FDE68A">NUTRITION SCIENCE:</text>
      <text x="180" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">ICMR-NIN IFCT 2017 RDA alignment • Six Rasas • Virya thermal potency</text>

      <text x="20" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#FDE68A">TOXICOLOGY RULES:</text>
      <text x="180" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">18 Charaka Samhita Viruddha rules (Milk+Fish, Honey+Ghee 1:1, etc.)</text>

      <rect x="20" y="195" width="855" height="120" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="222" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">PROVIDED INTERFACES (Endpoints):</text>
      <text x="35" y="246" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">POST /api/diet-plans/generate, GET /api/diet-plans/active, GET /api/recipes</text>
      <text x="35" y="268" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">POST /api/viruddha/check (Pairwise Ahara Incompatibility Validator)</text>
      <text x="35" y="295" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">REQUIRED REPOSITORIES / SERVICES:</text>
      <text x="310" y="295" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">MealPlanRepository, RecipeRepository, ViruddhaCombinationRepository</text>
    </g>

    <!-- C2.4 Women's Health Lifecycle Component -->
    <g transform="translate(2815, 665)">
      <rect width="860" height="335" rx="10" fill="#0F172A" stroke="#F472B6" stroke-width="2"/>
      <g transform="translate(820, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#F472B6" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#F472B6"/>
        <rect x="-4" y="11" width="7" height="4" fill="#F472B6"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#F472B6">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Women&apos;s Health &amp; Stree Swasthya Component</text>
      <line x1="20" y1="68" x2="840" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#FBCFE8">CONTROLLERS:</text>
      <text x="140" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">WomensHealthController</text>

      <text x="20" y="120" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#FBCFE8">SERVICES:</text>
      <text x="140" y="120" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">WomensHealthService</text>

      <text x="20" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#FBCFE8">CLINICAL STAGES:</text>
      <text x="160" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Menstrual (Ritumati) • Pregnancy (Garbhini) • Menopause (Rajonivritti)</text>

      <text x="20" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#FBCFE8">PHYSIOLOGY RULES:</text>
      <text x="175" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Trimester 1-3 calorie (+350-450 kcal), Iron (27mg) &amp; Folate (500mcg) scaling</text>

      <rect x="20" y="195" width="820" height="120" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="222" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#F472B6">PROVIDED INTERFACES (Endpoints):</text>
      <text x="35" y="246" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">GET /api/womens-health/profile, PUT /api/womens-health/profile</text>
      <text x="35" y="268" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">POST /api/womens-health/logs, GET /api/womens-health/history</text>
      <text x="35" y="295" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">REQUIRED REPOSITORIES / SERVICES:</text>
      <text x="310" y="295" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">WomensHealthProfileRepository, WomensHealthLogRepository</text>
    </g>

    <!-- ROW 2 OF TIER 2: Analytics, AI Proxy, and Spring Data JPA Persistence Layer -->
    <!-- C2.5 Dinacharya & Health Analytics Component -->
    <g transform="translate(95, 1020)">
      <rect width="875" height="365" rx="10" fill="#0F172A" stroke="#818CF8" stroke-width="2"/>
      <g transform="translate(835, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#818CF8" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#818CF8"/>
        <rect x="-4" y="11" width="7" height="4" fill="#818CF8"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#818CF8">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Dinacharya &amp; Health Analytics Component</text>
      <line x1="20" y1="68" x2="855" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#C7D2FE">CONTROLLERS:</text>
      <text x="140" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">AnalyticsController, ReminderController</text>

      <text x="20" y="120" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#C7D2FE">SERVICES:</text>
      <text x="140" y="120" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">AnalyticsService, ReminderService</text>

      <text x="20" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#C7D2FE">METRICS ALGORITHM:</text>
      <text x="180" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Dynamic AyurScore (0-100 composite index combining intake, Agni, sleep)</text>

      <text x="20" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#C7D2FE">CIRCADIAN TIMERS:</text>
      <text x="175" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Dinacharya daily regimen (Brahma Muhurta, Ushapan, Abhyanga, Nidra)</text>

      <rect x="20" y="200" width="835" height="145" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="228" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#818CF8">PROVIDED INTERFACES (Endpoints):</text>
      <text x="35" y="254" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">GET /api/analytics/summary, GET /api/analytics/trends, POST /api/daily-logs</text>
      <text x="35" y="278" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">GET /api/reminders, POST /api/reminders, PUT /api/reminders/{id}</text>
      <text x="35" y="308" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">REQUIRED REPOSITORIES / SERVICES:</text>
      <text x="310" y="308" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">DailyHealthLogRepository, ReminderRepository</text>
      <text x="35" y="332" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#2DD4BF">NOTIFICATION DRIVER:</text>
      <text x="200" y="332" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#5EEAD4">JavaMailSender (OTP &amp; Schedule Alerts)</text>
    </g>

    <!-- C2.6 AI/ML Proxy & Assistant Component -->
    <g transform="translate(995, 1020)">
      <rect width="875" height="365" rx="10" fill="#0F172A" stroke="#C084FC" stroke-width="2"/>
      <g transform="translate(835, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#C084FC" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#C084FC"/>
        <rect x="-4" y="11" width="7" height="4" fill="#C084FC"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#C084FC">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">AI/ML Integration Proxy &amp; LLM Service</text>
      <line x1="20" y1="68" x2="855" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#E9D5FF">CONTROLLERS:</text>
      <text x="140" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">MlPredictionController, LlmChatController</text>

      <text x="20" y="120" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#E9D5FF">SERVICES:</text>
      <text x="140" y="120" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">MlDeficiencyPredictorService, LlmAiAssistantService</text>

      <text x="20" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#E9D5FF">RPC CLIENT ENGINE:</text>
      <text x="180" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Spring WebClient / RestTemplate with connection timeouts &amp; circuit fallback</text>

      <text x="20" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#E9D5FF">PROMPT PIPELINE:</text>
      <text x="175" y="172" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Injects User Prakriti, Agni state, and predicted nutrient gaps into LLM context</text>

      <rect x="20" y="200" width="835" height="145" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="228" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#C084FC">PROVIDED INTERFACES (Endpoints):</text>
      <text x="35" y="254" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">POST /api/ml/predict-risk, GET /api/ml/benchmark-metrics</text>
      <text x="35" y="278" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">POST /api/llm/chat (Ayurvedic Clinical Assistant Q&amp;A Gateway)</text>
      <text x="35" y="308" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">REQUIRED EXTERNAL INTERFACES:</text>
      <text x="280" y="308" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">HTTP :8000/api/v1/predict-deficiency, HTTPS LLM Provider</text>
    </g>

    <!-- C2.7 Data Access & JPA Persistence Component -->
    <g transform="translate(1895, 1020)">
      <rect width="1780" height="365" rx="10" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
      <g transform="translate(1740, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#10B981" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#10B981"/>
        <rect x="-4" y="11" width="7" height="4" fill="#10B981"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#10B981">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Spring Data JPA Persistence &amp; Repository Component</text>
      <line x1="20" y1="68" x2="1760" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#A7F3D0">PERSISTENCE INFRASTRUCTURE:</text>
      <text x="260" y="94" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">Hibernate ORM 6.4 • HikariCP Connection Pool (Max: 20) • Spring TransactionManager (@Transactional)</text>

      <!-- 15 Repository Badges in 3 Grid Columns -->
      <g transform="translate(20, 115)">
        <!-- Col 1 -->
        <g transform="translate(0, 0)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">1. UserRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">JpaRepository&lt;User, Long&gt;</text>
        </g>
        <g transform="translate(0, 38)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">2. UserProfileRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">JpaRepository&lt;UserProfile, Long&gt;</text>
        </g>
        <g transform="translate(0, 76)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">3. EmailOtpRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findByEmailAndVerifiedFalse()</text>
        </g>
        <g transform="translate(0, 114)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">4. DoshaAssessmentRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findTopByUserIdOrderByDateDesc()</text>
        </g>
        <g transform="translate(0, 152)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">5. MealPlanRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findByUserIdAndSeason()</text>
        </g>

        <!-- Col 2 -->
        <g transform="translate(580, 0)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">6. MealPlanItemRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findByMealPlanIdAndDayOfWeek()</text>
        </g>
        <g transform="translate(580, 38)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">7. RecipeRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findBySuitableDosha()</text>
        </g>
        <g transform="translate(580, 76)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">8. FoodItemRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findByCategoryAndDosha()</text>
        </g>
        <g transform="translate(580, 114)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">9. ViruddhaCombinationRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findConflictPair(foodA, foodB)</text>
        </g>
        <g transform="translate(580, 152)">
          <rect width="550" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">10. RawFoodCompositionRepository</text>
          <text x="320" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">ICMR-NIN IFCT 2017 Dataset</text>
        </g>

        <!-- Col 3 -->
        <g transform="translate(1160, 0)">
          <rect width="570" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">11. AyurvedicFoodProfileRepository</text>
          <text x="330" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Rasa, Virya, Vipaka mappings</text>
        </g>
        <g transform="translate(1160, 38)">
          <rect width="570" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">12. WomensHealthProfileRepository</text>
          <text x="330" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findByUserId(Long userId)</text>
        </g>
        <g transform="translate(1160, 76)">
          <rect width="570" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">13. WomensHealthLogRepository</text>
          <text x="330" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findByUserIdOrderByDateDesc()</text>
        </g>
        <g transform="translate(1160, 114)">
          <rect width="570" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">14. DailyHealthLogRepository</text>
          <text x="330" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findByUserIdAndLogDate()</text>
        </g>
        <g transform="translate(1160, 152)">
          <rect width="570" height="30" rx="5" fill="#1E293B"/>
          <text x="15" y="20" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">15. ReminderRepository</text>
          <text x="330" y="20" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">findByUserIdAndEnabledTrue()</text>
        </g>
      </g>

      <!-- Bottom JPA contract bar -->
      <rect x="20" y="310" width="1730" height="42" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="336" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#10B981">PROVIDED INTERFACE:</text>
      <text x="195" y="336" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">SpringDataJPARepositories (Type-Safe CRUD &amp; JPQL Queries)</text>
      <text x="960" y="336" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FB7185">REQUIRED DRIVER:</text>
      <text x="1100" y="336" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FDA4AF">JDBC Protocol / PostgreSQL Driver (org.postgresql.Driver)</text>
    </g>
  </g>

  <!-- ==================== INTER-TIER COMMUNICATION & DATA BUS BAR ==================== -->
  <g id="service-bus" transform="translate(70, 1415)">
    <!-- Segment 1: ML RPC Bus -->
    <rect x="0" y="0" width="1220" height="42" rx="6" fill="#1E293B" stroke="#7C3AED" stroke-width="1.5"/>
    <text x="610" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#D8B4FE" text-anchor="middle" letter-spacing="1">
      ▼ HTTP RPC (PORT 8000) • SCIKIT-LEARN DEFICIENCY INFERENCE &amp; SAMHITA EXPLAINABILITY ▼
    </text>

    <!-- Segment 2: Relational JDBC Bus -->
    <rect x="1260" y="0" width="1490" height="42" rx="6" fill="#1E293B" stroke="#E11D48" stroke-width="1.5"/>
    <text x="2005" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#FDA4AF" text-anchor="middle" letter-spacing="1">
      ▼ HIKARICP CONNECTION POOL (JDBC) • HIBERNATE 6.4 ORM • 15 RELATIONAL BCNF TABLES ▼
    </text>

    <!-- Segment 3: External Services Bus -->
    <rect x="2790" y="0" width="870" height="42" rx="6" fill="#1E293B" stroke="#0D9488" stroke-width="1.5"/>
    <text x="3225" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#5EEAD4" text-anchor="middle" letter-spacing="1">
      ▼ SMTP TLS (PORT 587) • HTTPS LLM CHAT COMPLETIONS (GEMINI / GROQ) ▼
    </text>
  </g>

  <!-- Clean Connectors from Tier 2 to Lower Tiers (fill="none" prevents black polygon bug) -->
  <path d="M 1432 1385 L 1432 1405 L 680 1405 L 680 1465" fill="none" stroke="#C084FC" stroke-width="3" stroke-dasharray="6,4" marker-end="url(#arrow-purple)"/>
  <path d="M 2785 1385 L 2785 1465" fill="none" stroke="#10B981" stroke-width="3" stroke-dasharray="6,4" marker-end="url(#arrow-emerald)"/>
  <path d="M 3295 1385 L 3295 1465" fill="none" stroke="#2DD4BF" stroke-width="3" stroke-dasharray="6,4" marker-end="url(#arrow-teal)"/>

  <!-- ==================== LOWER TIERS: TIER 3 (ML), TIER 4 (DB), TIER 5 (EXTERNAL) ==================== -->
  
  <!-- TIER 3: AI / ML & INTELLIGENCE MICROSERVICE (FastAPI) -->
  <g id="tier3">
    <rect x="70" y="1470" width="1220" height="580" rx="14" fill="#150E28" stroke="#7C3AED" stroke-width="2.5" filter="url(#shadowBox)"/>
    <rect x="70" y="1470" width="1220" height="44" rx="14" fill="url(#gradTier3)"/>
    <rect x="70" y="1500" width="1220" height="14" fill="url(#gradTier3)"/>
    <text x="95" y="1500" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="900" fill="#FFFFFF" letter-spacing="1">
      «subsystem» AI / ML &amp; INTELLIGENCE TIER (Python 3.10+ • FastAPI Microservice • Uvicorn :8000)
    </text>

    <!-- Component 3.1: Scikit-learn Prediction Engine -->
    <g transform="translate(95, 1535)">
      <rect width="570" height="490" rx="10" fill="#0F172A" stroke="#A855F7" stroke-width="2"/>
      <g transform="translate(530, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#A855F7" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#A855F7"/>
        <rect x="-4" y="11" width="7" height="4" fill="#A855F7"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#A855F7">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Nutrient Deficiency Predictor</text>
      <line x1="20" y1="68" x2="550" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#D8B4FE">FRAMEWORK &amp; LIBRARIES:</text>
      <text x="20" y="116" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">FastAPI 0.109+, Pydantic V2, Scikit-learn 1.4</text>

      <text x="20" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#D8B4FE">BEST MODEL SELECTED (5-Fold CV):</text>
      <text x="20" y="168" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#A7F3D0">★ RandomForestClassifier (Accuracy: 93.25%)</text>
      <text x="20" y="188" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" fill="#CBD5E1">F1-Score: 0.9318 • Precision: 0.9420 • Recall: 0.9400</text>

      <text x="20" y="218" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#D8B4FE">BENCHMARK COMPARISON SUITE:</text>
      <text x="20" y="238" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">● Gradient Boosting: 91.50% CV (Holdout: 92.00%)</text>
      <text x="20" y="258" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">● Support Vector Classifier (SVC): 88.50% CV</text>
      <text x="20" y="278" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">● Logistic Regression Baseline: 85.25% CV</text>

      <text x="20" y="308" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#D8B4FE">DEFICIENCY RISK TARGETS (RDA Gaps):</text>
      <text x="20" y="328" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" fill="#CBD5E1">Iron (Fe), Calcium (Ca), Vit B12, Vit D, Folate, Fiber</text>

      <rect x="20" y="355" width="530" height="115" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="380" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#A855F7">PROVIDED INTERFACES (FastAPI Endpoints):</text>
      <text x="35" y="404" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">POST /api/v1/predict-deficiency (IntakeRequest)</text>
      <text x="35" y="426" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">GET /api/v1/metrics (Model Benchmark Summary)</text>
      <text x="35" y="450" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FCD34D">Returns: Risk %, Confidence Probability, Food Items</text>
    </g>

    <!-- Component 3.2: LLM Reasoning & Explainability Gateway -->
    <g transform="translate(690, 1535)">
      <rect width="570" height="490" rx="10" fill="#0F172A" stroke="#C084FC" stroke-width="2"/>
      <g transform="translate(530, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#C084FC" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#C084FC"/>
        <rect x="-4" y="11" width="7" height="4" fill="#C084FC"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#C084FC">«component»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">LLM Explainability Gateway</text>
      <line x1="20" y1="68" x2="550" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#E9D5FF">REASONING ARCHITECTURE:</text>
      <text x="20" y="116" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#F8FAFC">Grounded Prompt Augmentation with Samhita Corpus</text>

      <text x="20" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#E9D5FF">AYURVEDIC SAFETY GUARDRAILS:</text>
      <text x="20" y="168" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Appends non-diagnostic clinical disclaimer • Prevents contradictory dietary advice • Validates against Viruddha database</text>

      <text x="20" y="218" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#E9D5FF">CONTEXTUAL INJECTION PIPELINE:</text>
      <text x="20" y="238" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">● User Prakriti: Vata, Pitta, Kapha dominance</text>
      <text x="20" y="258" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">● Agni Classification: Manda, Tikshna, Vishama</text>
      <text x="20" y="278" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">● Predicted Nutritional Intake Gaps (from ML model)</text>

      <rect x="20" y="355" width="530" height="115" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="380" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#C084FC">PROVIDED INTERFACES (Endpoints):</text>
      <text x="35" y="404" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#F8FAFC">POST /api/v1/explain-diet (LlmExplainRequest)</text>
      <text x="35" y="426" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FCD34D">REQUIRED INTERFACE:</text>
      <text x="35" y="450" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FCD34D">HTTPS /v1/chat/completions (External LLM Provider)</text>
    </g>
  </g>

  <!-- TIER 4: DATA PERSISTENCE & KNOWLEDGE STORAGE LAYER -->
  <g id="tier4">
    <rect x="1330" y="1470" width="1490" height="580" rx="14" fill="#200B14" stroke="#E11D48" stroke-width="2.5" filter="url(#shadowBox)"/>
    <rect x="1330" y="1470" width="1490" height="44" rx="14" fill="url(#gradTier4)"/>
    <rect x="1330" y="1500" width="1490" height="14" fill="url(#gradTier4)"/>
    <text x="1355" y="1500" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="900" fill="#FFFFFF" letter-spacing="1">
      «database» DATA PERSISTENCE &amp; KNOWLEDGE STORAGE (PostgreSQL 15+ / H2 In-Memory • ACID Relational Store)
    </text>

    <!-- 3 Relational Stores -->
    <!-- C4.1 User & Diagnostic Store -->
    <g transform="translate(1355, 1535)">
      <rect width="460" height="490" rx="10" fill="#0F172A" stroke="#FB7185" stroke-width="2"/>
      <g transform="translate(420, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#FB7185" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#FB7185"/>
        <rect x="-4" y="11" width="7" height="4" fill="#FB7185"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FB7185">«schema / tables»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">User &amp; Diagnostic Tables</text>
      <line x1="20" y1="68" x2="440" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <!-- Table details -->
      <g transform="translate(20, 85)">
        <rect width="420" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">users (PK: id)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Credentials, BCrypt hash, Role, OTP verified flag</text>
      </g>
      <g transform="translate(20, 145)">
        <rect width="420" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">user_profiles (FK: user_id)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Prakriti, Agni, BMI, daily budget (₹), disease target</text>
      </g>
      <g transform="translate(20, 205)">
        <rect width="420" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">email_otps (Email, OTP)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">SHA-256 hashed 6-digit tokens, 10-min TTL</text>
      </g>
      <g transform="translate(20, 265)">
        <rect width="420" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">dosha_assessments (FK: user_id)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Vata, Pitta, Kapha scores, dual Prakriti type</text>
      </g>
      <g transform="translate(20, 325)">
        <rect width="420" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">daily_health_logs (FK: user_id)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Intake calories, water, Agni status, AyurScore</text>
      </g>
      <g transform="translate(20, 385)">
        <rect width="420" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">reminders (FK: user_id)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Dinacharya circadian clock triggers, routine notes</text>
      </g>

      <rect x="20" y="445" width="420" height="30" rx="4" fill="#881337"/>
      <text x="230" y="465" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FFE4E6" text-anchor="middle">
        ACID Compliant • Strict Foreign Keys with Cascade
      </text>
    </g>

    <!-- C4.2 Food & Ayurvedic Knowledge Store -->
    <g transform="translate(1840, 1535)">
      <rect width="490" height="490" rx="10" fill="#0F172A" stroke="#FB7185" stroke-width="2"/>
      <g transform="translate(450, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#FB7185" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#FB7185"/>
        <rect x="-4" y="11" width="7" height="4" fill="#FB7185"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FB7185">«schema / tables»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Food &amp; Knowledge Base</text>
      <line x1="20" y1="68" x2="470" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <g transform="translate(20, 85)">
        <rect width="450" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">raw_food_composition (528 Items)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Official ICMR-NIN IFCT 2017 macro &amp; micro nutrients</text>
      </g>
      <g transform="translate(20, 145)">
        <rect width="450" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">ayurvedic_food_profiles (Dravyaguna)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Rasa (6 tastes), Virya (thermal), Vipaka (post-digestive)</text>
      </g>
      <g transform="translate(20, 205)">
        <rect width="450" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">viruddha_combinations (Ahara Rules)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Conflict food pairs, biological reason, antidote herbs</text>
      </g>
      <g transform="translate(20, 265)">
        <rect width="450" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">meal_plans (FK: user_id)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Weekly therapeutic diet schedule, target disease, cost</text>
      </g>
      <g transform="translate(20, 325)">
        <rect width="450" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">meal_plan_items (FK: plan_id)</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Breakfast, Lunch, Dinner, Snack portion gram weights</text>
      </g>
      <g transform="translate(20, 385)">
        <rect width="450" height="48" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">recipes &amp; food_items</text>
        <text x="15" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Preparation steps, medicinal indications, season fit</text>
      </g>

      <rect x="20" y="445" width="450" height="30" rx="4" fill="#881337"/>
      <text x="245" y="465" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FFE4E6" text-anchor="middle">
        ICMR-NIN IFCT 2017 Gold Standard Knowledge Base
      </text>
    </g>

    <!-- C4.3 Women's Health Store -->
    <g transform="translate(2355, 1535)">
      <rect width="440" height="490" rx="10" fill="#0F172A" stroke="#FB7185" stroke-width="2"/>
      <g transform="translate(400, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#FB7185" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#FB7185"/>
        <rect x="-4" y="11" width="7" height="4" fill="#FB7185"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FB7185">«schema / tables»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Stree Swasthya Store</text>
      <line x1="20" y1="68" x2="420" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <g transform="translate(20, 85)">
        <rect width="400" height="75" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">womens_health_profiles</text>
        <text x="15" y="44" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">FK: user_id (1:1)</text>
        <text x="15" y="62" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#CBD5E1">Cycle length (28d), trimester, iron RDA</text>
      </g>
      <g transform="translate(20, 175)">
        <rect width="400" height="75" rx="6" fill="#1E293B"/>
        <text x="15" y="24" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#FDA4AF">womens_health_logs</text>
        <text x="15" y="44" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">FK: user_id (1:N, Cascade)</text>
        <text x="15" y="62" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#CBD5E1">Daily phase symptoms, cramps, sleep, mood</text>
      </g>

      <rect x="20" y="270" width="400" height="160" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="35" y="295" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FB7185">DATABASE ENGINE DETAILS:</text>
      <text x="35" y="320" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">PostgreSQL 15.4 (Production)</text>
      <text x="35" y="342" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">H2 2.2.224 In-Memory (Dev/Test)</text>
      <text x="35" y="365" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">B-Tree Indexes on Foreign Keys</text>
      <text x="35" y="388" font-family="'Courier New', monospace" font-size="13" fill="#CBD5E1">15 Relational Entities Total</text>
      <text x="35" y="412" font-family="'Courier New', monospace" font-size="13" fill="#A7F3D0">BCNF / 3NF Normalized Schema</text>

      <rect x="20" y="445" width="400" height="30" rx="4" fill="#881337"/>
      <text x="220" y="465" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FFE4E6" text-anchor="middle">
        End-to-End Encryption for Health Data
      </text>
    </g>
  </g>

  <!-- TIER 5: EXTERNAL SERVICES & INTEGRATIONS -->
  <g id="tier5">
    <rect x="2860" y="1470" width="870" height="580" rx="14" fill="#071E1C" stroke="#0D9488" stroke-width="2.5" filter="url(#shadowBox)"/>
    <rect x="2860" y="1470" width="870" height="44" rx="14" fill="url(#gradTier5)"/>
    <rect x="2860" y="1500" width="870" height="14" fill="url(#gradTier5)"/>
    <text x="2885" y="1500" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="900" fill="#FFFFFF" letter-spacing="1">
      «subsystem» EXTERNAL SERVICES &amp; THIRD-PARTY ECOSYSTEM
    </text>

    <!-- C5.1 SMTP Mail Relay -->
    <g transform="translate(2885, 1535)">
      <rect width="820" height="145" rx="10" fill="#0F172A" stroke="#2DD4BF" stroke-width="2"/>
      <g transform="translate(780, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#2DD4BF" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#2DD4BF"/>
        <rect x="-4" y="11" width="7" height="4" fill="#2DD4BF"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#2DD4BF">«external service»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">SMTP Mail Relay (JavaMailSender)</text>
      <line x1="20" y1="68" x2="800" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Protocol: <tspan font-family="'Courier New', monospace" font-weight="700" fill="#5EEAD4">SMTP with STARTTLS (Port 587)</tspan> • Providers: Gmail SMTP / SendGrid</text>
      <text x="20" y="120" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Payload: 6-digit cryptographic OTP token with HTML branding template &amp; expiry notice</text>
    </g>

    <!-- C5.2 Cloud LLM Provider -->
    <g transform="translate(2885, 1700)">
      <rect width="820" height="160" rx="10" fill="#0F172A" stroke="#2DD4BF" stroke-width="2"/>
      <g transform="translate(780, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#2DD4BF" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#2DD4BF"/>
        <rect x="-4" y="11" width="7" height="4" fill="#2DD4BF"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#2DD4BF">«external service»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">External LLM Provider (Google Gemini / Groq / Ollama)</text>
      <line x1="20" y1="68" x2="800" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Protocol: <tspan font-family="'Courier New', monospace" font-weight="700" fill="#5EEAD4">HTTPS REST API / JSON Streaming</tspan></text>
      <text x="20" y="118" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Models Supported: Gemini 1.5 Pro / Flash, Llama-3-70B (Groq), Local Ollama (Mistral 7B)</text>
      <text x="20" y="142" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Function: Contextualized Ayurvedic dialogue, personalized recipe justifications, Sanskrit terms</text>
    </g>

    <!-- C5.3 ICMR-NIN IFCT Knowledge Repository -->
    <g transform="translate(2885, 1880)">
      <rect width="820" height="145" rx="10" fill="#0F172A" stroke="#2DD4BF" stroke-width="2"/>
      <g transform="translate(780, 14)">
        <rect x="0" y="0" width="24" height="18" fill="#1E293B" stroke="#2DD4BF" stroke-width="2" rx="2"/>
        <rect x="-4" y="3" width="7" height="4" fill="#2DD4BF"/>
        <rect x="-4" y="11" width="7" height="4" fill="#2DD4BF"/>
      </g>
      <text x="20" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#2DD4BF">«dataset repository»</text>
      <text x="20" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">ICMR-NIN IFCT 2017 Dataset Authority</text>
      <line x1="20" y1="68" x2="800" y2="68" stroke="#1E293B" stroke-width="1.5"/>

      <text x="20" y="94" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Source: <tspan font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" fill="#5EEAD4">National Institute of Nutrition (ICMR), Hyderabad, India</tspan></text>
      <text x="20" y="120" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">Parameters: 151 Nutritional components per raw food item • Canonical reference standards</text>
    </g>
  </g>

  <!-- ==================== FOOTER SPECIFICATION & TECH BADGES ==================== -->
  <g id="footer" transform="translate(70, 2090)">
    <rect width="${W - 140}" height="350" rx="14" fill="#0F172A" stroke="#1E293B" stroke-width="2" filter="url(#shadowBox)"/>

    <text x="35" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" letter-spacing="1">
      ARCHITECTURAL INTEGRITY &amp; SYSTEM PATTERNS SUMMARY
    </text>

    <!-- 4 Information Cards in Footer -->
    <!-- Card 1 -->
    <g transform="translate(35, 65)">
      <rect width="860" height="255" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="25" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#38BDF8">1. LOOSE COUPLING &amp; POLYGLOT COMPOSITION</text>
      <text x="25" y="62" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Clean Separation between Client (React), Core Engine (Spring Boot), and AI Service (FastAPI).</text>
      <text x="25" y="90" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Communication is contract-driven through REST over HTTPS with strict JSON serialization.</text>
      <text x="25" y="118" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Python machine learning service is isolated; failure does not disrupt core user flows.</text>
      <text x="25" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Scalable horizontally: Frontend static assets deploy to CDN, backend containers scale on demand.</text>
      <text x="25" y="174" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Stateless architecture: JWT verification eliminates sticky server session overhead.</text>
      <text x="25" y="212" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#7DD3FC">Pattern: Polyglot Microservices + Hexagonal Ports &amp; Adapters</text>
    </g>

    <!-- Card 2 -->
    <g transform="translate(930, 65)">
      <rect width="860" height="255" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="25" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#34D399">2. AYURVEDA CLINICAL KNOWLEDGE ENCAPSULATION</text>
      <text x="25" y="62" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Prakriti Assessment maps somatic phenotypes to Tridosha ratios with weighted scoring.</text>
      <text x="25" y="90" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Diet Engine satisfies ICMR-NIN RDA constraints while optimizing Rasa, Virya, and Vipaka.</text>
      <text x="25" y="118" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Viruddha Ahara Engine contains 18 Charaka Samhita food-interaction incompatibility rules.</text>
      <text x="25" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Stree Swasthya module implements stage-specific physiology regimens for women.</text>
      <text x="25" y="174" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Ritucharya seasonal engine adjusts food thermal potency based on solar transit.</text>
      <text x="25" y="212" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#6EE7B7">Domain: Classical Ayurveda (Brihat Trayi) + Modern Clinical Nutrition</text>
    </g>

    <!-- Card 3 -->
    <g transform="translate(1825, 65)">
      <rect width="860" height="255" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="25" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#FBBF24">3. HIGH-CONFIDENCE MACHINE LEARNING PIPELINE</text>
      <text x="25" y="62" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Random Forest Classifier selected via rigorous 5-fold cross-validation (93.25% accuracy).</text>
      <text x="25" y="90" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Evaluated against Gradient Boosting (91.5%), SVC (88.5%), and Logistic Regression (85.25%).</text>
      <text x="25" y="118" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Multi-nutrient risk assessment predicts deficiencies in Iron, Calcium, B12, D, Folate, Fiber.</text>
      <text x="25" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Grounded Vedic LLM gateway converts numeric predictions into actionable, safe advice.</text>
      <text x="25" y="174" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Automated disclaimer insertion ensures safe separation from medical diagnoses.</text>
      <text x="25" y="212" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FDE68A">ML Engine: Scikit-learn Random Forest + Pydantic Validation</text>
    </g>

    <!-- Card 4 -->
    <g transform="translate(2720, 65)">
      <rect width="905" height="255" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="25" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#F472B6">4. ENTERPRISE SECURITY &amp; DATA GOVERNANCE</text>
      <text x="25" y="62" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Stateless JWT Bearer Authentication with HMAC-SHA256 signature verification.</text>
      <text x="25" y="90" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● BCrypt password hashing (strength 10) &amp; cryptographic 6-digit Email OTP dispatch.</text>
      <text x="25" y="118" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Role-Based Access Control (ROLE_USER, ROLE_ADMIN) enforced via Spring Security Filters.</text>
      <text x="25" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● ACID-compliant relational persistence across 15 normalized tables in PostgreSQL/H2.</text>
      <text x="25" y="174" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#CBD5E1">● Referential integrity: Foreign keys with ON DELETE CASCADE and unique indices.</text>
      <text x="25" y="212" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#FDA4AF">Security: Spring Security 6.2 + JWT + BCrypt + Hibernate ORM</text>
    </g>
  </g>
</svg>`;
}

async function renderDiagram() {
  const svgContent = generateComponentDiagramSvg();
  
  const svgPath = path.join(__dirname, 'ayurwell_component_diagram.svg');
  const pngPath = path.join(__dirname, 'ayurwell_component_diagram.png');

  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log(`Saved Component Diagram SVG to ${svgPath}`);

  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: W
    },
    font: {
      loadSystemFonts: true
    }
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`Rendered High-Resolution PNG (${pngBuffer.length} bytes) to ${pngPath}`);

  const downloadsPath = 'C:\\Users\\dubey\\Downloads\\AyurWell_Component_Diagram.png';
  const desktopPath = 'C:\\Users\\dubey\\Desktop\\AyurWell_Component_Diagram.png';
  const downloadsSvgPath = 'C:\\Users\\dubey\\Downloads\\AyurWell_Component_Diagram.svg';

  try {
    fs.copyFileSync(pngPath, downloadsPath);
    fs.copyFileSync(pngPath, desktopPath);
    fs.copyFileSync(svgPath, downloadsSvgPath);
    console.log('Copied PNG and SVG to Downloads and Desktop');
  } catch (err) {
    console.error('Copy to system folders error:', err.message);
  }

  const artifactDir = 'C:\\Users\\dubey\\.gemini\\antigravity-ide\\brain\\4355294f-e04a-4d18-be9d-696a72e71e5d';
  try {
    fs.copyFileSync(pngPath, path.join(artifactDir, 'ayurwell_component_diagram.png'));
    fs.copyFileSync(svgPath, path.join(artifactDir, 'ayurwell_component_diagram.svg'));
    console.log('Copied diagram images to artifact directory');
  } catch (err) {
    console.error('Copy to artifact error:', err.message);
  }
}

renderDiagram().catch(console.error);
