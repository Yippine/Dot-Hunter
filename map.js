// Map Module - Handles map data and wall rendering
const MapModule = (function() {
    'use strict';

    const { WALL, DOT, POWER_PELLET, EMPTY } = CONFIG;

    // Classic Pacman-style maze layout (31 rows x 28 columns)
    // 0 = Wall, 1 = Dot, 2 = Power Pellet, 3 = Empty
    const mapData = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
        [0,2,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,2,0],
        [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
        [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
        [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,1,0,0,0,0,0,3,0,0,3,0,0,0,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,0,0,0,3,0,0,3,0,0,0,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,3,0,0,0,3,3,0,0,0,3,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,3,0,3,3,3,3,3,3,0,3,0,0,1,0,0,0,0,0,0],
        [3,3,3,3,3,3,1,3,3,3,0,3,3,3,3,3,3,0,3,3,3,1,3,3,3,3,3,3],
        [0,0,0,0,0,0,1,0,0,3,0,3,3,3,3,3,3,0,3,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
        [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
        [0,2,1,1,0,0,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,0,0,1,1,2,0],
        [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
        [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
        [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
        [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];

    /**
     * Get the complete map data
     * @returns {Array<Array<number>>} 2D array representing the map
     */
    function getMapData() {
        return mapData;
    }

    /**
     * Check if a cell is a wall
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} True if cell is a wall
     */
    function isWall(row, col) {
        if (row < 0 || row >= CONFIG.MAP_HEIGHT || col < 0 || col >= CONFIG.MAP_WIDTH) {
            return true; // Out of bounds is treated as wall
        }
        return mapData[row][col] === WALL;
    }

    /**
     * Render the map walls
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    function renderMap(ctx) {
        const { CELL_SIZE, MAP_WIDTH, MAP_HEIGHT, COLORS } = CONFIG;

        ctx.fillStyle = COLORS.WALL;
        ctx.strokeStyle = COLORS.WALL;
        ctx.lineWidth = 2;

        for (let row = 0; row < MAP_HEIGHT; row++) {
            for (let col = 0; col < MAP_WIDTH; col++) {
                if (mapData[row][col] === WALL) {
                    const x = col * CELL_SIZE;
                    const y = row * CELL_SIZE;

                    // Draw filled rectangle for wall
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

                    // Draw border for better definition
                    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                }
            }
        }
    }

    // Public API
    return {
        getMapData,
        isWall,
        renderMap
    };
})();