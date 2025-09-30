// Canvas Scaler Module - Responsive canvas scaling system
const CanvasScaler = (function() {
    'use strict';

    const BASE_WIDTH = 560;
    const BASE_HEIGHT = 620;
    const MIN_SCALE = 1.0;
    const MAX_SCALE = 2.0;
    const VIEWPORT_WIDTH_FACTOR = 0.9;
    const VIEWPORT_HEIGHT_FACTOR = 0.85;
    const RESIZE_THROTTLE_MS = 100;

    let canvas = null;
    let resizeTimer = null;

    /**
     * Calculate optimal scale based on viewport size
     * Formula: max(1.0, min(viewport×0.9/560, viewport×0.85/620, 2.0))
     * @returns {number} Scale value
     */
    function calculateScale() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate scale based on viewport dimensions
        const widthScale = (viewportWidth * VIEWPORT_WIDTH_FACTOR) / BASE_WIDTH;
        const heightScale = (viewportHeight * VIEWPORT_HEIGHT_FACTOR) / BASE_HEIGHT;

        // Take the minimum of both scales to ensure fit
        let scale = Math.min(widthScale, heightScale);

        // Apply min/max constraints
        scale = Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE));

        return scale;
    }

    /**
     * Apply scale to canvas via CSS custom property
     * @param {number} scale - Scale value to apply
     */
    function applyScale(scale) {
        if (!canvas) {
            console.error('CanvasScaler: Canvas not initialized');
            return;
        }

        // Set CSS custom property for transform scale
        canvas.style.setProperty('--canvas-scale', scale);

        console.log(`CanvasScaler: Applied scale ${scale.toFixed(3)}`);
    }

    /**
     * Handle window resize with throttling
     * Throttle: 100ms delay to avoid excessive recalculations
     */
    function handleResize() {
        // Clear existing timer
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }

        // Set new timer for throttled resize
        resizeTimer = setTimeout(() => {
            const scale = calculateScale();
            applyScale(scale);
        }, RESIZE_THROTTLE_MS);
    }

    /**
     * Initialize canvas scaler system
     * @param {HTMLCanvasElement} canvasElement - Canvas element to scale
     */
    function initialize(canvasElement) {
        if (!canvasElement) {
            console.error('CanvasScaler: Invalid canvas element');
            return;
        }

        canvas = canvasElement;

        // Calculate and apply initial scale
        const initialScale = calculateScale();
        applyScale(initialScale);

        // Attach resize listener
        window.addEventListener('resize', handleResize);

        console.log('CanvasScaler: Initialized successfully');
    }

    /**
     * Cleanup scaler (for testing or reset)
     */
    function cleanup() {
        window.removeEventListener('resize', handleResize);
        if (resizeTimer) {
            clearTimeout(resizeTimer);
            resizeTimer = null;
        }
        canvas = null;
        console.log('CanvasScaler: Cleaned up');
    }

    // Public API
    return {
        initialize,
        cleanup,
        calculateScale,
        applyScale
    };
})();