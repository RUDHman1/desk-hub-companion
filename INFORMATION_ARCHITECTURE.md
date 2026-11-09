# Desk Hub Companion — Information Architecture Specification

This document details the updated UX/UI Information Architecture (IA) for the **Desk Hub Companion** ecosystem, aligning the dual-portal frontend, context state engines, and physical Arduino microcontroller firmware.

---

## High-Resolution Interactive Architecture Diagram
The vector SVG diagram is available at:
- **[desk_hub_information_architecture.svg](file:///C:/Users/aniru/.gemini/antigravity/brain/3d52074c-c683-4d47-9128-0cace62e23b4/desk_hub_information_architecture.svg)**

```mermaid
flowchart TD
    subgraph L0["Level 0: Global Navigation &amp; Routing Layer"]
        DISPATCHER["Dual-Portal Dispatcher &amp; RBAC Guard"]
        USER_LINK["WFH Employee Portal (Regular User)"]
        ADMIN_LINK["Admin HR &amp; Wellness Manager Portal (Admin)"]
        DISPATCHER --> USER_LINK
        DISPATCHER --> ADMIN_LINK
    end

    subgraph L1["Portal 1: WFH Employee Portal"]
        P1_DASH["1. Dashboard (/dashboard)
        • Live Hardware Widget (Focus vs Alert)
        • Sedentary Time Loop (Circular Ring)
        • Quick Actions (Snooze 5m, Reset, Mute)
        • SSD1306 OLED Marquee Preview"]

        P1_BREAKS["2. Microbreak Hub (/microbreaks)
        • 20-8-2 Cornell &amp; 30-2 Engine
        • Musculoskeletal Stretch Guides
        • Physiological Rationale (LPL &amp; Glucose)"]

        P1_ANALYTICS["3. Analytics (/analytics)
        • Breaker vs Prolonger Score
        • 9 AM - 5 PM Workday Heatmap
        • Standing Accumulation Goals (2-4 hrs)"]

        P1_COMMUNITY["4. Community (/community)
        • Team Step &amp; Break Challenges
        • Department Streak Leaderboard
        • Social Feed &amp; Role Model Badges"]

        P1_SETTINGS["5. Settings (/settings)
        • Discrete Interval Calibration (20, 25, 30, 45m)
        • 8 Synthesized Piezo Melodies Library
        • Connection Selector (Simulated vs Hardware)
        • IR Hex Mapping (TSOP4838)"]

        USER_LINK --> P1_DASH
        USER_LINK --> P1_BREAKS
        USER_LINK --> P1_ANALYTICS
        USER_LINK --> P1_COMMUNITY
        USER_LINK --> P1_SETTINGS
    end

    subgraph L2["Portal 2: Admin HR &amp; Wellness Manager Portal"]
        P2_OVERVIEW["1. Organizational Overview (/admin)
        • Fleet Health Score (Active vs Offline)
        • Sedentary Risk Index (% Prolonger)
        • Microbreak Adoption Rate (74%)
        • Real-Time Telemetry Stream Table"]

        P2_ANALYTICS["2. Team Analytics (/admin/analytics)
        • Department Comparative Compliance
        • Average Prolonged Sitting Duration
        • Alert Response Latency Distribution"]

        P2_FLEET["3. Hardware Fleet (/admin/fleet)
        • Device Registry (Hub IDs, MAC, IP)
        • Firmware Version (v2.4.1) &amp; Power Status
        • Ping Hub &amp; Remote Soft Reboot"]

        P2_CHALLENGES["4. Challenge Manager (/admin/challenges)
        • Launch Corporate Break Challenges
        • Broadcast Ergonomic Bulletins
        • Anonymized Feedback Review Box"]

        P2_EXPORT["5. Data Export Center (/admin/export)
        • xlsx Multi-Sheet Research Reports
        • GDPR PII Masking (ANON-XXXX)
        • Cohort Filters &amp; 9-Col Live Preview"]

        ADMIN_LINK --> P2_OVERVIEW
        ADMIN_LINK --> P2_ANALYTICS
        ADMIN_LINK --> P2_FLEET
        ADMIN_LINK --> P2_CHALLENGES
        ADMIN_LINK --> P2_EXPORT
    end

    subgraph L3["Middle Tier: State Management &amp; Serial Engine"]
        AUTH_CTX["AuthContext: 6 Mock Personas + RBAC"]
        DEVICE_CTX["DeviceContext: Timer Engine &amp; WebSerial RX/TX"]
        SOUND_CTX["Web Audio API: 8 Presets (Sine, Square, Saw, Tri)"]
        DB_STORE["DatabaseStore: Telemetry, Logs, Metrics"]

        P1_SETTINGS -->|"Flash Changes"| DEVICE_CTX
        P1_DASH -->|"Quick Actions"| DEVICE_CTX
        DEVICE_CTX --> DB_STORE
    end

    subgraph L4["Physical Tier: Arduino Desk Hub Hardware"]
        direction TB
        ARDUINO["ATmega328P / Arduino Uno R4 (9600 Baud)"]
        OLED["SH1106 OLED Display (I2C 0x3C)"]
        LEDS["Green LED (Pin 9) &amp; Red LED (Pin 10)"]
        BUZZER["Piezo Buzzer (Pin 8) - Star Wars Fanfare"]
        INPUTS["Pushbutton (Pin 2) &amp; IR Receiver (Pin 11)"]

        ARDUINO --- OLED
        ARDUINO --- LEDS
        ARDUINO --- BUZZER
        ARDUINO --- INPUTS
    end

    DEVICE_CTX <===="WebSerial 9600 Baud (SET_INTERVAL, CMD_RESET / ALERT, RESET)"====> ARDUINO
```

---

## 4-Tier Architectural Breakdown

### Tier 1: Dual-Portal Presentation Layer
- **WFH Employee Portal (5 Views):** Focused on individual calm-technology interaction, guided microbreak execution, personal habit tracking, team challenges, and firmware calibration.
- **Admin HR & Wellness Manager Portal (5 Views):** Dedicated to fleet oversight, multi-department risk analytics, corporate challenge creation, and GDPR-compliant research data extraction (`.xlsx` / `.csv`).

### Tier 2: State Management & Synthesis Layer
- **`DeviceContext`:** Manages the active state machine (`FOCUS` $\leftrightarrow$ `ALERT` $\leftrightarrow$ `OFF`), sedentary zone accumulation (Green, Yellow, Red), alert latency timers, and WebSerial transport.
- **`AuthContext`:** Enforces RBAC permissions, dynamically providing seamless user-switching between employee personas and administrative roles.
- **`lib/sound.ts`:** 8-preset Web Audio API synthesizer providing real-time acoustic previews with custom waveforms (`square`, `sine`, `sawtooth`, `triangle`).

### Tier 3: Bidirectional Communication Protocol
| Direction | Command Format | Behavioral Action |
|---|---|---|
| **Web $\to$ Arduino** | `SET_INTERVAL:<mins>\n` | Sets countdown duration, recalibrates timer, updates OLED target text |
| **Web $\to$ Arduino** | `SET_SOUND:<0\|1>\n` | Enables or mutes the physical buzzer |
| **Web $\to$ Arduino** | `CMD_RESET\n` | Restarts sitting loop from web quick action |
| **Web $\to$ Arduino** | `CMD_SNOOZE\n` | Adds +5 minutes before alert fires |
| **Arduino $\to$ Web** | `ALERT: Time to stand up!\n` | Triggers chromatic Red Alert strobe on dashboard |
| **Arduino $\to$ Web** | `Button Reset!\n` | Records alert latency, switches back to green Focus mode |

### Tier 4: Microcontroller Firmware (`ATmega328P` / `ESP32`)
- **Memory Optimized:** Relies on `PROGMEM` for melody arrays and fixed-size char buffers (`char[24]`) to keep RAM usage within the Arduino Uno's 2KB boundary.
- **Peripheral Bus:** Coordinates I2C (SH1106 OLED), hardware timers (PWM buzzer), and hardware interrupts (pin 2 pushbutton, pin 11 TSOP4838 IR).
