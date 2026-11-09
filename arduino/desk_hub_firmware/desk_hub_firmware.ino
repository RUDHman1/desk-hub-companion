// --- SMART DESK HUB - FINAL STABLE VERSION WITH WEBSERIAL COMPANION SYNC ---
// Compatible with Desk Hub Companion Web App (WebSerial API at 9600 Baud)
#include <IRremote.h>
#include <Wire.h>
#include <U8g2lib.h>

// Using 1-page buffer mode (_1_) to minimize RAM usage on Arduino Uno / Nano / ESP32
U8G2_SH1106_128X64_NONAME_1_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

const int redLedPin = 10;     
const int greenLedPin = 9;    
const int buttonPin = 2;      
const int speakerPin = 8;     
const int IR_RECEIVE_PIN = 11; 

unsigned long previousMillis = 0;

// Configurable Work Interval (0 = 10s test mode, 20-45 = standard mins)
int workIntervalMinutes = 20; 
unsigned long interval = 1200000UL; 

bool sittingLimitReached = false;

// Fast scrolling text variables
int scrollPos = 0;
unsigned long lastScrollTime = 0;
const int scrollSpeedDelay = 25; 

// System states
bool devicePoweredOn = true; 
bool soundEnabled = true;    
char feedbackMessage[24] = "Status: Normal";

// Non-blocking melody variables
unsigned long alertPreviousMillis = 0;
int noteIndex = 0;
bool isPlayingNote = false;
unsigned long noteStartMillis = 0;

// Full 19-Note Star Wars Main Theme Fanfare (Frequencies in Hz)
int melody[] = { 
  294, 294, 294, 392, 587, 
  523, 494, 440, 784, 587, 
  523, 494, 440, 784, 587, 
  523, 494, 523, 440, 0 
};

int noteDurations[] = { 
  150, 150, 150, 500, 500, 
  150, 150, 150, 500, 250, 
  150, 150, 150, 500, 250, 
  150, 150, 150, 600, 500 
};

const int melodyLength = 20;

// Remote Command Hex Codes
#define IR_CMD_POWER  0x12  // Power
#define IR_CMD_MUTE   0x1E  // Mute
#define IR_CMD_RESET  0x1   // Reset / Play
#define IR_CMD_FWD    0x3   // Forward (+5 mins)
#define IR_CMD_REV    0x2   // Backward (-5 mins / 10s test)

void updateIntervalMillis() {
  if (workIntervalMinutes == 0) {
    interval = 10000UL; // 10 seconds testing mode
  } else {
    interval = (unsigned long)workIntervalMinutes * 60000UL; 
  }
}

void updateOLED() {
  u8g2.firstPage();
  do {
    u8g2.setFont(u8g2_font_ncenR08_tf);

    if (!devicePoweredOn) {
      u8g2.setCursor(10, 30);
      u8g2.print(F("SYSTEM: POWER OFF"));
    } 
    else if (!sittingLimitReached) {
      u8g2.setCursor(10, 12);
      u8g2.print(F("STATUS: FOCUS"));

      int xPos = 128 - scrollPos;
      u8g2.setCursor(xPos, 28);
      u8g2.print(F("Zone is calm & steady... Keep up workflow!"));

      u8g2.setCursor(10, 43);
      u8g2.print(F("Target: "));
      if (workIntervalMinutes == 0) {
        u8g2.print(F("10 Secs (TEST)"));
      } else {
        u8g2.print(workIntervalMinutes);
        u8g2.print(F(" mins"));
      }

      u8g2.setCursor(10, 57);
      u8g2.print(feedbackMessage);
    } 
    else {
      u8g2.setCursor(10, 20);
      u8g2.print(F("TIME TO STAND UP"));
      u8g2.setCursor(10, 40);
      u8g2.print(F("Stretch & reset hub"));
      u8g2.setCursor(10, 60);
      u8g2.print(F("Press button/ remote"));
    }
  } while (u8g2.nextPage());
}

