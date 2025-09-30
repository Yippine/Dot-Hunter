// Dots Module - Handles dot and power pellet rendering and state
const DotsModule = (function() {
    'use strict';

    const { DOT, POWER_PELLET, CELL_SIZE, DOT_RADIUS, POWER_PELLET_RADIUS, COLORS } = CONFIG;

    let dots = []; // Array to store all dots and power pellets

    /**
     * Initialize dots from map data
     * Extract all DOT and POWER_PELLET positions
     */
    function initDots() {
        const mapData = MapModule.getMapData();
        dots = [];

        for (let row = 0; row < CONFIG.MAP_HEIGHT; row++) {
            for (let col = 0; col < CONFIG.MAP_WIDTH; col++) {
                const cellType = mapData[row][col];

                if (cellType === DOT || cellType === POWER_PELLET) {
                    dots.push({
                        row: row,
                        col: col,
                        x: col * CELL_SIZE + CELL_SIZE / 2,
                        y: row * CELL_SIZE + CELL_SIZE / 2,
                        type: cellType,
                        active: true
                    });
                }
            }
        }

        console.log(`Initialized ${dots.length} dots (including power pellets)`);
    }

    /**
     * Get all dots
     * @returns {Array} Array of dot objects
     */
    function getDots() {
        return dots;
    }

    /**
     * Get active dot count
     * @returns {number} Number of active dots
     */
    function getActiveDotCount() {
        return dots.filter(dot => dot.active).length;
    }

    /**
     * Eat a dot at specific position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Object|null} Eaten dot object or null
     */
    function eatDot(row, col) {
        const dot = dots.find(d =>
            d.active && d.row === row && d.col === col
        );

        if (dot) {
            dot.active = false;
            return dot;
        }

        return null;
    }

    /**
     * Render all active dots
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    function renderDots(ctx) {
        for (const dot of dots) {
            if (!dot.active) continue;

            if (dot.type === DOT) {
                // Render small dot
                ctx.fillStyle = COLORS.DOT;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
                ctx.fill();
            } else if (dot.type === POWER_PELLET) {
                // Render power pellet with pulsing effect
                ctx.fillStyle = COLORS.POWER_PELLET;
                ctx.beginPath();

                // Add slight pulsing animation
                const pulseRadius = POWER_PELLET_RADIUS + Math.sin(Date.now() / 200) * 0.5;
                ctx.arc(dot.x, dot.y, pulseRadius, 0, Math.PI * 2);
                ctx.fill();

                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = COLORS.POWER_PELLET;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, pulseRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    /**
     * Reset all dots to active state
     */
    function resetDots() {
        dots.forEach(dot => {
            dot.active = true;
        });
    }

    // Public API
    return {
        initDots,
        getDots,
        getActiveDotCount,
        eatDot,
        renderDots,
        resetDots
    };
})();