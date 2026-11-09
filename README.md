# Desk Hub Companion 🖥️⏱️

> A production-ready digital companion, configuration backend, and HR/Researcher oversight platform for the physical **Arduino Desk Hub**. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Web Audio API, Supabase PostgreSQL architecture with Row Level Security (RLS), and automated Excel (`xlsx`) research telemetry export.

---

## 🌟 Dual-Portal Information Architecture (IA)

The Desk Hub Companion is structured into two dedicated portals connected by role-based access control (RBAC):

```
                                      ┌──────────────────────────────────────────────┐
                                      │              Desk Hub Companion              │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                              ┌──────────────────────────────┴──────────────────────────────┐
                              ▼                                                             ▼
           ┌─────────────────────────────────────┐                       ┌─────────────────────────────────────┐
           │        WFH Employee Portal          │                       │   HR & Wellness Manager Portal      │
           │          (Regular Users)            │                       │    (/admin - Restricted Role)       │
           └──────────────────┬──────────────────┘                       └──────────────────┬──────────────────┘
                              │                                                             │
        ┌─────────────────────┼─────────────────────┐                 ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼                 ▼                     ▼                     ▼
 1. Dashboard         2. Microbreak Hub     3. Analytics       1. Overview           2. Team Analytics     3. Fleet Registry
 (/dashboard)         (/microbreaks)        (/analytics)       (/admin)              (/admin/analytics)    (/admin/fleet)
 • Live hardware sync • 2-min prescriptions • Compliance score • Fleet health score  • Team compliance     • ESP32 & Uno nodes
 • Sedentary ring     • Video/visual demos  • Workday heatmap  • Risk index (% split)• Latency tracking    • Battery & USB power
 • Quick action bar   • Sit-Stand-Walk timer• Health milestones• Microbreak adoption • Prolonged sitting   • Remote ping / reset
        │                     │                                       │                     │
        ▼                     ▼                                       ▼                     ▼
 4. Challenges        5. Settings & Hardware                   4. Challenge Manager  5. Data Export Center
 (/community)         (/settings)                              (/admin/challenges)   (/admin/export)
 • Team leaderboards  • 20m–45m calibration                    • Movement sprints    • Date-range query
 • Social chat feed   • Fanfare vs Chime                       • Health bulletins    • GDPR anonymization
 • Role-model posts   • IR remote mapping                      • Feedback box        • Excel (.xlsx) / CSV
```

---

## 1. WFH Employee Portal Features

### 1. Dashboard (`/dashboard`)
- **Live Hardware Status Sync:** Real-time reflection of the physical Arduino Desk Hub state (FOCUS Green Constant Pulse vs. ALERT Red Strobe Mode, power state, and interval countdown).
- **The Sedentary Time Loop & Progress Ring:** Dual visualizer tracking time in **Green Zone** (Active / Standing), **Yellow Zone** (Sitting <60 min), and **Red Zone** (Prolonged sitting >60 min), accompanied by a circular SVG progress ring toward the 180-minute daily movement target.
- **Dedicated Quick Actions Bar:**
  - **"Snooze Hub" (+5m):** Postpones sitting alert by 5 minutes and returns to green focus mode.
  - **"Start Guided Microbreak":** 1-click launch for 2-minute movement protocol.
  - **"Mute Audio":** Toggles piezo buzzer without powering down the device.
  - **"Reset Timer":** Resets the countdown interval (`IR_CMD_RESET`).

### 2. Microbreak Hub & Routine Library (`/microbreaks`)
- **Interactive Sit-Stand-Walk Engine:** Automates the **Cornell 20-8-2** protocol (20m Sit, 8m Stand, 2m Move) and standard **30-2** cadence with live phase timers.
- **2-Minute Movement Prescriptions:**
  - *Cornell 20-8-2 Ergonomic Routine:* Scapular retraction, spinal elongation, hallway lap.
  - *Soleus & Quadriceps Metabolic Activation:* Chair squats and rhythmic calf presses triggering glucose uptake.
  - *Upper Trapezius & Latissimus Release:* Decompression for mouse shoulder and upper cross syndrome.
  - *Pelvic Unwinding & Hip Flexor Reset:* Psoas lengthening and lumbar disc decompression.
  - *Attention Restoration (ART) Soft Fascination:* 20-20-20 optometric relief and 4-7-8 vagal sighs.
