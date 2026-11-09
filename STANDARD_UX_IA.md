# Standard UX Information Architecture Specification

Following formal UX industry tree notation, the complete Information Architecture for the **Desk Hub Companion** ecosystem has been generated using standard hierarchy conventions:

- **Vector SVG File (High Resolution, Editable):**
  - **[`standard_ux_information_architecture.svg`](file:///C:/Users/aniru/.gemini/antigravity/brain/3d52074c-c683-4d47-9128-0cace62e23b4/standard_ux_information_architecture.svg)**

---

## 1. Visual Legend & Shape Grammar

```
┌──────────────┐     SCREEN (Rectangle with rounded corners)
│  SCREEN 0.0  │     Full navigable page or route in Next.js
└──────────────┘

 ( POP UP 0.1 )      POP UP / MODAL (Pill / Ellipse)
                     Dialogs, guided runners, or modal forms

   /\ ACTION /\      ACTION (Diamond)
  /    0.2     \     User click, hardware trigger, or state mutation
  \            /
   \/        \/

   ┌──────────/      TAB (Trapezoid / Slanted corner)
  /   TAB 0.3/       Segmented controller or protocol tab switcher
 └──────────/
```

---

## 2. Complete Numbered Taxonomy (0.0 to 4.4)

### Level 0: Onboarding & Authentication
* **0.0 ONBOARDING (Screen):** First-run splash & intro
  * **0.1 EMPLOYEE SSO (Pop Up):** WFH professional login
  * **0.2 ADMIN / HR SSO (Pop Up):** Wellness director / researcher login
  * **0.3 DEMO PERSONAS (Pop Up):** 6-persona mock switcher
* **0.4 RBAC CHECK (Action):** Evaluates role (`user` vs `admin`)
* **0.5 SELECT LINK MODE (Pop Up):** Hardware connection selector
  * **0.5.1 PAIR COM PORT (Action):** Connects WebSerial at 9600 baud
  * **0.5.2 RUN SIMULATED (Action):** Software-only in-browser companion

---

### Level 1: Central Dispatcher
* **1.0 PORTAL DISPATCHER (Screen):** Shared navbar with dual-portal tabs and live device badge

---

### Portal 1: WFH Employee Portal (Regular Users)
* **2.0 WFH EMPLOYEE PORTAL (Screen Gateway)**
  * **2.1 DASHBOARD (`/dashboard` - Screen)**
    * **2.1.1 HARDWARE (Screen):** Live chassis simulator
    * **2.1.2 TIME LOOP (Screen):** Dual circular SVG ring
    * **2.1.3 ACTIONS (Pop Up / Menu):** Quick action drawer
      * **2.1.3.1 SNOOZE 5M (Action):** Extends timer by 5 minutes (`IR_CMD_SNOOZE`)
      * **2.1.3.2 RESET (Action):** Restarts sitting cycle (`IR_CMD_RESET`)
      * **2.1.3.3 MUTE (Action):** Toggles buzzer (`IR_CMD_MUTE`)
      * **2.1.3.4 GUIDE (Action):** Deep link to microbreak routines
  * **2.2 MICROBREAKS (`/microbreaks` - Screen)**
    * **2.2.1 20-8-2 (Tab):** Cornell protocol
    * **2.2.2 30-2 (Tab):** Standard sprint protocol
    * **2.2.3 GUIDED RUNNER (Pop Up):** Interactive timer modal
      * **2.2.3.1 LOG BOUT (Action):** Records microbreak log into DB
  * **2.3 ANALYTICS (`/analytics` - Screen)**
    * **2.3.1 SCORE (Screen):** Breaker vs Prolonger classification
    * **2.3.2 HEATMAP (Screen):** 9 AM – 5 PM sedentary bout density
    * **2.3.3 HAZARDS (Screen):** Kcal increase & cardiovascular risk estimators
  * **2.4 COMMUNITY (`/community` - Screen)**
    * **2.4.1 CHALLENGES (Screen):** Monthly company-wide goals
      * **2.4.1.1 JOIN (Action):** Enrolls user into challenge
    * **2.4.2 LEADERBOARD (Screen):** Department standings
  * **2.5 SETTINGS (`/settings` - Screen)**
    * **2.5.1 INTERVAL SLIDER (Screen):** Discrete 20, 25, 30, 45m calibration
      * **2.5.1.1 FLASH HUB (Action):** Transmits `SET_INTERVAL:<mins>` via WebSerial
    * **2.5.2 8-TONE LIB (Screen):** Audio selector
      * **2.5.2.1 PREVIEW (Action):** Synthesizes live WebAudio tone
    * **2.5.3 LINK / PAIRING (Screen):** WebSerial scanner & IR map

---

### Portal 2: Admin HR & Wellness Manager Portal (Restricted)
* **3.0 ADMIN HR PORTAL (Screen Gateway)**
  * **3.1 ORG OVERVIEW (`/admin` - Screen)**
    * **3.1.1 KPI CARDS (Screen):** Fleet health index & risk score
    * **3.1.2 TELEMETRY (Screen):** Live event stream table
  * **3.2 TEAM ANALYTICS (`/admin/analytics` - Screen)**
    * **3.2.1 DEPTS GRID (Screen):** Departmental compliance comparison
    * **3.2.2 LATENCY (Screen):** Response time distribution histogram
  * **3.3 FLEET MANAGER (`/admin/fleet` - Screen)**
    * **3.3.1 DEVICE LIST (Screen):** MAC/IP registry table
      * **3.3.1.1 PING HUB (Action):** Sends serial heartbeat & receives diagnostic ACK
    * **3.3.2 DIAGNOSTICS (Screen):** Battery & power status
  * **3.4 PROGRAM MGR (`/admin/challenges` - Screen)**
    * **3.4.1 BULLETINS (Screen):** Ergonomic broadcast board
    * **3.4.2 FEEDBACK (Screen):** Anonymized employee suggestion box
    * **3.4.3 CREATE MODAL (Pop Up):** Challenge builder
      * **3.4.3.1 PUBLISH (Action):** Launches organizational movement goal
  * **3.5 DATA EXPORT (`/admin/export` - Screen)**
    * **3.5.1 GDPR ANON (Action):** Toggles `ANON-XXXX` masking
    * **3.5.2 PREVIEW (Screen):** 9-column live verification table
    * **3.5.3 DOWNLOAD XLSX (Action):** Multi-sheet research workbook generator

---

### Level 4: Physical Arduino Hardware Bus
* **4.0 ARDUINO DESK HUB (Hardware Unit)**
  * **4.1 SH1106 OLED (Screen):** 128x64 display
    * **4.1.1 SET_TICKER (Action):** Displays scrolling status & target interval
  * **4.2 GREEN / RED LEDS (Hardware Component)**
    * **4.2.1 STROBE ALERT (Action):** Non-blocking red flash on timeout
  * **4.3 PIEZO BUZZER (Hardware Component)**
    * **4.3.1 SET_SOUND (Action):** Renders Star Wars fanfare
  * **4.4 BUTTON & IR (Hardware Component)**
    * **4.4.1 PRESS RESET (Action):** Hardware interrupt clearing alert and streaming latency back to 2.1
