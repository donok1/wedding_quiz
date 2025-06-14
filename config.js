// config.js - Game Configuration (Updated with Guest Support)

// Questions array in French
const questions = [
    "De l'ananas sur la pizza",
    "Les films d'horreur",
    "Camper dans la nature",
    "Les fêtes surprises",
    "Cuisiner ensemble",
    "Jouer aux jeux de société",
    "Battre son conjoint aux jeux videos",
    "Prendre des selfies",
    "Chanter sous la douche",
    "Echanger son conjoint contre du Nutella",
    "Danser dans le salon",
    "Faire du shopping avec ses ami.es",
    "Faire du shopping avec son conjoint",
    "Dormir sans pijama",
    "Prendre une douche à deux",
    "Essayer de nouveaux endroits pour faire l’amour"
];

// Game settings
const CONFIG = {
    SYNC_INTERVAL: 1000,        // Sync every 1 second
    HEARTBEAT_INTERVAL: 3000,   // Send heartbeat every 3 seconds
    CONNECTION_TIMEOUT: 8000,   // Consider disconnected after 8 seconds
    TOTAL_QUESTIONS: questions.length
};

// Game state initialization
function initializeRoomData() {
    return {
        currentQuestion: 0,
        fannyAnswers: [],
        nelsonAnswers: [],
        guestAnswers: {},      // Object to store guest answers: { guestName: [answers...] }
        guestNames: [],        // Array of registered guest names
        matches: 0,
        gameStarted: false,
        gameCompleted: false,
        heartbeats: {
            fanny: 0,
            nelson: 0,
            admin: 0,
            guests: {}         // Object to store guest heartbeats: { guestName: timestamp }
        }
    };
}

// Compatibility messages based on percentage
function getCompatibilityMessage(percentage) {
    if (percentage >= 80) return "Vous êtes parfaitement synchronisés ! 💕🌿";
    if (percentage >= 60) return "Excellente compatibilité ! Vous vous connaissez bien ! 😊🌸";
    if (percentage >= 40) return "Quelques différences rendent la vie intéressante ! 🌟🌻";
    return "Les opposés s'attirent ! Vous vous complétez ! ⚖️🌺";
}