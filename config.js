// Game Configuration Constants
const CONFIG = {
    // Cell dimensions
    CELL_SIZE: 20,
    MAP_WIDTH: 28,
    MAP_HEIGHT: 31,

    // Cell types
    WALL: 0,
    DOT: 1,
    POWER_PELLET: 2,
    EMPTY: 3,

    // Colors
    COLORS: {
        WALL: '#2121ff',
        DOT: '#ffffff',
        POWER_PELLET: '#ffb897',
        BACKGROUND: '#000000'
    },

    // Dot dimensions
    DOT_RADIUS: 2,
    POWER_PELLET_RADIUS: 5,

    // Game settings
    FPS: 60,
    FRAME_INTERVAL: 1000 / 60 // ~16.67ms
};