# PRD — InterviewForge AI
### AI-Powered Mock Interview Platform
**Version:** 1.0 | **Status:** Planning | **Mentors:** Anthropic · Google · Meta · FAANG Leadership

---

## EXECUTIVE SUMMARY

InterviewForge AI is an end-to-end, AI-native mock interview platform built for fresh graduates and mid-level professionals who lack access to expensive coaching. It simulates real interview conditions — structured by level, role, and company — with immediate per-answer feedback, adaptive difficulty, multimodal input, social competition, and a self-improvement loop that keeps running until the user's answer quality peaks. The platform is respectful, growth-focused, and never judges — it only elevates.

---

## PROBLEM STATEMENT (from brief)

Fresh graduates have almost no access to realistic interview practice outside of expensive coaching institutes. Generic question banks do not adapt to the user's actual resume or target role, and there is no feedback on the quality of answers.

**Core Gaps:**
- Questions are generic, not resume-aware
- No real-time feedback loop
- No structured level-progression (HR → Technical → Behavioral → VP)
- No multimodal practice (voice, video, text)
- No social accountability or competition layer
- No self-improvement tracking over time

---

## VISION

> "Every person, regardless of background or budget, should be able to walk into any interview — FAANG or startup — fully prepared, confident, and coached."

---

## NORTH STAR METRIC

**Interview Readiness Score (IRS)** — a composite score across Communication, Technical Depth, Relevance, and Confidence that improves measurably session-over-session.

---

## THE HUMAN-IN-THE-LOOP ENHANCEMENT ENGINE (GOD MODE)

The core intelligence loop — inspired by RAG + reinforcement from human feedback:

```
USER ANSWER
    ↓
AI evaluates answer (pass threshold?)
    ↓ NO                     ↓ YES
Generate coaching tip     Log score
    ↓                        ↓
Prompt user to retry      Move to next question
    ↓
User re-answers
    ↓
[LOOP UNTIL: answer quality peaks OR max retries reached]
    ↓
Show improvement delta ("You improved 34% from attempt 1 to attempt 3")
```

This loop runs silently in the background — the user simply feels coached, not graded.

---

## USER PERSONAS

| Persona | Profile | Primary Need |
|---|---|---|
| Fresh Graduate | 0–1 yr exp, CS/non-CS | Affordable, realistic practice |
| Career Switcher | 2–5 yr, changing domain | Role-specific deep prep |
| Senior Engineer | 5+ yr, targeting FAANG | System design + behavioral mastery |
| Non-Technical Role | PM, HR, Marketing | Soft skills + situational practice |
| International Student | Non-English native | Multilingual support + communication coaching |

---

## FEATURE SPECIFICATIONS

---

### MODULE 1 — ONBOARDING & AUTH

**1.1 Authentication**
- Email / Google / GitHub / LinkedIn OAuth login
- JWT-based session management
- Privacy-first: no data sold, GDPR compliant
- Anonymous guest mode (limited features, no progress saved)

**1.2 Profile Setup**
- Name, target role, experience level, target companies
- Preferred interview language (multilingual)
- Upload resume/CV (PDF, DOCX)
- Upload photo for avatar personalization
- Professional dress code preference selection (Business Formal, Business Casual, Smart Casual)
- Timezone (for scheduling)

---

### MODULE 2 — RESUME & CV OPTIMIZER

**2.1 Resume Parsing**
- Extract: Skills, Experience, Projects, Education, Certifications
- NLP tagging: tech stack, soft skills, leadership signals, gaps
- ATS score with suggestions
- Section-by-section improvement tips (respectful, actionable tone)
- Before/After comparison view

**2.2 Resume-to-Question Mapping**
- Every question generated is anchored to a resume element
- "You mentioned React at XYZ Corp — tell me about a challenging UI problem you solved there."
- Constraint: Zero generic questions — 100% resume-grounded

**Claude's Suggestion:** Add a "Resume Gap Detector" — surfaces skills the target role requires that the resume lacks, with a learning roadmap to fill them.

---

### MODULE 3 — INTERVIEW STRUCTURE ENGINE (7-LEVEL SYSTEM)

All interviews follow the real-world hiring funnel:

| Level | Round Name | Focus Area | Who Gets This |
|---|---|---|---|
| L1 | Recruiter Screen / HR Call | Culture fit, salary expectation, basic eligibility | All users |
| L2 | Technical Phone Screen | 1–2 Coding Qs or MCQs | Most users |
| L3 | Virtual / Onsite Round | Coding + DSA | Users targeting dev roles |
| L4 | Mid Rounds | System Design / Machine Design / Architecture | Senior+ roles |
| L5 | Behavioral + Leadership | Past projects, leadership, culture fit | FAANG / Top Product Companies |
| L6 | Hiring Manager / Director Round | Final technical + team fit | Many companies |
| L7 | Team Match / VP / Offer Discussion | Final discussion | Google, Microsoft, Atlassian |

**Level Unlock Logic:**
- Users start at L1 by default
- L3+ unlocks based on role (dev, data, ML)
- L4+ unlocks based on years of experience declared
- All levels available in "Free Practice" mode regardless

**Question Generation Rules per Level:**
- L1: Behavioral, salary, availability, motivation
- L2: Language-specific coding (Python/Java/JS/etc.), concept MCQs
- L3: LeetCode-style DSA, time/space complexity analysis
- L4: System design prompts (design Twitter, design a payment gateway)
- L5: STAR-format behavioral questions, leadership principles (Amazon LPs)
- L6: Culture + vision alignment questions
- L7: Negotiation, team dynamics, offer handling

---

### MODULE 4 — DYNAMIC QUESTION GENERATOR

**Logic:**
```
Resume Embeddings
    +
Target Role Requirements
    +
Company-Specific Style
    +
User's Previous Performance Data
    +
Current Answer Quality (adaptive)
    ↓
Question Generated
```

**Follow-up Question Engine:**
- After every answer → AI decides: probe deeper or move on?
- "You mentioned microservices — can you walk me through how you handled service discovery?"
- Max 2 follow-ups per main question
- Follow-up difficulty scales if the answer was strong

**Difficulty Scaling:**
- Starts at user's declared level
- Adjusts dynamically mid-session based on answer scores
- Visual indicator: "Difficulty: Medium → Hard" shown to user

---

### MODULE 5 — MULTIMODAL INTERVIEW INTERFACE

**5.1 Input Modes**
- Text input (default)
- Voice input (speech-to-text, real-time transcription)
- Combined (speak + type simultaneously)
- Offline mode: answers saved locally, synced when online

**5.2 AI Interview Avatar**
- Realistic 2D/3D interviewer avatar
- Interviewer personality modes:
  - Calm & Encouraging
  - Professional & Neutral
  - Aggressive / High-Pressure (opt-in only, for stress testing)
  - Friendly Startup Vibe
- Avatar speaks questions aloud (text-to-speech)
- Lip-synced animation with natural pauses
- Eye contact simulation for realistic feel

**5.3 Webcam Feature**
- Optional webcam enable for body language awareness
- AI notes: eye contact, head movement, visible nervousness signals
- Privacy: processed locally, never stored without consent
- Tip overlay: "Maintain eye contact with the camera"

**5.4 Professional Dress Code Check**
- Optional: webcam snapshot at session start
- AI checks: appropriate attire for role level selected
- Gentle, respectful feedback: "Consider a formal top for this role level"

---

### MODULE 6 — REAL-TIME COACHING LAYER

**During the Answer (Live):**
- Vocal pace detector: "Speaking too fast — slow down"
- Filler word counter: "Um", "Like", "You know" flagged
- Confidence signal monitor: voice modulation, pitch variance
- Keyword spotter: did the answer include expected technical terms?
- Structure checker: is the answer following STAR / CAR / SOAR format?

**Post-Answer (Immediate Feedback):**
```
✅ STRONG: Clear problem definition, mentioned metrics
⚠️  WEAK: No mention of outcome or impact
💡 MODEL ANSWER: "In my role at X, I led a team of 4 to redesign the auth flow,
   reducing login failures by 38% in Q3..."
📈 IMPROVEMENT TIP: Always quantify your impact with numbers
```

**Human-in-the-Loop Enhancement:**
- If answer scores below threshold → coaching tip shown
- User can retry the same question
- Loop continues until answer quality peaks
- Delta shown: "Attempt 1: 54 → Attempt 3: 82 (+28 pts)"

---

### MODULE 7 — FINAL SCORECARD

Four mandatory dimensions with individual scores (0–100):

| Dimension | What It Measures |
|---|---|
| Communication | Clarity, structure, grammar, pacing, filler words |
| Technical Depth | Accuracy, depth, use of correct terminology, problem-solving approach |
| Relevance to Role | How well answers align with job requirements and resume claims |
| Confidence Signals | Vocal steadiness, directness, ownership language, eye contact |

