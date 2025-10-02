// Player Module - Handles player movement, controls, and collision
const PlayerModule = (function() {
    'use strict';

    const { CELL_SIZE, DIRECTIONS, PLAYER_SPEED, PLAYER_RADIUS, PLAYER_COLOR, PLAYER_START_POS, LOOKAHEAD_DISTANCE, ALIGNMENT_TOLERANCE, STRICT_ALIGNMENT_TOLERANCE } = CONFIG;

    // Player state
    let player = {
        position: {
            row: 0,
            col: 0,
            x: 0,
            y: 0
        },
        direction: {
            current: DIRECTIONS.NONE,
            next: null
        },
        speed: PLAYER_SPEED,
        moving: false,
        targetPosition: {
            row: 0,
            col: 0
        },
        animationState: {
            mouthAngle: 0,
            mouthDirection: 1 // 1 = opening, -1 = closing
        }
    };

    /**
     * Initialize player at starting position
     * @param {number} startRow - Starting row
     * @param {number} startCol - Starting column
     * @param {Object} initialDirection - Initial direction (optional)
     */
    function init(startRow = PLAYER_START_POS.row, startCol = PLAYER_START_POS.col, initialDirection = DIRECTIONS.NONE) {
        player.position.row = startRow;
        player.position.col = startCol;
        player.position.x = startCol * CELL_SIZE + CELL_SIZE / 2;
        player.position.y = startRow * CELL_SIZE + CELL_SIZE / 2;

        player.targetPosition.row = startRow;
        player.targetPosition.col = startCol;

        player.direction.current = initialDirection;
        player.direction.next = null;

        player.moving = false;

        console.log(`Player initialized at (${startRow}, ${startCol})`);
    }

    /**
     * Handle keyboard input for player movement
     * @param {string} key - Key pressed
     */
    function handleInput(key) {
        let direction = null;
        switch (key) {
            case 'ArrowUp':
                direction = DIRECTIONS.UP;
                break;
            case 'ArrowDown':
                direction = DIRECTIONS.DOWN;
                break;
            case 'ArrowLeft':
                direction = DIRECTIONS.LEFT;
                break;
            case 'ArrowRight':
                direction = DIRECTIONS.RIGHT;
                break;
        }
        if (direction) {
            player.direction.next = direction;
        }
    }

    /**
     * Check if target position has collision with wall
     * @param {number} targetRow - Target row
     * @param {number} targetCol - Target column
     * @returns {boolean} True if collision exists
     */
    function checkCollision(targetRow, targetCol) {
        return MapModule.isWall(targetRow, targetCol);
    }

    /**
     * Check if player is near target position (for early direction change detection)
     * @returns {boolean} True if near target position
     */
    function isNearTarget() {
        const targetX = player.targetPosition.col * CELL_SIZE + CELL_SIZE / 2;
        const targetY = player.targetPosition.row * CELL_SIZE + CELL_SIZE / 2;

        return Math.abs(player.position.x - targetX) < LOOKAHEAD_DISTANCE &&
               Math.abs(player.position.y - targetY) < LOOKAHEAD_DISTANCE;
    }

    /**
     * Check if player has reached target position (grid-aligned)
     * @returns {boolean} True if at target position
     */
    function isAtTarget() {
        const targetX = player.targetPosition.col * CELL_SIZE + CELL_SIZE / 2;
        const targetY = player.targetPosition.row * CELL_SIZE + CELL_SIZE / 2;

        return Math.abs(player.position.x - targetX) < ALIGNMENT_TOLERANCE &&
               Math.abs(player.position.y - targetY) < ALIGNMENT_TOLERANCE;
    }

    /**
     * Try to change direction (called when at grid center)
     */
    function tryChangeDirection() {
        // Check if there's a pending direction change
        if (player.direction.next === null) {
            return; // No input pending
        }

        // Validate the next cell is walkable
        const nextRow = player.position.row + player.direction.next.row;
        const nextCol = player.position.col + player.direction.next.col;

        if (!checkCollision(nextRow, nextCol)) {
            // Valid move - change direction
            player.direction.current = player.direction.next;
            player.targetPosition.row = nextRow;
            player.targetPosition.col = nextCol;
            player.moving = true;
        }

        // Always clear pending direction after attempting
        player.direction.next = null;
    }

    /**
     * Update player position and state
     * @param {number} deltaTime - Time since last update (ms)
     */
    function update(deltaTime) {
        // Update mouth animation
        updateAnimation(deltaTime);

        // Check if at target (reached grid center)
        if (isAtTarget()) {
            // Snap to exact grid position
            player.position.row = player.targetPosition.row;
            player.position.col = player.targetPosition.col;
            player.position.x = player.targetPosition.col * CELL_SIZE + CELL_SIZE / 2;
            player.position.y = player.targetPosition.row * CELL_SIZE + CELL_SIZE / 2;

            // Check for dot collision
            eatDot();

            // Try to change direction if player requested it
            tryChangeDirection();

            // If tryChangeDirection didn't set a new target, continue in current direction
            if (player.direction.current !== DIRECTIONS.NONE) {
                const nextRow = player.position.row + player.direction.current.row;
                const nextCol = player.position.col + player.direction.current.col;

                if (!checkCollision(nextRow, nextCol)) {
                    // Continue moving
                    player.targetPosition.row = nextRow;
                    player.targetPosition.col = nextCol;
                    player.moving = true;
                } else {
                    // Hit wall, stop moving
                    player.moving = false;
                }
            } else {
                player.moving = false;
            }
        }

        // Move towards target position
        if (player.moving) {
            const targetX = player.targetPosition.col * CELL_SIZE + CELL_SIZE / 2;
            const targetY = player.targetPosition.row * CELL_SIZE + CELL_SIZE / 2;

            const dx = targetX - player.position.x;
            const dy = targetY - player.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                // Calculate movement speed (pixels per frame)
                const moveSpeed = (player.speed * CELL_SIZE * deltaTime) / 1000;

                if (distance <= moveSpeed) {
                    // Close enough, snap to target
                    player.position.x = targetX;
                    player.position.y = targetY;
                } else {
                    // Interpolate movement
                    player.position.x += (dx / distance) * moveSpeed;
                    player.position.y += (dy / distance) * moveSpeed;
                }
            }
        }
    }

    /**
     * Update mouth animation state
     * @param {number} deltaTime - Time since last update (ms)
     */
    function updateAnimation(deltaTime) {
        if (player.moving) {
            // Animate mouth opening/closing
            const animationSpeed = 0.01; // Radians per millisecond
            player.animationState.mouthAngle += animationSpeed * deltaTime * player.animationState.mouthDirection;

            // Clamp mouth angle
            const maxMouthAngle = 0.4; // Max mouth opening (radians)
            if (player.animationState.mouthAngle >= maxMouthAngle) {
                player.animationState.mouthAngle = maxMouthAngle;
                player.animationState.mouthDirection = -1;
            } else if (player.animationState.mouthAngle <= 0) {
                player.animationState.mouthAngle = 0;
                player.animationState.mouthDirection = 1;
            }
        } else {
            // Close mouth when not moving
            player.animationState.mouthAngle = 0;
        }
    }

    /**
     * Check and consume dots at current position
     */
    function eatDot() {
        const eatenDot = DotsModule.eatDot(player.position.row, player.position.col);

        if (eatenDot) {
            if (eatenDot.type === CONFIG.DOT) {
                // Add score for dot
                if (typeof ScoreManager !== 'undefined') {
                    ScoreManager.addDotScore();
                }
            } else if (eatenDot.type === CONFIG.POWER_PELLET) {
                // Add score for power pellet
                if (typeof ScoreManager !== 'undefined') {
                    ScoreManager.addPowerPelletScore();
                }

                // Trigger ghost vulnerable state
                if (typeof GhostsModule !== 'undefined') {
                    GhostsModule.activatePowerMode();
                }
            }
        }
    }

    /**
     * Render player on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    function render(ctx) {
        ctx.fillStyle = PLAYER_COLOR;

        // Draw Pac-Man with mouth animation
        const directionAngle = player.direction.current.angle;
        const mouthAngle = player.animationState.mouthAngle;

        ctx.beginPath();
        ctx.arc(
            player.position.x,
            player.position.y,
            PLAYER_RADIUS,
            directionAngle + mouthAngle,
            directionAngle + (2 * Math.PI - mouthAngle)
        );
        ctx.lineTo(player.position.x, player.position.y);
        ctx.closePath();
        ctx.fill();

        // Debug: Draw target position (optional, can be removed)
        if (false) { // Set to true for debugging
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                player.targetPosition.col * CELL_SIZE,
                player.targetPosition.row * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    /**
     * Get current player position
     * @returns {Object} Position {row, col, x, y}
     */
    function getPosition() {
        return {
            row: player.position.row,
            col: player.position.col,
            x: player.position.x,
            y: player.position.y
        };
    }

    /**
     * Get current player state (for debugging)
     * @returns {Object} Player state
     */
    function getState() {
        return player;
    }

    /**
     * Handle player death
     */
    function die() {
        console.log('Player died!');
        // Reset to starting position
        init();
    }

    // Public API
    return {
        init,
        update,
        render,
        handleInput,
        getPosition,
        getState,
        die
    };
})();