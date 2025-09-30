// Renderer Module - Manages canvas rendering context
const RendererModule = (function() {
    'use strict';

    let canvas = null;
    let ctx = null;

    /**
     * Initialize canvas and get rendering context
     * @returns {CanvasRenderingContext2D} Canvas 2D context
     */
    function init() {
        canvas = document.getElementById('gameCanvas');

        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        // Set canvas dimensions based on map size
        canvas.width = CONFIG.MAP_WIDTH * CONFIG.CELL_SIZE;
        canvas.height = CONFIG.MAP_HEIGHT * CONFIG.CELL_SIZE;

        ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Unable to get 2D context');
        }

        console.log(`Canvas initialized: ${canvas.width}x${canvas.height}`);

        return ctx;
    }

    /**
     * Clear the entire canvas
     */
    function clear() {
        if (!ctx) return;

        ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Get the canvas context
     * @returns {CanvasRenderingContext2D} Canvas 2D context
     */
    function getContext() {
        return ctx;
    }

    /**
     * Get canvas dimensions
     * @returns {Object} Width and height
     */
    function getDimensions() {
        return {
            width: canvas ? canvas.width : 0,
            height: canvas ? canvas.height : 0
        };
    }

    // Public API
    return {
        init,
        clear,
        getContext,
        getDimensions
    };
})();