**Scorecard Output:**
- Radar chart visualization of 4 dimensions
- Per-question breakdown
- Comparison to previous sessions
- Benchmark: "Top 15% of users who practiced this role"
- Suggested next steps: "Focus on System Design — your weakest area this session"

---

### MODULE 8 — COMPANY-SPECIFIC SIMULATION

Pre-built simulation packs for:
- **Google:** Googleyness, Leadership + Coding (4–6 rounds)
- **Amazon:** 14 Leadership Principles deep-dive
- **Microsoft:** Growth Mindset + System Design
- **Meta:** Execution + Product Sense
- **Startups:** Move fast, generalist, culture-fit heavy
- **Consulting (McKinsey/BCG):** Case study + structured thinking
- **Product Manager:** Product sense, metrics, roadmapping
- **HR Roles:** People management, policy, conflict resolution

**Simulation Authenticity:**
- Interviewer tone matches company culture
- Question style mimics real reported interview questions
- Time pressure replication (real interview timers)

---

### MODULE 9 — PERFORMANCE TRACKING & ANALYTICS

**9.1 Session History**
- Full transcript of every session
- Audio/video recording (opt-in, stored encrypted)
- Timeline of score improvement

**9.2 Weakness Heatmap**
- Visual map across multiple sessions
- Red zones = consistent weak areas
- Green zones = mastered topics
- Drill-down: "You score lowest on System Design questions at L4"

**9.3 Progress Charts**
- Line graph: IRS over time
- Bar chart: dimension scores per session
- Streak tracker (days practiced)
- Topic coverage map

**9.4 Leaderboard & Social**
- Global leaderboard by role category
- Friend leaderboard (connect via LinkedIn/email)
- Weekly rank reset with badges preserved
- Badges: "DSA Warrior", "Communication King", "FAANG Ready", "7-Day Streak"
- Privacy toggle: hide from leaderboard if preferred

---

### MODULE 10 — REPORTS & SHARING

**10.1 PDF Interview Report**
- Auto-generated after every session
- Includes: scorecard, per-question feedback, model answers, improvement tips
- Branded, professional design
- Downloadable and shareable

**10.2 LinkedIn Post Generator**
- One-click post generation after session
- "Just completed a FAANG-level mock interview on InterviewForge! Scored 84/100 in Technical Depth. Grinding toward my Google offer. 🚀 #InterviewPrep #CareerGrowth"
- Short video highlight clip (30-sec best moments)
- Achievement cards for sharing

**10.3 LeetCode-Style Profile Progress**
- Public profile page showing:
  - Total sessions completed
  - Roles practiced
  - Best scores per role/level
  - Badges earned
  - Improvement trajectory graph
- Shareable URL: interviewforge.ai/u/yourname

---

### MODULE 11 — LEARNING & RECOMMENDATION ENGINE

**Post-Session Recommendations:**
- "Your System Design answers lacked depth on database sharding. Here are 3 resources:"
  - YouTube video (curated)
  - Article summary
  - Practice prompt
- "Users who improved 20+ points in 2 weeks also practiced: Behavioral L5 + Daily DSA"
- Respectful tone always: "Here's an opportunity to grow" — never "You failed"

**Learning Paths:**
- Role-specific 30/60/90 day prep plans
- Daily practice reminders (opt-in)
- Spaced repetition for weak areas

---

### MODULE 12 — GAMIFICATION

- XP points for every session, question answered, retry attempted
- Level system: Intern → Junior → Senior → Staff → Principal → Distinguished
- Daily challenges: "Answer 3 behavioral questions today"
- Achievements: "First FAANG Simulation", "10 Sessions Completed", "Perfect Communication Score"
- Seasonal events: "Hiring Season Sprint" (Oct–Dec, March–May)

---

### MODULE 13 — PRIVACY & ETHICS

- **No judgment policy:** Platform language is always growth-oriented
- **Data minimization:** Only store what's needed, delete on request
- **Recording consent:** Explicit opt-in, user owns their recordings
- **Webcam:** Processed locally, never sent to server without consent
- **GDPR + CCPA** compliant from day one
- **No discrimination signals:** AI trained to avoid bias in feedback
- **Respectful failure messages:** "Great attempt! Here's how to strengthen this."

---

### MODULE 14 — TECHNICAL ARCHITECTURE (Recommended Stack)