// -------------------------------------------------------------
// Serial Command Handler for Desk Hub Companion Web App Sync
// -------------------------------------------------------------
void handleSerialCommand(String cmd) {
  unsigned long currentMillis = millis();

  // 1. SET_INTERVAL:<minutes> (e.g. SET_INTERVAL:25, SET_INTERVAL:30)
  if (cmd.startsWith("SET_INTERVAL:")) {
    int newInterval = cmd.substring(13).toInt();
    if (newInterval >= 0 && newInterval <= 120) {
      workIntervalMinutes = newInterval;
      updateIntervalMillis();
      previousMillis = currentMillis; 
      sittingLimitReached = false;
      digitalWrite(redLedPin, LOW);
      digitalWrite(greenLedPin, devicePoweredOn ? HIGH : LOW);
      noTone(speakerPin);
      IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);

      if (workIntervalMinutes == 0) {
        snprintf(feedbackMessage, sizeof(feedbackMessage), "Synced: 10s TEST");
        Serial.println(F("-> OK: INTERVAL 10s TEST"));
      } else {
        snprintf(feedbackMessage, sizeof(feedbackMessage), "Synced: %d Mins", workIntervalMinutes);
        Serial.print(F("-> OK: INTERVAL "));
        Serial.print(workIntervalMinutes);
        Serial.println(F(" mins"));
      }
      updateOLED();
    }
  }
  // 2. SET_SOUND:<0 or 1>
  else if (cmd.startsWith("SET_SOUND:")) {
    int val = cmd.substring(10).toInt();
    soundEnabled = (val == 1);
    if (!soundEnabled) {
      noTone(speakerPin);
      IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
      snprintf(feedbackMessage, sizeof(feedbackMessage), "Audio: MUTED");
    } else {
      snprintf(feedbackMessage, sizeof(feedbackMessage), "Audio: UNMUTED");
    }
    Serial.print(F("-> SOUND: "));
    Serial.println(soundEnabled ? F("UNMUTED") : F("MUTED"));
    updateOLED();
  }
  // 3. Reset command from Web App
  else if (cmd == "CMD_RESET" || cmd == "IR_CMD_RESET") {
    sittingLimitReached = false;
    previousMillis = currentMillis; 
    digitalWrite(redLedPin, LOW);
    noTone(speakerPin);
    IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
    if (devicePoweredOn) digitalWrite(greenLedPin, HIGH);
    snprintf(feedbackMessage, sizeof(feedbackMessage), "Web App Reset!");
    Serial.println(F("-> RESET: Timer restarted via Web App"));
    updateOLED();
  }
  // 4. Snooze command (+5 mins) from Web App
  else if (cmd == "CMD_SNOOZE" || cmd == "IR_CMD_SNOOZE") {
    sittingLimitReached = false;
    // Set timer so 5 minutes (300,000 ms) remain before next alert
    previousMillis = currentMillis - interval + 300000UL;
    digitalWrite(redLedPin, LOW);
    noTone(speakerPin);
    IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
    if (devicePoweredOn) digitalWrite(greenLedPin, HIGH);
    snprintf(feedbackMessage, sizeof(feedbackMessage), "Snoozed +5m");
    Serial.println(F("-> OK: SNOOZE +5m"));
    updateOLED();
  }
  // 5. Power toggle from Web App
  else if (cmd == "CMD_POWER" || cmd == "IR_CMD_POWER") {
    devicePoweredOn = !devicePoweredOn;
    if (!devicePoweredOn) {
      digitalWrite(greenLedPin, LOW);
      digitalWrite(redLedPin, LOW);
      noTone(speakerPin);
      IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
      snprintf(feedbackMessage, sizeof(feedbackMessage), "Power: OFF");
      Serial.println(F("-> SYSTEM: Powered OFF"));
    } else {
      digitalWrite(greenLedPin, HIGH);
      previousMillis = currentMillis; 
      sittingLimitReached = false;
      snprintf(feedbackMessage, sizeof(feedbackMessage), "Power: ON & Reset");
      Serial.println(F("-> SYSTEM: Powered ON"));
    }
    updateOLED();
  }
  // 6. Audio mute toggle from Web App
  else if (cmd == "CMD_MUTE" || cmd == "IR_CMD_MUTE") {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      snprintf(feedbackMessage, sizeof(feedbackMessage), "Audio: UNMUTED");
    } else {
      snprintf(feedbackMessage, sizeof(feedbackMessage), "Audio: MUTED");
      noTone(speakerPin);
      IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
    }
    Serial.print(F("-> SOUND: "));
    Serial.println(soundEnabled ? F("UNMUTED") : F("MUTED"));
    updateOLED();
  }
  // 7. Ping status check
  else if (cmd == "PING") {
    Serial.print(F("PONG: DeskHub,Interval="));
    Serial.print(workIntervalMinutes);
    Serial.print(F(",Sound="));
    Serial.print(soundEnabled ? 1 : 0);
    Serial.print(F(",Power="));
    Serial.println(devicePoweredOn ? 1 : 0);
  }
}

