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
    FRAME_INTERVAL: 1000 / 60, // ~16.67ms

    // Player settings
    PLAYER_SPEED: 2.5, // Cells per second
    PLAYER_RADIUS: 8,
    PLAYER_START_POS: {
        row: 23,
        col: 14
    },
    PLAYER_COLOR: '#ffff00',
    LOOKAHEAD_DISTANCE: 8, // Pixels ahead to check for direction change
    ALIGNMENT_TOLERANCE: 5, // Pixel tolerance for grid alignment

    // Direction constants
    DIRECTIONS: {
        UP: { row: -1, col: 0, angle: 1.5 * Math.PI },
        DOWN: { row: 1, col: 0, angle: 0.5 * Math.PI },
        LEFT: { row: 0, col: -1, angle: Math.PI },
        RIGHT: { row: 0, col: 1, angle: 0 },
        NONE: { row: 0, col: 0, angle: 0 }
    }
};