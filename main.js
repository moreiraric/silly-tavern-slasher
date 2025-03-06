let gameTime = 18; // Start at 6:00 PM
let activeCharacters = [];
let remainingCharacters = [];
let storyProgress = {};

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
        "Footsteps creak upstairs. But everyone is here.",
        "A painting on the wall is now crooked, though no one touched it.",
        "[CHAR] swears they just heard their name whispered in their ear."
    ],
    "12:30AM": [
        "A loud THUMP echoes from the upper floor.",
        "[CHAR] glances around. 'Wait… where’s [CHAR2]?'",
        "A smear of blood appears on the floor.",
        "You hear scratching at the door, but when you check, there’s nothing."
    ]
};

// Initialize the game
function initializeGame(characters) {
    activeCharacters = characters;
    remainingCharacters = [...characters];
    storyProgress = {};
    console.log("Slasher Night Initialized with characters: " + activeCharacters.join(", "));
}

// Advances time by 10-15 minutes
function advanceTime() {
    let timeJump = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
    gameTime += timeJump;
    console.log("Time advanced by " + timeJump + " minutes. Current time: " + formatTime(gameTime));
    checkForHorrorEvents();
}

// Checks if a horror event should trigger
function checkForHorrorEvents() {
    let timeWindow = getTimeWindow();
    if (timeWindow && Math.random() < 0.5) { // 50% chance of an event
        triggerHorrorEvent(timeWindow);
    }
}

// Triggers a horror event
function triggerHorrorEvent(timeWindow) {
    let eventList = horrorEvents[timeWindow];
    let selectedEvent = eventList[Math.floor(Math.random() * eventList.length)];
    let character = getRandomCharacter();
    console.log(selectedEvent.replace("[CHAR]", character));
}

// Removes a character from the game
function killCharacter() {
    if (remainingCharacters.length > 1) {
        let victim = remainingCharacters.splice(Math.floor(Math.random() * remainingCharacters.length), 1)[0];
        console.log(victim + " has disappeared...");
    } else {
        console.log("The final survivor remains. The game is nearing its end.");
    }
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
