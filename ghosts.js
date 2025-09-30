// Ghosts Module - Handles ghost AI, movement, and state management
const GhostsModule = (function() {
    'use strict';

    const { CELL_SIZE, DIRECTIONS } = CONFIG;

    // Ghost configuration
    const GHOST_CONFIG = {
        SPEED: 2.0, // Cells per second (slightly slower than player)
        RADIUS: 8,
        FRIGHTENED_SPEED: 1.5, // Slower when frightened
        FRIGHTENED_DURATION: 8000, // 8 seconds
        FRIGHTENED_FLASH_START: 6000, // Start flashing at 6 seconds
        RESPAWN_DURATION: 2000, // 2 seconds to return to ghost house

        // Ghost house position (center of map)
        GHOST_HOUSE: {
            row: 14,
            col: 14
        },

        // Ghost starting positions
        START_POSITIONS: [
            { row: 11, col: 13, color: '#ff0000', name: 'Blinky' },  // Red - top-left
            { row: 13, col: 13, color: '#ffb8ff', name: 'Pinky' },   // Pink - bottom-left
            { row: 13, col: 14, color: '#00ffff', name: 'Inky' },    // Cyan - bottom-right
            { row: 11, col: 14, color: '#ffb851', name: 'Clyde' }    // Orange - top-right
        ],

        COLORS: {
            FRIGHTENED: '#2121de',
            FRIGHTENED_FLASH: '#ffffff',
            EYES: '#ffffff',
            PUPIL: '#0000ff'
        }
    };

    // Ghost states
    const GHOST_STATE = {
        CHASE: 'chase',
        FRIGHTENED: 'frightened',
        EATEN: 'eaten',
        IN_HOUSE: 'in_house'
    };

    let ghosts = [];
    let powerModeTimer = 0;
    let powerModeActive = false;

    /**
     * Initialize ghosts at starting positions
     */
    function init() {
        ghosts = GHOST_CONFIG.START_POSITIONS.map((config, index) => ({
            id: index,
            name: config.name,
            color: config.color,
            position: {
                row: config.row,
                col: config.col,
                x: config.col * CELL_SIZE + CELL_SIZE / 2,
                y: config.row * CELL_SIZE + CELL_SIZE / 2
            },
            targetPosition: {
                row: config.row,
                col: config.col
            },
            direction: DIRECTIONS.NONE,
            state: GHOST_STATE.CHASE,
            speed: GHOST_CONFIG.SPEED,
            moving: false,
            respawnTimer: 0
        }));

        powerModeActive = false;
        powerModeTimer = 0;

        // Force first direction calculation to break initialization deadlock
        // Without this, ghosts start with direction = NONE and moving = false,
        // causing them to wait indefinitely at spawn positions
        ghosts.forEach(ghost => {
            // Get player starting position (center of map at row 23, col 14)
            const playerStartPos = { row: 23, col: 14 };

            // Calculate first chase direction
            const firstDirection = chooseBestDirection(ghost, playerStartPos);

            if (firstDirection !== DIRECTIONS.NONE) {
                ghost.direction = firstDirection;
                ghost.targetPosition.row = ghost.position.row + firstDirection.row;
                ghost.targetPosition.col = ghost.position.col + firstDirection.col;
                ghost.moving = true;
            }
        });

        console.log(`Initialized ${ghosts.length} ghosts`);
    }

    /**
     * Activate power mode (when power pellet is eaten)
     */
    function activatePowerMode() {
        powerModeActive = true;
        powerModeTimer = GHOST_CONFIG.FRIGHTENED_DURATION;

        // Set all active ghosts to frightened state
        ghosts.forEach(ghost => {
            if (ghost.state === GHOST_STATE.CHASE) {
                ghost.state = GHOST_STATE.FRIGHTENED;
                ghost.speed = GHOST_CONFIG.FRIGHTENED_SPEED;
                // Reverse direction
                ghost.direction = {
                    row: -ghost.direction.row,
                    col: -ghost.direction.col,
                    angle: ghost.direction.angle
                };
            }
        });

        console.log('Power mode activated!');
    }

    /**
     * Check if power mode is active
     * @returns {boolean} True if power mode is active
     */
    function isPowerModeActive() {
        return powerModeActive;
    }

    /**
     * Get power mode timer (for UI display)
     * @returns {number} Remaining time in milliseconds
     */
    function getPowerModeTimer() {
        return powerModeTimer;
    }

    /**
     * Calculate Manhattan distance between two positions
     * @param {Object} pos1 - First position {row, col}
     * @param {Object} pos2 - Second position {row, col}
     * @returns {number} Manhattan distance
     */
    function manhattanDistance(pos1, pos2) {
        return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
    }

    /**
     * Get valid directions from current position
     * @param {Object} ghost - Ghost object
     * @returns {Array} Array of valid directions
     */
    function getValidDirections(ghost) {
        const validDirs = [];
        const oppositeDir = {
            row: -ghost.direction.row,
            col: -ghost.direction.col
        };

        // Check all four directions
        [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT].forEach(dir => {
            const nextRow = ghost.position.row + dir.row;
            const nextCol = ghost.position.col + dir.col;

            // Don't allow 180-degree turns unless at ghost house
            const isOpposite = dir.row === oppositeDir.row && dir.col === oppositeDir.col;
            const atGhostHouse = ghost.position.row === GHOST_CONFIG.GHOST_HOUSE.row &&
                                 ghost.position.col === GHOST_CONFIG.GHOST_HOUSE.col;

            if (!MapModule.isWall(nextRow, nextCol) && (!isOpposite || atGhostHouse)) {
                validDirs.push(dir);
            }
        });

        return validDirs;
    }

    /**
     * Choose best direction based on target (chase mode)
     * @param {Object} ghost - Ghost object
     * @param {Object} target - Target position {row, col}
     * @returns {Object} Best direction
     */
    function chooseBestDirection(ghost, target) {
        const validDirs = getValidDirections(ghost);

        if (validDirs.length === 0) {
            return DIRECTIONS.NONE;
        }

        // If only one valid direction, take it
        if (validDirs.length === 1) {
            return validDirs[0];
        }

        // Choose direction that minimizes distance to target
        let bestDir = validDirs[0];
        let bestDistance = Infinity;

        validDirs.forEach(dir => {
            const nextPos = {
                row: ghost.position.row + dir.row,
                col: ghost.position.col + dir.col
            };
            const distance = manhattanDistance(nextPos, target);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestDir = dir;
            }
        });

        return bestDir;
    }

    /**
     * Choose random direction (frightened mode)
     * @param {Object} ghost - Ghost object
     * @returns {Object} Random direction
     */
    function chooseRandomDirection(ghost) {
        const validDirs = getValidDirections(ghost);

        if (validDirs.length === 0) {
            return DIRECTIONS.NONE;
        }

        return validDirs[Math.floor(Math.random() * validDirs.length)];
    }

    /**
     * Update ghost AI and movement
     * @param {Object} ghost - Ghost object
     * @param {Object} playerPos - Player position {row, col}
     */
    function updateGhostAI(ghost, playerPos) {
        // Check if at target position (grid-aligned)
        const atTarget = ghost.position.row === ghost.targetPosition.row &&
                        ghost.position.col === ghost.targetPosition.col;

        // Allow AI update only when at target OR when direction is NONE (safety check)
        // The direction = NONE check ensures ghosts can recover from initialization deadlock
        if (!atTarget && ghost.direction !== DIRECTIONS.NONE) {
            return; // Still moving to target, wait until aligned
        }

        let newDirection;

        switch (ghost.state) {
            case GHOST_STATE.CHASE:
                // Chase player
                newDirection = chooseBestDirection(ghost, playerPos);
                break;

            case GHOST_STATE.FRIGHTENED:
                // Random movement
                newDirection = chooseRandomDirection(ghost);
                break;

            case GHOST_STATE.EATEN:
                // Return to ghost house
                newDirection = chooseBestDirection(ghost, GHOST_CONFIG.GHOST_HOUSE);
                break;

            case GHOST_STATE.IN_HOUSE:
                // Exit ghost house
                newDirection = chooseBestDirection(ghost, playerPos);
                if (manhattanDistance(ghost.position, GHOST_CONFIG.GHOST_HOUSE) > 2) {
                    ghost.state = GHOST_STATE.CHASE;
                }
                break;

            default:
                newDirection = DIRECTIONS.NONE;
        }

        if (newDirection !== DIRECTIONS.NONE) {
            ghost.direction = newDirection;
            ghost.targetPosition.row = ghost.position.row + newDirection.row;
            ghost.targetPosition.col = ghost.position.col + newDirection.col;
            ghost.moving = true;
        } else {
            ghost.moving = false;
        }
    }

    /**
     * Move ghost towards target position
     * @param {Object} ghost - Ghost object
     * @param {number} deltaTime - Time since last update (ms)
     */
    function moveGhost(ghost, deltaTime) {
        if (!ghost.moving) return;

        const targetX = ghost.targetPosition.col * CELL_SIZE + CELL_SIZE / 2;
        const targetY = ghost.targetPosition.row * CELL_SIZE + CELL_SIZE / 2;

        const dx = targetX - ghost.position.x;
        const dy = targetY - ghost.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const moveSpeed = (ghost.speed * CELL_SIZE * deltaTime) / 1000;

            if (distance <= moveSpeed) {
                // Snap to target
                ghost.position.x = targetX;
                ghost.position.y = targetY;
                ghost.position.row = ghost.targetPosition.row;
                ghost.position.col = ghost.targetPosition.col;
            } else {
                // Interpolate movement
                ghost.position.x += (dx / distance) * moveSpeed;
                ghost.position.y += (dy / distance) * moveSpeed;
            }
        }
    }

    /**
     * Check collision between ghost and player
     * @param {Object} ghost - Ghost object
     * @param {Object} playerPos - Player position {x, y}
     * @returns {boolean} True if collision detected
     */
    function checkCollision(ghost, playerPos) {
        const dx = ghost.position.x - playerPos.x;
        const dy = ghost.position.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const collisionDistance = GHOST_CONFIG.RADIUS + CONFIG.PLAYER_RADIUS;
        return distance < collisionDistance;
    }

    /**
     * Handle ghost being eaten by player
     * @param {Object} ghost - Ghost object
     */
    function eatGhost(ghost) {
        ghost.state = GHOST_STATE.EATEN;
        ghost.speed = GHOST_CONFIG.SPEED * 2; // Move faster when returning
        ghost.respawnTimer = GHOST_CONFIG.RESPAWN_DURATION;
        console.log(`${ghost.name} was eaten!`);
    }

    /**
     * Update all ghosts
     * @param {number} deltaTime - Time since last update (ms)
     * @param {Object} playerPos - Player position {row, col, x, y}
     */
    function update(deltaTime, playerPos) {
        // Update power mode timer
        if (powerModeActive) {
            powerModeTimer -= deltaTime;

            if (powerModeTimer <= 0) {
                powerModeActive = false;
                powerModeTimer = 0;

                // Restore all frightened ghosts to chase mode
                ghosts.forEach(ghost => {
                    if (ghost.state === GHOST_STATE.FRIGHTENED) {
                        ghost.state = GHOST_STATE.CHASE;
                        ghost.speed = GHOST_CONFIG.SPEED;
                    }
                });

                // Reset ghost combo in score manager
                if (typeof ScoreManager !== 'undefined') {
                    ScoreManager.resetGhostCombo();
                }

                console.log('Power mode ended');
            }
        }

        // Update each ghost
        ghosts.forEach(ghost => {
            // Update respawn timer for eaten ghosts
            if (ghost.state === GHOST_STATE.EATEN) {
                ghost.respawnTimer -= deltaTime;

                // Check if reached ghost house
                if (ghost.position.row === GHOST_CONFIG.GHOST_HOUSE.row &&
                    ghost.position.col === GHOST_CONFIG.GHOST_HOUSE.col) {
                    ghost.state = GHOST_STATE.IN_HOUSE;
                    ghost.speed = GHOST_CONFIG.SPEED;
                    console.log(`${ghost.name} respawned`);
                }
            }

            // Update AI and movement
            updateGhostAI(ghost, playerPos);
            moveGhost(ghost, deltaTime);
        });
    }

    /**
     * Check collisions with player and handle interactions
     * @param {Object} playerPos - Player position {x, y}
     * @returns {Object} Collision result {ghostEaten, playerEaten, ghost}
     */
    function checkPlayerCollisions(playerPos) {
        for (const ghost of ghosts) {
            if (ghost.state === GHOST_STATE.EATEN || ghost.state === GHOST_STATE.IN_HOUSE) {
                continue; // Skip eaten ghosts
            }

            if (checkCollision(ghost, playerPos)) {
                if (ghost.state === GHOST_STATE.FRIGHTENED) {
                    // Player eats ghost
                    eatGhost(ghost);
                    return { ghostEaten: true, playerEaten: false, ghost };
                } else {
                    // Ghost eats player
                    return { ghostEaten: false, playerEaten: true, ghost };
                }
            }
        }

        return { ghostEaten: false, playerEaten: false, ghost: null };
    }

    /**
     * Render a single ghost
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} ghost - Ghost object
     */
    function renderGhost(ctx, ghost) {
        // Determine color based on state
        let bodyColor = ghost.color;

        if (ghost.state === GHOST_STATE.FRIGHTENED) {
            // Flash between blue and white when time is running out
            const flashThreshold = GHOST_CONFIG.FRIGHTENED_FLASH_START;
            if (powerModeTimer < flashThreshold) {
                const flashRate = 200; // Flash every 200ms
                bodyColor = (Date.now() % flashRate) < (flashRate / 2)
                    ? GHOST_CONFIG.COLORS.FRIGHTENED
                    : GHOST_CONFIG.COLORS.FRIGHTENED_FLASH;
            } else {
                bodyColor = GHOST_CONFIG.COLORS.FRIGHTENED;
            }
        } else if (ghost.state === GHOST_STATE.EATEN) {
            // Only render eyes when eaten
            renderEyes(ctx, ghost);
            return;
        }

        // Draw ghost body (rounded top, wavy bottom)
        ctx.fillStyle = bodyColor;
        ctx.beginPath();

        // Top semicircle
        ctx.arc(
            ghost.position.x,
            ghost.position.y - GHOST_CONFIG.RADIUS / 4,
            GHOST_CONFIG.RADIUS,
            Math.PI,
            0
        );

        // Wavy bottom (3 waves)
        const waveWidth = (GHOST_CONFIG.RADIUS * 2) / 3;
        const waveHeight = GHOST_CONFIG.RADIUS / 3;
        const baseY = ghost.position.y + GHOST_CONFIG.RADIUS - GHOST_CONFIG.RADIUS / 4;

        for (let i = 0; i < 3; i++) {
            const waveX = ghost.position.x - GHOST_CONFIG.RADIUS + (i * waveWidth);
            const controlY = baseY + (i % 2 === 0 ? waveHeight : 0);

            ctx.quadraticCurveTo(
                waveX + waveWidth / 2,
                controlY,
                waveX + waveWidth,
                baseY
            );
        }

        ctx.closePath();
        ctx.fill();

        // Draw eyes (unless frightened)
        if (ghost.state !== GHOST_STATE.FRIGHTENED) {
            renderEyes(ctx, ghost);
        } else {
            // Draw simplified frightened face
            renderFrightenedFace(ctx, ghost);
        }
    }

    /**
     * Render ghost eyes
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} ghost - Ghost object
     */
    function renderEyes(ctx, ghost) {
        const eyeRadius = GHOST_CONFIG.RADIUS / 3;
        const pupilRadius = eyeRadius / 2;
        const eyeOffsetX = GHOST_CONFIG.RADIUS / 2;
        const eyeOffsetY = GHOST_CONFIG.RADIUS / 3;

        // Left eye
        ctx.fillStyle = GHOST_CONFIG.COLORS.EYES;
        ctx.beginPath();
        ctx.arc(
            ghost.position.x - eyeOffsetX,
            ghost.position.y - eyeOffsetY,
            eyeRadius,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Right eye
        ctx.beginPath();
        ctx.arc(
            ghost.position.x + eyeOffsetX,
            ghost.position.y - eyeOffsetY,
            eyeRadius,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Pupils (look in direction of movement)
        ctx.fillStyle = GHOST_CONFIG.COLORS.PUPIL;
        const pupilOffsetX = ghost.direction.col * pupilRadius / 2;
        const pupilOffsetY = ghost.direction.row * pupilRadius / 2;

        // Left pupil
        ctx.beginPath();
        ctx.arc(
            ghost.position.x - eyeOffsetX + pupilOffsetX,
            ghost.position.y - eyeOffsetY + pupilOffsetY,
            pupilRadius,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Right pupil
        ctx.beginPath();
        ctx.arc(
            ghost.position.x + eyeOffsetX + pupilOffsetX,
            ghost.position.y - eyeOffsetY + pupilOffsetY,
            pupilRadius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    /**
     * Render frightened face (wavy mouth)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} ghost - Ghost object
     */
    function renderFrightenedFace(ctx, ghost) {
        ctx.strokeStyle = GHOST_CONFIG.COLORS.EYES;
        ctx.lineWidth = 2;

        // Wavy mouth
        ctx.beginPath();
        const mouthY = ghost.position.y + GHOST_CONFIG.RADIUS / 3;
        const mouthWidth = GHOST_CONFIG.RADIUS;

        for (let i = 0; i < 4; i++) {
            const x = ghost.position.x - mouthWidth + (i * mouthWidth / 2);
            const y = mouthY + (i % 2 === 0 ? 2 : -2);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }

    /**
     * Render all ghosts
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    function render(ctx) {
        ghosts.forEach(ghost => renderGhost(ctx, ghost));
    }

    /**
     * Get all ghosts (for debugging)
     * @returns {Array} Array of ghost objects
     */
    function getGhosts() {
        return ghosts;
    }

    /**
     * Reset ghosts to initial state
     */
    function reset() {
        init();
    }

    // Public API
    return {
        init,
        update,
        render,
        activatePowerMode,
        isPowerModeActive,
        getPowerModeTimer,
        checkPlayerCollisions,
        getGhosts,
        reset
    };
})();