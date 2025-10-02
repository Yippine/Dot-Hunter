// State Manager Module - Handles game state transitions and management
const StateManager = (function() {
    'use strict';

    // Game states enum
    const GAME_STATE = {
        START_SCREEN: 'start_screen',
        READY: 'ready',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over',
        LEVEL_COMPLETE: 'level_complete'
    };

    // State data (D)
    let currentState = GAME_STATE.READY;
    let previousState = null;
    let stateHistory = [];
    let readyTimer = 0;
    const READY_DURATION = 3000; // 3 seconds

    /**
     * Initialize state manager
     */
    function init() {
        currentState = GAME_STATE.START_SCREEN;
        previousState = null;
        stateHistory = [GAME_STATE.START_SCREEN];
        readyTimer = READY_DURATION;
        console.log('StateManager initialized:', currentState);
    }

    /**
     * Get current state
     * @returns {string} Current game state
     */
    function getState() {
        return currentState;
    }

    /**
     * Check if game is in specific state
     * @param {string} state - State to check
     * @returns {boolean} True if in specified state
     */
    function isState(state) {
        return currentState === state;
    }

    /**
     * Check if game is actively playing (not paused/ready/game over)
     * @returns {boolean} True if actively playing
     */
    function isPlaying() {
        return currentState === GAME_STATE.PLAYING;
    }

    /**
     * Check if game can accept input
     * @returns {boolean} True if input is accepted
     */
    function canAcceptInput() {
        return currentState === GAME_STATE.PLAYING || currentState === GAME_STATE.PAUSED;
    }

    /**
     * Validate state transition
     * @param {string} from - Current state
     * @param {string} to - Target state
     * @returns {boolean} True if transition is valid
     */
    function validateTransition(from, to) {
        // Define valid transitions
        const validTransitions = {
            [GAME_STATE.START_SCREEN]: [GAME_STATE.PLAYING],
            [GAME_STATE.READY]: [GAME_STATE.PLAYING],
            [GAME_STATE.PLAYING]: [GAME_STATE.PAUSED, GAME_STATE.GAME_OVER, GAME_STATE.LEVEL_COMPLETE],
            [GAME_STATE.PAUSED]: [GAME_STATE.PLAYING, GAME_STATE.GAME_OVER],
            [GAME_STATE.GAME_OVER]: [GAME_STATE.READY],
            [GAME_STATE.LEVEL_COMPLETE]: [GAME_STATE.READY]
        };

        return validTransitions[from] && validTransitions[from].includes(to);
    }

    /**
     * Transition to new state
     * @param {string} newState - Target state
     * @returns {boolean} True if transition succeeded
     */
    function transitionTo(newState) {
        if (!validateTransition(currentState, newState)) {
            console.warn(`Invalid state transition: ${currentState} -> ${newState}`);
            return false;
        }

        previousState = currentState;
        currentState = newState;
        stateHistory.push(newState);

        console.log(`State transition: ${previousState} -> ${currentState}`);

        // Handle state entry logic
        handleStateEntry(newState);

        return true;
    }

    /**
     * Handle state entry logic
     * @param {string} state - Entered state
     */
    function handleStateEntry(state) {
        switch (state) {
            case GAME_STATE.READY:
                readyTimer = READY_DURATION;
                if (typeof PlayerModule !== 'undefined') {
                    PlayerModule.init(CONFIG.PLAYER_START_POS.row, CONFIG.PLAYER_START_POS.col, CONFIG.DIRECTIONS.LEFT);
                }
                break;
            case GAME_STATE.PLAYING:
                readyTimer = 0;
                break;
            case GAME_STATE.PAUSED:
                break;
            case GAME_STATE.GAME_OVER:
                break;
            case GAME_STATE.LEVEL_COMPLETE:
                break;
        }
    }

    /**
     * Toggle pause state
     * @returns {boolean} True if pause toggled successfully
     */
    function togglePause() {
        if (currentState === GAME_STATE.PLAYING) {
            return transitionTo(GAME_STATE.PAUSED);
        } else if (currentState === GAME_STATE.PAUSED) {
            return transitionTo(GAME_STATE.PLAYING);
        }
        return false;
    }

    /**
     * Handle keyboard input
     * @param {string} key - Key pressed
     * @returns {boolean} True if input was handled
     */
    function handleInput(key) {
        // Handle START_SCREEN - any key starts game immediately
        if (currentState === GAME_STATE.START_SCREEN) {
            // Set initial direction before starting
            if (typeof PlayerModule !== 'undefined') {
                PlayerModule.init(
                    CONFIG.PLAYER_START_POS.row,
                    CONFIG.PLAYER_START_POS.col,
                    CONFIG.DIRECTIONS.LEFT
                );
            }
            transitionTo(GAME_STATE.PLAYING);
            return true;
        }

        switch (key) {
            case 'p':
            case 'P':
                if (currentState === GAME_STATE.PLAYING || currentState === GAME_STATE.PAUSED) {
                    togglePause();
                    return true;
                }
                break;
            case 'Enter':
                if (currentState === GAME_STATE.GAME_OVER) {
                    transitionTo(GAME_STATE.READY);
                    return true;
                }
                break;
        }
        return false;
    }

    /**
     * Update state logic
     * @param {number} deltaTime - Time since last update (ms)
     */
    function update(deltaTime) {
        // Handle READY countdown
        if (currentState === GAME_STATE.READY) {
            readyTimer -= deltaTime;
            if (readyTimer <= 0) {
                transitionTo(GAME_STATE.PLAYING);
            }
        }
    }

    /**
     * Get ready timer (for UI display)
     * @returns {number} Remaining ready time in milliseconds
     */
    function getReadyTimer() {
        return Math.max(0, readyTimer);
    }

    /**
     * Trigger game over
     */
    function triggerGameOver() {
        transitionTo(GAME_STATE.GAME_OVER);
    }

    /**
     * Trigger level complete
     */
    function triggerLevelComplete() {
        transitionTo(GAME_STATE.LEVEL_COMPLETE);
    }

    /**
     * Reset state manager
     */
    function reset() {
        init();
    }

    /**
     * Get state history (for debugging)
     * @returns {Array} State history
     */
    function getHistory() {
        return [...stateHistory];
    }

    // Public API
    return {
        GAME_STATE,
        init,
        getState,
        isState,
        isPlaying,
        canAcceptInput,
        transitionTo,
        togglePause,
        handleInput,
        update,
        getReadyTimer,
        triggerGameOver,
        triggerLevelComplete,
        reset,
        getHistory
    };
})();