let gameTime = 18; // Start at 6:00 PM
let activeCharacters = [];
let remainingCharacters = [];
let storyProgress = {};
let slasherEnabled = false;

// Enable the extension
function enableSlasherNight() {
    slasherEnabled = true;
    console.log("🔪 Slasher Night enabled. Prepare for horror.");
}

// Disable the extension
function disableSlasherNight() {
    slasherEnabled = false;
    console.log("🚪 Slasher Night disabled.");
}

// Triggers an intro message when a new chat starts
function startIntroMessage() {
    if (!slasherEnabled) return;
    console.log("🌲 The night is quiet as you and your friends arrive at the lake house. The air is crisp, the moon high in the sky. Nothing seems wrong... yet.");
}

// Initializes the game with characters
function initializeGame(characters) {
    if (!slasherEnabled) return;
    activeCharacters = characters;
    remainingCharacters = [...characters];
    storyProgress = {};
    startIntroMessage();
    console.log("Slasher Night Initialized with characters: " + activeCharacters.join(", "));
}

// Advances time by 10-15 minutes
function advanceTime() {
    if (!slasherEnabled) return;
    let timeJump = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
    gameTime += timeJump;
    console.log("⏳ Time advanced by " + timeJump + " minutes. Current time: " + formatTime(gameTime));
    checkForHorrorEvents();
}

// Checks if a horror event should trigger
function checkForHorrorEvents() {
    if (!slasherEnabled) return;
    let timeWindow = getTimeWindow();
    if (timeWindow && Math.random() < 0.5) { // 50% chance of an event
        triggerHorrorEvent(timeWindow);
    }
}

// Triggers a horror event
function triggerHorrorEvent(timeWindow) {
    if (!slasherEnabled) return;
    let eventList = horrorEvents[timeWindow];
    let selectedEvent = eventList[Math.floor(Math.random() * eventList.length)];
    let character = getRandomCharacter();
    console.log(selectedEvent.replace("[CHAR]", character));
}

// Removes a character from the game
function killCharacter() {
    if (!slasherEnabled || remainingCharacters.length <= 1) return;
    let victim = remainingCharacters.splice(Math.floor(Math.random() * remainingCharacters.length), 1)[0];
    console.log("💀 " + victim + " has disappeared...");
}

// Returns the appropriate time window for events
function getTimeWindow() {
    if (gameTime >= 21 && gameTime < 23) return "9PM";
    if (gameTime >= 23 && gameTime < 24) return "11PM";
    if (gameTime >= 24) return "12:30AM";
    return null;
}

// Picks a random remaining character
function getRandomCharacter() {
    return remainingCharacters[Math.floor(Math.random() * remainingCharacters.length)];
}

// Formats time for display
function formatTime(time) {
    let hours = Math.floor(time);
    let minutes = (time % 1) * 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
}
