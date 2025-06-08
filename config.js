// config.js - Game Configuration

// Questions array in French
const questions = [
    "L'ananas sur la pizza",
    "Se lever tôt le week-end",
    "Les films d'horreur",
    "Chanter sous la douche",
    "Les réseaux sociaux",
    "Danser en soirée",
    "Camper dans la nature",
    "La nourriture épicée",
    "Les fêtes surprises",
    "Les longues promenades romantiques",
    "Cuisiner ensemble",
    "Regarder la télé-réalité",
    "Faire du shopping",
    "Jouer aux jeux de société",
    "Prendre des selfies"
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
        matches: 0,
        gameStarted: false,
        gameCompleted: false,
        heartbeats: {
            fanny: 0,
            nelson: 0,
            admin: 0
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