/* 
  index.js: Minimal Slasher Plugin for Silly Tavern (UI Extension)

  – Tracks in-story time
  – Randomly triggers “spooky” events
  – Provides /killnext slash command
  – Adds a small extension settings panel under "Extensions"

  Expand this as needed: more events, actual character tracking, etc.
*/

// Attempt to import core utilities from SillyTavern:
import {
    eventSource,
    event_types,
    extension_settings,
    saveSettingsDebounced,
    SlashCommandParser,
    SlashCommand,
    SlashCommandArgument
} from "../../../../script.js";

////////////////////////////////////////////////////////////////
// Default config/state that we’ll store in extension_settings:
////////////////////////////////////////////////////////////////

const EXTENSION_KEY = "SillyTavernSlasher"; // unique key for your extension

// Default user-facing settings & internal game state
const defaultExtensionState = {
    enabled: false,
    // The number of “in-story” minutes to add for every user message
    timeIncrement: 15,
    // Example current time, in minutes since midnight (e.g. 19*60 + 30 = 1170 => 7:30 PM).
    // Feel free to store hours/minutes separately. This is just a convenient numeric approach.
    currentTime: 19 * 60 + 30,
    // You can store more advanced data here: which characters are alive, event triggers, etc.
};

// Access or create extension state in SillyTavern’s settings object
function getExtensionState() {
    if (!extension_settings[EXTENSION_KEY]) {
        extension_settings[EXTENSION_KEY] = { ...defaultExtensionState };
    }
    // Make sure new fields from defaultExtensionState exist if we add them in updates
    for (const key in defaultExtensionState) {
        if (extension_settings[EXTENSION_KEY][key] === undefined) {
            extension_settings[EXTENSION_KEY][key] = defaultExtensionState[key];
        }
    }
    return extension_settings[EXTENSION_KEY];
}

// Helper: Save any changes to settings
function saveState() {
    saveSettingsDebounced();
}

