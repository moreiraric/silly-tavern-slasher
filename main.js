// Global Variables
let gameTime = 18;            // 6:00 PM start
let activeCharacters = [];     // All characters in the session
let remainingCharacters = [];  // Those who are still alive/missing
let slasherEnabled = false;    // Tracks if the extension is enabled

// Horror Event Pools
const horrorEvents = {
  "9PM": [
    "A window slams shut. No wind.",
    "[CHAR] hears faint whispers from the woods.",
    "A shadow moves outside, but when [CHAR] looks, it's gone.",
    "The lights flicker, then return to normal.",
    "[CHAR]'s phone vibrates. It's an unknown number."
  ],
  "11PM": [
    "Someone’s phone rings—Unknown Caller.",
    "Footsteps creak upstairs... but everyone is here.",
    "A painting on the wall is now crooked, though no one touched it.",
    "[CHAR] swears they just heard their name whispered in their ear."
  ],
  "12:30AM": [
    "A loud THUMP echoes from the upper floor.",
    "[CHAR] glances around. 'Wait... where’s [CHAR2]?'",
    "A smear of blood appears on the floor.",
    "You hear scratching at the door, but there's nothing outside."
  ]
};

// EXTENSION ENABLE/DISABLE
function enableSlasherNight() {
  slasherEnabled = true;
  console.log("🔪 Slasher Night enabled. Let the horror begin.");
}
function disableSlasherNight() {
  slasherEnabled = false;
  console.log("🚪 Slasher Night disabled.");
}

// INITIAL INTRO
function introMessage() {
  if (!slasherEnabled) return;
  console.log("🌲 The night is quiet as you and your friends arrive at the lake house. The air is crisp, the moon high. Nothing seems wrong... yet.");
}

// COMMAND: initialize_game
function initializeGame(characters) {
  if (!slasherEnabled) return;
  activeCharacters = characters;
  remainingCharacters = [...characters];
  gameTime = 18; // reset time to 6 PM
  console.log(`Slasher Night Initialized with characters: ${activeCharacters.join(", ")}`);
  introMessage();
}

// COMMAND: advance_time
function advanceTime() {
  if (!slasherEnabled) return;
  let jump = Math.floor(Math.random() * 6) + 10; // 10-15
  gameTime += jump;
  console.log(`⏳ Time advanced by ${jump} minutes. Current time: ${formatTime(gameTime)}`);
  checkForHorrorEvents();
}

// COMMAND: force_event
function triggerHorrorEvent() {
  if (!slasherEnabled) return;
  // Force a random time window event
  let windowKeys = Object.keys(horrorEvents);
  let randomWindow = windowKeys[Math.floor(Math.random() * windowKeys.length)];
  performHorrorEvent(randomWindow);
}

// COMMAND: kill_character
function killCharacter() {
  if (!slasherEnabled) return;
  if (remainingCharacters.length <= 1) {
    console.log("⚠️ Not enough characters to kill. The final survivor remains.");
    return;
  }
  let victimIndex = Math.floor(Math.random() * remainingCharacters.length);
  let victim = remainingCharacters.splice(victimIndex, 1)[0];
  console.log(`💀 ${victim} has disappeared...`);
}

// CHECK FOR HORROR EVENTS AFTER TIME ADVANCES
function checkForHorrorEvents() {
  let windowName = getTimeWindow();
  if (!windowName) return;    // No event window
  // 50% chance to trigger an event
  if (Math.random() < 0.5) {
    performHorrorEvent(windowName);
  }
}

// HELPER: Execute a random horror event from the chosen time window
function performHorrorEvent(windowName) {
  let events = horrorEvents[windowName];
  if (!events || events.length === 0) return;
  let eventText = events[Math.floor(Math.random() * events.length)];
  // Replace [CHAR] with a random character, [CHAR2] with another random character
  let char1 = getRandomCharacter();
  let char2 = getRandomCharacter(char1); // ensure it's not the same as char1
  eventText = eventText.replace("[CHAR]", char1).replace("[CHAR2]", char2);
  console.log(eventText);
}

// DETERMINE WHICH TIME WINDOW WE'RE IN
function getTimeWindow() {
  if (gameTime >= 21 && gameTime < 23) return "9PM";
  if (gameTime >= 23 && gameTime < 24) return "11PM";
  if (gameTime >= 24) return "12:30AM";
  return null;
}

// RANDOM CHARACTER PICK
function getRandomCharacter(exclude) {
  if (remainingCharacters.length === 0) return "Nobody";
  let viable = remainingCharacters.filter(c => c !== exclude);
  if (viable.length === 0) viable = remainingCharacters;
  return viable[Math.floor(Math.random() * viable.length)];
}

// FORMAT TIME
function formatTime(num) {
  // Each increment is about 1 hour from 6 PM
  let baseHour = Math.floor(num);
  // Convert to 12-hour format
  let suffix = baseHour >= 12 ? "PM" : "AM";
  let displayHour = baseHour > 12 ? baseHour - 12 : baseHour;
  if (displayHour === 0) displayHour = 12;
  return `${displayHour}:00 ${suffix}`;
}
