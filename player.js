// Player Module - Handles player movement, controls, and collision
const PlayerModule = (function() {
    'use strict';

    const { CELL_SIZE, DIRECTIONS, PLAYER_SPEED, PLAYER_RADIUS, PLAYER_COLOR, PLAYER_START_POS } = CONFIG;

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
            next: DIRECTIONS.NONE
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
     */
    function init(startRow = PLAYER_START_POS.row, startCol = PLAYER_START_POS.col) {
        player.position.row = startRow;
        player.position.col = startCol;
        player.position.x = startCol * CELL_SIZE + CELL_SIZE / 2;
        player.position.y = startRow * CELL_SIZE + CELL_SIZE / 2;

        player.targetPosition.row = startRow;
        player.targetPosition.col = startCol;

        player.direction.current = DIRECTIONS.NONE;
        player.direction.next = DIRECTIONS.NONE;

        player.moving = false;

        console.log(`Player initialized at (${startRow}, ${startCol})`);
    }

    /**
     * Handle keyboard input for player movement
     * @param {string} key - Key pressed
     */
    function handleInput(key) {
        switch (key) {
            case 'ArrowUp':
                player.direction.next = DIRECTIONS.UP;
                break;
            case 'ArrowDown':
                player.direction.next = DIRECTIONS.DOWN;
                break;
            case 'ArrowLeft':
                player.direction.next = DIRECTIONS.LEFT;
                break;
            case 'ArrowRight':
                player.direction.next = DIRECTIONS.RIGHT;
                break;
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
     * Check if player has reached target position (grid-aligned)
     * @returns {boolean} True if at target position
     */
    function isAtTarget() {
        const tolerance = 1; // Pixel tolerance for alignment
        const targetX = player.targetPosition.col * CELL_SIZE + CELL_SIZE / 2;
        const targetY = player.targetPosition.row * CELL_SIZE + CELL_SIZE / 2;

        return Math.abs(player.position.x - targetX) < tolerance &&
               Math.abs(player.position.y - targetY) < tolerance;
    }

    /**
     * Try to change direction (smooth turning)
     */
    function tryChangeDirection() {
        if (player.direction.next === DIRECTIONS.NONE) {
            return;
        }

        // Check if we're at grid alignment
        if (!isAtTarget()) {
            return; // Wait until aligned to change direction
        }

        // Try to move in the next direction
        const nextRow = player.position.row + player.direction.next.row;
        const nextCol = player.position.col + player.direction.next.col;

        if (!checkCollision(nextRow, nextCol)) {
            // Valid move, change direction
            player.direction.current = player.direction.next;
            player.targetPosition.row = nextRow;
            player.targetPosition.col = nextCol;
            player.moving = true;
        }

        // Clear next direction after attempting
        player.direction.next = DIRECTIONS.NONE;
    }

    /**
     * Update player position and state
     * @param {number} deltaTime - Time since last update (ms)
     */
    function update(deltaTime) {
        // Update mouth animation
        updateAnimation(deltaTime);

        // Try to change direction if requested
        tryChangeDirection();

        // Check if at target and not moving
        if (isAtTarget()) {
            // Snap to exact grid position
            player.position.row = player.targetPosition.row;
            player.position.col = player.targetPosition.col;
            player.position.x = player.targetPosition.col * CELL_SIZE + CELL_SIZE / 2;
            player.position.y = player.targetPosition.row * CELL_SIZE + CELL_SIZE / 2;

            // Check for dot collision
            eatDot();

            // Try to continue moving in current direction
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
                console.log('Ate a dot!');
                // Future: Add score increment
            } else if (eatenDot.type === CONFIG.POWER_PELLET) {
                console.log('Ate a power pellet!');
                // Future: Trigger ghost vulnerable state
            }

            // Check if all dots eaten
            const remainingDots = DotsModule.getActiveDotCount();
            console.log(`Remaining dots: ${remainingDots}`);

            if (remainingDots === 0) {
                console.log('Level complete!');
                // Future: Trigger level complete state
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
     * Get current player state (for debugging)
     * @returns {Object} Player state
     */
    function getState() {
        return player;
    }

    // Public API
    return {
        init,
        update,
        render,
        handleInput,
        getState
    };
})();