```
FRONTEND
├── Next.js 14 (App Router)
├── Tailwind CSS + shadcn/ui
├── Framer Motion (animations)
├── WebRTC (webcam)
├── Web Speech API (voice input)
└── PWA support (offline mode)

BACKEND
├── Node.js + Express / FastAPI (Python)
├── PostgreSQL (user data, sessions)
├── Redis (real-time coaching cache)
├── S3-compatible storage (recordings, PDFs)
└── WebSocket (real-time feedback stream)

AI LAYER
├── Claude (Anthropic) — question generation, feedback, coaching
├── Whisper (OpenAI) — speech-to-text transcription
├── ElevenLabs / PlayHT — avatar TTS voice
├── RAG pipeline — resume embeddings + question retrieval
└── Vector DB (Pinecone / Weaviate) — semantic resume search

INFRASTRUCTURE
├── Vercel (frontend hosting)
├── Railway / Render (backend)
├── Cloudflare (CDN + privacy proxy)
└── Docker + GitHub Actions (CI/CD)
```

---

### MODULE 15 — MULTILINGUAL SUPPORT

- Interface: English, Hindi, Spanish, French, Arabic, Mandarin, Portuguese, German, Japanese (Phase 1: English + Hindi)
- Interview questions: Translated and culturally adapted
- Feedback: Delivered in user's preferred language
- Voice recognition: Language-specific models
- Avatar: Accent and dialect awareness

---

## NON-FUNCTIONAL REQUIREMENTS

| Requirement | Target |
|---|---|
| RAM Usage | < 200MB browser footprint |
| Response Time | < 2s for question generation |
| Offline Support | Core interview flow works offline |
| Accessibility | WCAG 2.1 AA compliant |
| Mobile Support | Fully responsive, touch-optimized |
| Theme | Light / Dark toggle (respects system preference) |
| Security | End-to-end encrypted recordings |
| Uptime | 99.9% SLA |

---

## PHASE ROADMAP

### Phase 1 — MVP (Months 1–3)
- Auth + Profile + Resume Upload
- Dynamic question generation (text only)
- L1–L3 interview structure
- Immediate per-answer feedback
- Final scorecard (4 dimensions)
- Basic dashboard + session history

### Phase 2 — Voice & Avatar (Months 4–6)
- Voice input + transcription
- AI interviewer avatar
- Vocal pace detector
- Real-time coaching overlay
- PDF report generation

### Phase 3 — Social & Gamification (Months 7–9)
- Leaderboards + friend connections
- Badges + XP system
- LinkedIn post generator
- Public profile page
- Weakness heatmap

### Phase 4 — Advanced Simulation (Months 10–12)
- Company-specific packs (Google, Amazon, Meta, etc.)
- Webcam + dress code check
- L4–L7 levels (System Design, Behavioral, VP)
- Video recording + highlights
- Multilingual expansion

### Phase 5 — Scale & Intelligence (Year 2)
- Offline mode (PWA)
- Gamified learning paths
- Resume optimizer v2
- Interview scheduling with real HR partnerships
- API for universities and bootcamps

---

## MENTOR FRAMEWORK (Anthropic · Google · Meta · FAANG)

Taking inspiration from:
- **Anthropic / Claude:** Honest, helpful, harmless AI feedback — the backbone of our coaching engine
- **Google:** Structured hiring (the 7-level system is Google-inspired), data-driven decision making
- **Meta:** Move fast, ship working product, measure everything
- **Amazon:** Customer obsession = user obsession; Leadership Principles as interview benchmark
- **Dario Amodei (Anthropic CEO):** Safety + helpfulness are not at odds — our platform proves that
- **Research:** RAG, RLHF, Constitutional AI principles applied to interview coaching

---

## SUCCESS METRICS

| Metric | 6-Month Target |
|---|---|
| Registered Users | 50,000 |
| Sessions Completed | 500,000 |
| Avg IRS Improvement | +25 points over 5 sessions |
| D7 Retention | > 40% |
| NPS | > 60 |
| LinkedIn Posts Generated | 100,000 |
| University Partnerships | 10 |

---

## CORE PRINCIPLES (Never Compromise)

1. **Respect first** — Every message lifts the user, never tears them down
2. **Resume-grounded** — Every question must trace back to the user's actual experience
3. **Feedback always** — After every answer, no exceptions
4. **Privacy sacred** — User data is theirs, not ours
5. **Loop until better** — The enhancement loop runs until the user genuinely improves
6. **Real conditions** — Simulate reality, not a sanitized version of it
7. **Growth, not judgment** — The platform exists to help people win, nothing else

---

*"Crack the interview. Own the room. Change your life."*

---
**Document Owner:** Product Team | **Last Updated:** May 2026
**Inspired by:** Anthropic, Google, Meta, Amazon, Microsoft hiring frameworks
