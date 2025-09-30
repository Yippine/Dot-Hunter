// Lives Manager Module - Handles player lives and game over logic
const LivesManager = (function() {
    'use strict';

    // Lives constants (D)
    const INITIAL_LIVES = 3;

    // Lives state (D + S)
    let lives = INITIAL_LIVES;
    let deathTimestamp = 0;
    let respawnTimer = 0;
    const RESPAWN_DELAY = 2000; // 2 seconds delay after death

    /**
     * Initialize lives manager
     */
    function init() {
        lives = INITIAL_LIVES;
        deathTimestamp = 0;
        respawnTimer = 0;
        console.log(`LivesManager initialized: ${lives} lives`);
    }

    /**
     * Get current lives
     * @returns {number} Current lives
     */
    function getLives() {
        return lives;
    }

    /**
     * Check if player is dead (out of lives)
     * @returns {boolean} True if game over
     */
    function isGameOver() {
        return lives <= 0;
    }

    /**
     * Check if player is respawning
     * @returns {boolean} True if in respawn delay
     */
    function isRespawning() {
        return respawnTimer > 0;
    }

    /**
     * Get respawn timer
     * @returns {number} Remaining respawn time in milliseconds
     */
    function getRespawnTimer() {
        return Math.max(0, respawnTimer);
    }

    /**
     * Decrement lives (called when player is caught by ghost)
     * @returns {boolean} True if game over
     */
    function decrementLives() {
        if (lives > 0) {
            lives--;
            deathTimestamp = Date.now();
            respawnTimer = RESPAWN_DELAY;

            console.log(`Player died! Lives remaining: ${lives}`);

            if (isGameOver()) {
                console.log('Game Over - No lives remaining');
                return true;
            }
        }

        return false;
    }

    /**
     * Add extra life (for future power-ups or milestones)
     */
    function addLife() {
        lives++;
        console.log(`Extra life! Lives: ${lives}`);
    }

    /**
     * Update respawn timer
     * @param {number} deltaTime - Time since last update (ms)
     * @returns {boolean} True if respawn complete
     */
    function update(deltaTime) {
        if (respawnTimer > 0) {
            respawnTimer -= deltaTime;
            if (respawnTimer <= 0) {
                respawnTimer = 0;
                console.log('Respawn complete');
                return true;
            }
        }
        return false;
    }

    /**
     * Reset lives (for new game)
     */
    function reset() {
        init();
    }

    /**
     * Reset lives for new level (keep current lives)
     */
    function resetForNewLevel() {
        deathTimestamp = 0;
        respawnTimer = 0;
    }

    /**
     * Get death timestamp (for debugging)
     * @returns {number} Timestamp of last death
     */
    function getDeathTimestamp() {
        return deathTimestamp;
    }

    /**
     * Get lives statistics (for debugging)
     * @returns {Object} Lives stats
     */
    function getStats() {
        return {
            lives,
            isGameOver: isGameOver(),
            isRespawning: isRespawning(),
            respawnTimer,
            deathTimestamp
        };
    }

    // Public API
    return {
        INITIAL_LIVES,
        init,
        getLives,
        isGameOver,
        isRespawning,
        getRespawnTimer,
        decrementLives,
        addLife,
        update,
        reset,
        resetForNewLevel,
        getDeathTimestamp,
        getStats
    };
})();