// Convert our “minutes since midnight” to an HH:MM or H:MMxx format, e.g. “7:45 PM”.
function formatTime(minutesSinceMidnight) {
    const totalMinutes = minutesSinceMidnight % (24 * 60); // wrap around 24h
    let hour = Math.floor(totalMinutes / 60);
    let minute = totalMinutes % 60;
    let suffix = "AM";
    if (hour === 0) {
        hour = 12; // midnight hour in 12-hour format
    } else if (hour === 12) {
        suffix = "PM";
    } else if (hour > 12) {
        hour -= 12;
        suffix = "PM";
    }
    if (hour < 12 && minutesSinceMidnight >= 12 * 60) {
        suffix = "PM";
    }
    return `${hour}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

// Example “spooky event” table, keyed by approximate times
// Obviously, you'd expand or randomize as you like
const horrorEvents = [
    {
        start: 20 * 60 + 45, // 8:45 PM
        end:   21 * 60 + 15, // 9:15 PM
        chanceAtStart: 0.1,   // 10% at 8:45
        chanceAtEnd:   1.0,   // 100% by 9:15
        message: "A sudden chill sweeps through the room. A window slams shut by itself..."
    },
    {
        start: 23 * 60 + 0,  // 11:00 PM
        end:   23 * 60 + 30, // 11:30 PM
        chanceAtStart: 0.3,
        chanceAtEnd:   1.0,
        message: "An eerie thump echoes from upstairs... Something (or someone) is moving in the dark."
    },
    // Add as many as you'd like
];

// Helper to see if an event is in range & handle probability scaling
function checkForHorrorEvent(currentTime) {
    // For each event, if currentTime is within [start, end], do a probability roll
    for (const evt of horrorEvents) {
        if (currentTime >= evt.start && currentTime <= evt.end) {
            // Figure out how far we are from start -> end
            const range = evt.end - evt.start; // in minutes
            const progress = currentTime - evt.start; // how many minutes since start
            const fraction = progress / range; // from 0.0 at start to 1.0 at end
            // Weighted probability
            const chance = evt.chanceAtStart + fraction * (evt.chanceAtEnd - evt.chanceAtStart);
            // Roll a random number between 0 and 1
            if (Math.random() < chance) {
                return evt.message; // Return the message we want to insert
            }
        }
    }
    return null; // No event triggered
}

////////////////////////////////////////////////////////////////
// Event Handler: On user message => increment time & maybe spook
////////////////////////////////////////////////////////////////
function onUserMessageSent() {
    const state = getExtensionState();
    if (!state.enabled) return;

    // 1) Advance time
    state.currentTime += state.timeIncrement;

    // 2) Check for horror event
    const eventMsg = checkForHorrorEvent(state.currentTime);
    if (eventMsg) {
        // Insert a “system-like” message describing the spooky event
        insertSystemMessage(
            `[Slasher] [${formatTime(state.currentTime)}] ${eventMsg}`
        );
    }

    // Save updated state
    saveState();
}

// Minimal helper to insert a system message in chat
function insertSystemMessage(text) {
    // We'll just push a neutral/narrator message. Another approach is to do /sys or /comment.
    // For a typical extension approach, we can do something like:
    // (We import "context" from getContext if you want more control.)
    const context = window.SillyTavern.getContext();
    context.addMessage({
        is_user: false,
        name: "Narrator",
        // Mark as system / ephemeral if you like
        force_role: true,
        // This message type is recognized as a system or narrator message in the UI
        swipes: [],
        // Add a custom CSS class to style it if you want
        extensionId: EXTENSION_KEY,
        // The actual text
        mes: text
    });
}

////////////////////////////////////////////////////////////////
// Slash Command: /killnext
////////////////////////////////////////////////////////////////
function registerKillNextCommand() {
    // Minimal example: kills the “next” character and inserts a scene
    const killNextCommand = new SlashCommand(
        "killnext",
        (namedArgs, unnamedArgs) => {
            // Typically you'd pick a random or specific alive character,
            // mark them as missing/dead, etc. For now, we’ll just do a spooky message:
            insertSystemMessage("[Slasher] You sense an ominous shift... Another friend disappears!");
            return "Initiated disappearance event.";
        }
    );
    killNextCommand.help = "Force the next disappearance or death in the Slasher scenario.";
    SlashCommandParser.addCommandObject(killNextCommand);
}

////////////////////////////////////////////////////////////////
// Settings Panel (under Extensions -> Slasher)
////////////////////////////////////////////////////////////////
function createSettingsPanel() {
    // Grab extension state
    const state = getExtensionState();

    // This short code snippet demonstrates a minimal panel UI
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "8px";

    // 1) Enabled/Disabled
    const toggleLabel = document.createElement("label");
    toggleLabel.textContent = "Enable Slasher Logic:";
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = state.enabled;
    toggle.onchange = () => {
        state.enabled = toggle.checked;
        saveState();
    };
    toggleLabel.prepend(toggle);

    // 2) Time Increment
    const incrementLabel = document.createElement("label");
    incrementLabel.textContent = "Minutes to Advance per Message:";
    const incrementInput = document.createElement("input");
    incrementInput.type = "number";
    incrementInput.value = state.timeIncrement;
    incrementInput.min = 1;
    incrementInput.max = 180;
    incrementInput.onchange = () => {
        state.timeIncrement = parseInt(incrementInput.value, 10) || 15;
        saveState();
    };
    incrementLabel.appendChild(document.createElement("br"));
    incrementLabel.appendChild(incrementInput);

    // 3) Current Time Display (read-only, but you can add a “reset” button)
    const timeLabel = document.createElement("div");
    timeLabel.innerHTML = `<strong>Current In-Story Time:</strong> ${formatTime(state.currentTime)}`;

    // We might add a “Reset Time” button
    const resetTimeBtn = document.createElement("button");
    resetTimeBtn.textContent = "Reset to 7:30 PM";
    resetTimeBtn.onclick = () => {
        state.currentTime = 19 * 60 + 30;
        saveState();
        timeLabel.innerHTML = `<strong>Current In-Story Time:</strong> ${formatTime(state.currentTime)}`;
    };

    // Put them all together
    wrapper.appendChild(toggleLabel);
    wrapper.appendChild(incrementLabel);
    wrapper.appendChild(timeLabel);
    wrapper.appendChild(resetTimeBtn);

    return wrapper;
}

////////////////////////////////////////////////////////////////
// Lifecycle
////////////////////////////////////////////////////////////////
function onLoad() {
    // 1) Register slash commands
    registerKillNextCommand();

    // 2) Subscribe to user message events
    eventSource.on(event_types.MESSAGE_SENT, onUserMessageSent);

    // 3) Register a small settings panel in the extension UI
    //    The function registerExtensionSettingsPanel(title, HTMLElement or function)
    //    might vary depending on your ST version. 
    const context = window.SillyTavern.getContext();
    context.registerExtensionSettingsPanel(
        "Silly Tavern Slasher",
        createSettingsPanel
    );
    
    console.log("[SillyTavernSlasher] Loaded extension!");
}

function onUnload() {
    // If the extension is turned off or uninstalled:
    // 1) Unsubscribe from events
    eventSource.off(event_types.MESSAGE_SENT, onUserMessageSent);
    
    // 2) Optionally remove slash commands if you want them gone
    //    There's no official removeCommand, but you can do it if needed.
    
    console.log("[SillyTavernSlasher] Unloaded extension!");
}

// Register ourselves with SillyTavern (older style).
// Some ST versions require a default export, others an IIFE. Adjust as needed:
export default {
    onLoad,
    onUnload
};
