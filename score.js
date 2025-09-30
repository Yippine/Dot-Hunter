// Score Manager Module - Handles scoring and combo system
const ScoreManager = (function() {
    'use strict';

    // Score constants (D)
    const SCORE_VALUES = {
        DOT: 10,
        POWER_PELLET: 50,
        GHOST_BASE: 200
    };

    // Score state (D + S)
    let score = 0;
    let level = 1;
    let ghostComboCount = 0; // Track consecutive ghost eats in power mode
    let lastGhostScore = 0;

    /**
     * Initialize score manager
     */
    function init() {
        score = 0;
        level = 1;
        ghostComboCount = 0;
        lastGhostScore = 0;
        console.log('ScoreManager initialized');
    }

    /**
     * Get current score
     * @returns {number} Current score
     */
    function getScore() {
        return score;
    }

    /**
     * Get current level
     * @returns {number} Current level
     */
    function getLevel() {
        return level;
    }

    /**
     * Add score for eating a dot
     * @returns {number} Score added
     */
    function addDotScore() {
        const points = SCORE_VALUES.DOT;
        score += points;
        console.log(`+${points} (Dot) | Score: ${score}`);
        return points;
    }

    /**
     * Add score for eating a power pellet
     * @returns {number} Score added
     */
    function addPowerPelletScore() {
        const points = SCORE_VALUES.POWER_PELLET;
        score += points;
        console.log(`+${points} (Power Pellet) | Score: ${score}`);

        // Reset ghost combo when power pellet is eaten
        ghostComboCount = 0;
        return points;
    }

    /**
     * Add score for eating a ghost
     * Score doubles for each ghost: 200, 400, 800, 1600
     * @returns {number} Score added
     */
    function addGhostScore() {
        // Calculate score: 200 * 2^comboCount
        const points = SCORE_VALUES.GHOST_BASE * Math.pow(2, ghostComboCount);
        score += points;
        lastGhostScore = points;
        ghostComboCount++;

        console.log(`+${points} (Ghost x${ghostComboCount}) | Score: ${score}`);
        return points;
    }

    /**
     * Get last ghost score (for UI display)
     * @returns {number} Last ghost score
     */
    function getLastGhostScore() {
        return lastGhostScore;
    }

    /**
     * Get current ghost combo count
     * @returns {number} Combo count
     */
    function getGhostCombo() {
        return ghostComboCount;
    }

    /**
     * Reset ghost combo (called when power mode ends)
     */
    function resetGhostCombo() {
        ghostComboCount = 0;
        lastGhostScore = 0;
        console.log('Ghost combo reset');
    }

    /**
     * Increment level
     */
    function nextLevel() {
        level++;
        console.log(`Level up! Now at level ${level}`);
    }

    /**
     * Reset score (for new game)
     */
    function resetScore() {
        score = 0;
        ghostComboCount = 0;
        lastGhostScore = 0;
        console.log('Score reset to 0');
    }

    /**
     * Reset for new level (keep score, reset combo)
     */
    function resetForNewLevel() {
        ghostComboCount = 0;
        lastGhostScore = 0;
        nextLevel();
    }

    /**
     * Full reset (for new game)
     */
    function reset() {
        init();
    }

    /**
     * Get score statistics (for debugging)
     * @returns {Object} Score stats
     */
    function getStats() {
        return {
            score,
            level,
            ghostComboCount,
            lastGhostScore
        };
    }

    // Public API
    return {
        SCORE_VALUES,
        init,
        getScore,
        getLevel,
        addDotScore,
        addPowerPelletScore,
        addGhostScore,
        getLastGhostScore,
        getGhostCombo,
        resetGhostCombo,
        nextLevel,
        resetScore,
        resetForNewLevel,
        reset,
        getStats
    };
})();