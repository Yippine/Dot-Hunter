// Game Module - Main game controller and loop
const Game = (function() {
    'use strict';

    let ctx = null;
    let running = false;
    let lastFrameTime = 0;
    let frameCount = 0;
    let fpsCounter = 0;
    let lastFpsUpdate = 0;
    let ghostScorePopup = null; // For displaying ghost score popup

    /**
     * Initialize the game
     */
    function init() {
        try {
            console.log('Initializing Dot Hunter game...');

            // Initialize renderer
            ctx = RendererModule.init();

            // Initialize canvas scaler for responsive display
            const canvas = RendererModule.getCanvas();
            CanvasScaler.initialize(canvas);

            // Initialize game state management
            StateManager.init();
            ScoreManager.init();
            LivesManager.init();

            // Initialize dots from map
            DotsModule.initDots();

            // Initialize player at starting position
            PlayerModule.init();

            // Initialize ghosts
            GhostsModule.init();

            // Setup keyboard controls
            window.addEventListener('keydown', handleKeyPress);

            console.log('Game initialized successfully');

            // Start the game loop
            start();
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }

    /**
     * Reset game for new game (after game over)
     */
    function resetGame() {
        // Reset all managers
        StateManager.reset();
        ScoreManager.reset();
        LivesManager.reset();

        // Reset game objects
        DotsModule.resetDots();
        PlayerModule.init();
        GhostsModule.reset();

        ghostScorePopup = null;

        console.log('Game reset for new game');
    }

    /**
     * Reset for next level
     */
    function resetLevel() {
        // Keep score and lives, reset level
        ScoreManager.resetForNewLevel();
        LivesManager.resetForNewLevel();

        // Reset game objects
        DotsModule.resetDots();
        PlayerModule.init();
        GhostsModule.reset();

        // Transition back to ready state
        StateManager.transitionTo(StateManager.GAME_STATE.READY);

        ghostScorePopup = null;

        console.log('Level reset for next level');
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeyPress(event) {
        // Prevent default arrow key behavior (scrolling)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }

        // Handle state-specific input (pause, restart)
        const stateHandled = StateManager.handleInput(event.key);

        // If state changed to READY from GAME_OVER, reset game
        if (stateHandled && StateManager.isState(StateManager.GAME_STATE.READY)) {
            if (LivesManager.isGameOver()) {
                resetGame();
            }
        }

        // Only allow player input during active play
        if (StateManager.isPlaying()) {
            PlayerModule.handleInput(event.key);
        }
    }

    /**
     * Start the game loop
     */
    function start() {
        if (running) return;

        running = true;
        lastFrameTime = performance.now();
        lastFpsUpdate = performance.now();

        console.log('Game loop started');

        // Start the game loop
        requestAnimationFrame(gameLoop);
    }

    /**
     * Stop the game loop
     */
    function stop() {
        running = false;
        console.log('Game loop stopped');
    }

    /**
     * Main game loop
     * @param {number} currentTime - Current timestamp
     */
    function gameLoop(currentTime) {
        if (!running) return;

        // Calculate delta time
        const deltaTime = currentTime - lastFrameTime;

        // FPS control: Only update if enough time has passed
        if (deltaTime >= CONFIG.FRAME_INTERVAL) {
            // Update game state
            update(deltaTime);

            // Render everything
            render();

            // Update frame time
            lastFrameTime = currentTime - (deltaTime % CONFIG.FRAME_INTERVAL);

            // FPS counting
            frameCount++;
        }

        // Update FPS counter every second
        if (currentTime - lastFpsUpdate >= 1000) {
            fpsCounter = frameCount;
            frameCount = 0;
            lastFpsUpdate = currentTime;

            // Log FPS for monitoring
            if (fpsCounter < 58) {
                console.warn(`Low FPS detected: ${fpsCounter}`);
            }
        }

        // Continue the loop
        requestAnimationFrame(gameLoop);
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time since last update
     */
    function update(deltaTime) {
        // Update state manager (handles READY timer, etc.)
        StateManager.update(deltaTime);

        // Update lives manager (respawn timer)
        const respawnComplete = LivesManager.update(deltaTime);

        // Only update gameplay if in PLAYING state
        if (!StateManager.isPlaying()) {
            return;
        }

        // Skip gameplay updates during respawn delay
        if (LivesManager.isRespawning()) {
            return;
        }

        // Update player movement and state
        PlayerModule.update(deltaTime);

        // Get player position for ghost AI and collision detection
        const playerPos = PlayerModule.getPosition();

        // Update ghost AI and movement
        GhostsModule.update(deltaTime, playerPos);

        // Check collisions between player and ghosts
        const collision = GhostsModule.checkPlayerCollisions(playerPos);

        if (collision.playerEaten) {
            console.log('Player was caught by', collision.ghost.name);

            // Decrement lives
            const gameOver = LivesManager.decrementLives();

            if (gameOver) {
                // Trigger game over
                StateManager.triggerGameOver();
            } else {
                // Reset player and ghosts for respawn
                PlayerModule.die();
                GhostsModule.reset();
            }
        } else if (collision.ghostEaten) {
            console.log('Player ate', collision.ghost.name);

            // Add score for eating ghost
            const points = ScoreManager.addGhostScore();

            // Show score popup at ghost position
            ghostScorePopup = {
                score: points,
                x: collision.ghost.position.x,
                y: collision.ghost.position.y,
                timestamp: Date.now(),
                duration: 1000 // Show for 1 second
            };
        }

        // Check for level completion
        checkLevelComplete();

        // Update ghost score popup
        updateGhostScorePopup();
    }

    /**
     * Check if level is complete (all dots eaten)
     */
    function checkLevelComplete() {
        const remainingDots = DotsModule.getActiveDotCount();

        if (remainingDots === 0) {
            console.log('Level complete!');
            StateManager.triggerLevelComplete();

            // Delay level reset
            setTimeout(() => {
                resetLevel();
            }, 3000); // 3 second delay
        }
    }

    /**
     * Update ghost score popup timer
     */
    function updateGhostScorePopup() {
        if (ghostScorePopup) {
            const elapsed = Date.now() - ghostScorePopup.timestamp;
            if (elapsed > ghostScorePopup.duration) {
                ghostScorePopup = null;
            }
        }
    }

    /**
     * Render all game elements
     */
    function render() {
        // Clear canvas
        RendererModule.clear();

        // Render map walls
        MapModule.renderMap(ctx);

        // Render dots and power pellets
        DotsModule.renderDots(ctx);

        // Render ghosts (before player for proper layering)
        GhostsModule.render(ctx);

        // Render player (only if not in game over state)
        if (!StateManager.isState(StateManager.GAME_STATE.GAME_OVER)) {
            PlayerModule.render(ctx);
        }

        // Render UI (top bar, messages, etc.)
        const gameState = {
            state: StateManager.getState(),
            score: ScoreManager.getScore(),
            level: ScoreManager.getLevel(),
            lives: LivesManager.getLives(),
            lastGhostScore: ghostScorePopup ? ghostScorePopup.score : null,
            ghostScorePosition: ghostScorePopup ? { x: ghostScorePopup.x, y: ghostScorePopup.y } : null
        };

        UIRenderer.render(ctx, gameState);
    }

    /**
     * Get current FPS
     * @returns {number} Current FPS
     */
    function getFPS() {
        return fpsCounter;
    }

    /**
     * Check if game is running
     * @returns {boolean} Running state
     */
    function isRunning() {
        return running;
    }

    // Public API
    return {
        init,
        start,
        stop,
        getFPS,
        isRunning
    };
})();

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Game.init);
} else {
    // DOM already loaded
    Game.init();
}