- **Guided Routine Runner Modal:** Step countdown circles, animated instructions, and confetti on completion.

### 3. Analytics & Habit Tracking (`/analytics`)
- **Daily/Weekly Break Compliance Score:** Percentage of alerts cleared via movement vs. ignored.
- **Workday Sedentary Heatmap:** Hourly matrix (9 AM – 5 PM) visualizing sitting vs. movement distribution.
- **Health Milestones:**
  - *LPL Enzyme Activation Time:* Tracked minutes of active muscular contraction.
  - *Glucose Stability Marker:* Estimated % reduction in postprandial glucose excursions.
  - *Vascular Shear Restoration:* Improvement in femoral artery blood flow velocity.

### 4. Gamification & Team Challenges (`/community`)
- **Departmental Challenges:** Sprints for step goals, break counts, and zero red-zone streaks.
- **Social Support Feed:** Peer chat board with verified **Leadership Role Model** badges.

### 5. Device & Hardware Settings (`/settings`)
- **Sitting Interval Calibration:** Slider and presets adjusting alert timers from 20 to 45 minutes.
- **Audio Tone Customization:** Toggle between the iconic **19-note Star Wars Fanfare** and a soothing **Gentle Calm Chime**.
- **IR Remote Pairing:** Signal lookup table for `IR_CMD_RESET`, `IR_CMD_POWER`, `IR_CMD_MUTE`, and `IR_CMD_SNOOZE`.
- **SSD1306 OLED Ticker Editor:** Customize the scrolling message displayed on the physical 128x64 screen.

---

## 2. Admin HR / Wellness Manager Portal Features

Accessible exclusively to users with the `admin` role (e.g. Prof. Elena Vance - Ergonomics Lab & HR):

### 1. Organizational Overview (`/admin`)
- **Fleet Health Score:** Percentage of active vs. offline physical Desk Hubs.
- **Workforce Sedentary Risk Index:** Breakdown of employees in "Top Breaker" vs. "Sedentary Prolonger" quartiles.
- **Total Microbreak Adoption:** Aggregated company-wide break count and adherence.
- **Live Organization Telemetry Stream:** Real-time log of events from all workstations.

### 2. Departmental & Team Analytics (`/admin/analytics`)
- **Cross-Departmental Comparison:** Metrics across Engineering, Product, Data, People Ops, and Customer Support.
- **Prolonged Sitting Hours:** Average sitting duration per employee per team.
- **Alert Response Latency Tracking:** Mean time in seconds required to acknowledge and clear Red alerts.

### 3. Hardware Fleet Management (`/admin/fleet`)
- **Device Registry:** MAC addresses, IP addresses, firmware versions, battery levels, and power sources (USB-C vs. Battery).
- **Remote Ping / Reset:** 1-click diagnostic soft reboot and heartbeat refresh for deployed hubs.

### 4. Challenge & Bulletin Manager (`/admin/challenges`)
- **Movement Challenge Creator:** Launch department-scoped or company-wide wellness challenges.
- **Clinical Bulletins & Infographics:** Publish evidence-based occupational research digests.
- **Anonymized Employee Feedback Box:** Review staff ergonomic suggestions and sentiment.

### 5. Data Export & Compliance Center (`/admin/export`)
- **Custom Filters:** Filter by department, start date, and end date.
- **GDPR Anonymization Toggle:** Hashes employee IDs to protect personal privacy.
- **Excel (`.xlsx`) & CSV Export:** Generates multi-sheet spreadsheets using the `xlsx` library with the exact required schema:
  - `Employee_ID`
  - `Department`
  - `Date`
  - `Total_Sitting_Hours`
  - `Unbroken_Bouts_Count (>60m)`
  - `Alerts_Triggered`
  - `Alerts_Acknowledged`
  - `Compliance_Rate_%`
  - `Avg_Response_Time_Sec`

---

## 💻 Tech Stack

- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons + Calm Technology Design System
- **Audio:** Web Audio API (Synthesized tone generator with precise note frequencies)
- **Data Export:** `xlsx` (SheetJS)
- **Database & Storage:** Supabase PostgreSQL with Row Level Security (RLS) + In-Browser Persistent Store fallback

---

## 🚀 Running the Project

The development server is running on localhost:

```bash
# Start development server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Production build
npm run build
```

Access the application in your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**
