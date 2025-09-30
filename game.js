// Game Module - Main game controller and loop
const Game = (function() {
    'use strict';

    let ctx = null;
    let running = false;
    let lastFrameTime = 0;
    let frameCount = 0;
    let fpsCounter = 0;
    let lastFpsUpdate = 0;

    /**
     * Initialize the game
     */
    function init() {
        try {
            console.log('Initializing Dot Hunter game...');

            // Initialize renderer
            ctx = RendererModule.init();

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
     * Handle keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeyPress(event) {
        // Prevent default arrow key behavior (scrolling)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }

        PlayerModule.handleInput(event.key);
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
            PlayerModule.die();
            // Reset ghosts as well
            GhostsModule.reset();
        } else if (collision.ghostEaten) {
            console.log('Player ate', collision.ghost.name);
            // Future: Add score increment
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

        // Render player
        PlayerModule.render(ctx);

        // Future: Render UI, effects, etc.
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