void setup() {
  pinMode(redLedPin, OUTPUT);
  pinMode(greenLedPin, OUTPUT);
  pinMode(speakerPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP); 

  digitalWrite(greenLedPin, HIGH);
  digitalWrite(redLedPin, LOW);
  
  // Serial communication at 9600 baud rate matching Desk Hub Companion Web App
  Serial.begin(9600);
  IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
  
  updateIntervalMillis();
  u8g2.begin();
  updateOLED();
  
  Serial.println(F("Desk Hub Online & Fully Operational!"));
}

void loop() {
  unsigned long currentMillis = millis();

  // 1. Listen for Serial Commands from Desk Hub Companion Web App
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd.length() > 0) {
      handleSerialCommand(cmd);
    }
  }

  // 2. Handle Smooth Text Scrolling Ticker
  if (!sittingLimitReached && devicePoweredOn) {
    if (currentMillis - lastScrollTime >= scrollSpeedDelay) {
      lastScrollTime = currentMillis;
      scrollPos += 2; 
      if (scrollPos > 300) { scrollPos = 0; }
      updateOLED();
    }
  }

  // 3. Listen for IR remote signals
  if (IrReceiver.decode()) {
    unsigned long cmd = IrReceiver.decodedIRData.command;
    
    if (cmd != 0) {
      Serial.print(F("Remote Command Detected: 0x"));
      Serial.println(cmd, HEX);

      // POWER BUTTON (0x12)
      if (cmd == IR_CMD_POWER) {
        devicePoweredOn = !devicePoweredOn;
        if (!devicePoweredOn) {
          digitalWrite(greenLedPin, LOW);
          digitalWrite(redLedPin, LOW);
          noTone(speakerPin);
          IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
          snprintf(feedbackMessage, sizeof(feedbackMessage), "Power: OFF");
          Serial.println(F("-> SYSTEM: Powered OFF"));
        } else {
          digitalWrite(greenLedPin, HIGH);
          previousMillis = currentMillis; 
          sittingLimitReached = false;
          snprintf(feedbackMessage, sizeof(feedbackMessage), "Power: ON & Reset");
          Serial.println(F("-> SYSTEM: Powered ON"));
        }
        updateOLED();
      }

      // MUTE BUTTON (0x1E)
      if (devicePoweredOn && cmd == IR_CMD_MUTE) {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
          snprintf(feedbackMessage, sizeof(feedbackMessage), "Audio: UNMUTED");
        } else {
          snprintf(feedbackMessage, sizeof(feedbackMessage), "Audio: MUTED");
          noTone(speakerPin);
          IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
        }
        Serial.print(F("-> SOUND: "));
        Serial.println(soundEnabled ? F("UNMUTED") : F("MUTED"));
        updateOLED();
      }

      // TIME ADJUSTMENTS (Forward / Backward)
      bool intervalChanged = false;

      if (devicePoweredOn) {
        if (cmd == IR_CMD_FWD) {           // Forward (+5 mins) -> 0x3
          if (workIntervalMinutes == 0) {
            workIntervalMinutes = 20;
          } else {
            workIntervalMinutes += 5;
            if (workIntervalMinutes > 45) workIntervalMinutes = 45;
          }
          intervalChanged = true;
        }
        else if (cmd == IR_CMD_REV) {      // Backward (-5 mins / 10s test) -> 0x2
          if (workIntervalMinutes == 20) {
            workIntervalMinutes = 0; // Drop to 10-second test mode!
          } else if (workIntervalMinutes > 20) {
            workIntervalMinutes -= 5;
          }
          intervalChanged = true;
        }

        if (intervalChanged) {
          updateIntervalMillis();
          previousMillis = currentMillis; 
          sittingLimitReached = false;
          digitalWrite(redLedPin, LOW);
          digitalWrite(greenLedPin, HIGH);
          noTone(speakerPin);
          IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
          
          if (workIntervalMinutes == 0) {
            snprintf(feedbackMessage, sizeof(feedbackMessage), "RESET: 10s TEST MODE");
            Serial.println(F("-> INTERVAL UPDATED & RESET: 10 Secs"));
          } else {
            snprintf(feedbackMessage, sizeof(feedbackMessage), "RESET: %d Mins", workIntervalMinutes);
            Serial.print(F("-> INTERVAL UPDATED & RESET: "));
            Serial.print(workIntervalMinutes);
            Serial.println(F(" mins"));
          }
          updateOLED();
        }
      }

      // RESET / PLAY BUTTON (0x1)
      if (devicePoweredOn && cmd == IR_CMD_RESET) {
        sittingLimitReached = false;
        previousMillis = currentMillis; 
        digitalWrite(redLedPin, LOW);
        noTone(speakerPin);
        IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
        digitalWrite(greenLedPin, HIGH);
        snprintf(feedbackMessage, sizeof(feedbackMessage), "Timer Restarted!");
        Serial.println(F("-> RESET: Timer restarted via Remote"));
        updateOLED();
      }
    }
    
    IrReceiver.resume(); 
  }

  // 4. If powered off, stop all desk timer/alert activities
  if (!devicePoweredOn) {
    digitalWrite(greenLedPin, LOW);
    digitalWrite(redLedPin, LOW);
    noTone(speakerPin);
    return;
  }

  // 5. Desk Hub Timer & Alert Logic
  if (!sittingLimitReached) {
    if (currentMillis - previousMillis >= interval) {
      sittingLimitReached = true;
      digitalWrite(greenLedPin, LOW); 
      Serial.println(F("ALERT: Time to stand up!"));
      noteIndex = 0; 
      isPlayingNote = false;
      alertPreviousMillis = currentMillis;
      updateOLED();
    }
  } 
  else {
    // ALERT STATE: Non-Blocking Star Wars Melody + Flashing Red LED
    int duration = noteDurations[noteIndex];
    int soundOnTime = duration * 0.70; 
    
    if (!isPlayingNote) {
      int currentNote = melody[noteIndex];
      if (currentNote > 0 && soundEnabled) {
        tone(speakerPin, currentNote);
      } else {
        noTone(speakerPin);
        IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
      }
      
      digitalWrite(redLedPin, !digitalRead(redLedPin)); 
      isPlayingNote = true;
      noteStartMillis = currentMillis;
    } 
    else {
      if (currentMillis - noteStartMillis >= soundOnTime) {
        noTone(speakerPin);
        IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
      }

      if (currentMillis - noteStartMillis >= duration) {
        isPlayingNote = false;
        noteIndex = (noteIndex + 1) % melodyLength;
      }
    }

    // Physical pushbutton fallback reset check
    if (digitalRead(buttonPin) == LOW) { 
      sittingLimitReached = false;
      previousMillis = currentMillis; 
      digitalWrite(redLedPin, LOW);
      noTone(speakerPin);
      IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
      digitalWrite(greenLedPin, HIGH); 
      snprintf(feedbackMessage, sizeof(feedbackMessage), "Button Reset!");
      Serial.println(F("-> RESET: Physical button pressed"));
      updateOLED();
      delay(300); 
    }
  }
}
