// UI Renderer Module - Handles all UI rendering (HUD, messages, etc.)
const UIRenderer = (function() {
    'use strict';

    const { CELL_SIZE, MAP_WIDTH, MAP_HEIGHT } = CONFIG;

    // UI layout constants (D)
    const UI_CONFIG = {
        TOP_BAR_HEIGHT: 40,
        FONT_FAMILY: 'Arial, sans-serif',
        FONT_SIZE_LARGE: 24,
        FONT_SIZE_MEDIUM: 18,
        FONT_SIZE_SMALL: 14,
        COLORS: {
            TEXT: '#ffffff',
            TEXT_SHADOW: '#000000',
            BACKGROUND: 'rgba(0, 0, 0, 0.7)',
            LIFE_ACTIVE: '#ffff00',
            LIFE_INACTIVE: '#333333',
            READY: '#ffff00',
            GAME_OVER: '#ff0000',
            PAUSED: '#00ffff',
            LEVEL_COMPLETE: '#00ff00'
        },
        LIFE_ICON_SIZE: 12,
        LIFE_ICON_SPACING: 16,
        MESSAGE_PADDING: 20
    };

    /**
     * Render top HUD bar with score, level, and lives
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} score - Current score
     * @param {number} level - Current level
     * @param {number} lives - Current lives
     */
    function renderTopBar(ctx, score, level, lives) {
        const canvasWidth = MAP_WIDTH * CELL_SIZE;

        // Draw background bar
        ctx.fillStyle = UI_CONFIG.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, canvasWidth, UI_CONFIG.TOP_BAR_HEIGHT);

        // Setup text rendering
        ctx.font = `${UI_CONFIG.FONT_SIZE_MEDIUM}px ${UI_CONFIG.FONT_FAMILY}`;
        ctx.fillStyle = UI_CONFIG.COLORS.TEXT;
        ctx.textBaseline = 'middle';

        const textY = UI_CONFIG.TOP_BAR_HEIGHT / 2;

        // Render SCORE (left)
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${score}`, 10, textY);

        // Render LEVEL (center)
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${level}`, canvasWidth / 2, textY);

        // Render LIVES (right) with icons
        ctx.textAlign = 'right';
        const livesX = canvasWidth - 10;
        ctx.fillText('LIVES:', livesX - (UI_CONFIG.LIFE_ICON_SPACING * 3) - 10, textY);

        // Draw life icons (Pac-Man symbols)
        for (let i = 0; i < 3; i++) {
            const iconX = livesX - (UI_CONFIG.LIFE_ICON_SPACING * (2 - i));
            const iconY = textY;

            if (i < lives) {
                // Active life - yellow Pac-Man
                ctx.fillStyle = UI_CONFIG.COLORS.LIFE_ACTIVE;
            } else {
                // Lost life - gray
                ctx.fillStyle = UI_CONFIG.COLORS.LIFE_INACTIVE;
            }

            // Draw simplified Pac-Man icon
            ctx.beginPath();
            ctx.arc(iconX, iconY, UI_CONFIG.LIFE_ICON_SIZE, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.lineTo(iconX, iconY);
            ctx.closePath();
            ctx.fill();
        }
    }

    /**
     * Render center message with background
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} message - Message text
     * @param {string} color - Text color
     * @param {number} fontSize - Font size (optional)
     */
    function renderCenterMessage(ctx, message, color, fontSize = UI_CONFIG.FONT_SIZE_LARGE) {
        const canvasWidth = MAP_WIDTH * CELL_SIZE;
        const canvasHeight = MAP_HEIGHT * CELL_SIZE;

        // Setup text rendering
        ctx.font = `bold ${fontSize}px ${UI_CONFIG.FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerX = canvasWidth / 2;
        const centerY = (canvasHeight + UI_CONFIG.TOP_BAR_HEIGHT) / 2;

        // Measure text for background
        const textMetrics = ctx.measureText(message);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;

        // Draw background
        ctx.fillStyle = UI_CONFIG.COLORS.BACKGROUND;
        ctx.fillRect(
            centerX - textWidth / 2 - UI_CONFIG.MESSAGE_PADDING,
            centerY - textHeight / 2 - UI_CONFIG.MESSAGE_PADDING,
            textWidth + UI_CONFIG.MESSAGE_PADDING * 2,
            textHeight + UI_CONFIG.MESSAGE_PADDING * 2
        );

        // Draw text shadow for better visibility
        ctx.fillStyle = UI_CONFIG.COLORS.TEXT_SHADOW;
        ctx.fillText(message, centerX + 2, centerY + 2);

        // Draw main text
        ctx.fillStyle = color;
        ctx.fillText(message, centerX, centerY);
    }

    /**
     * Render READY message
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    function renderReady(ctx) {
        renderCenterMessage(ctx, 'READY!', UI_CONFIG.COLORS.READY);
    }

    /**
     * Render PAUSED message
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    function renderPaused(ctx) {
        renderCenterMessage(ctx, 'PAUSED', UI_CONFIG.COLORS.PAUSED);

        // Add instruction text
        const canvasWidth = MAP_WIDTH * CELL_SIZE;
        const canvasHeight = MAP_HEIGHT * CELL_SIZE;
        const centerX = canvasWidth / 2;
        const centerY = (canvasHeight + UI_CONFIG.TOP_BAR_HEIGHT) / 2;

        ctx.font = `${UI_CONFIG.FONT_SIZE_SMALL}px ${UI_CONFIG.FONT_FAMILY}`;
        ctx.fillStyle = UI_CONFIG.COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.fillText('Press P to resume', centerX, centerY + 40);
    }

    /**
     * Render GAME OVER message
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} finalScore - Final score
     */
    function renderGameOver(ctx, finalScore) {
        renderCenterMessage(ctx, 'GAME OVER', UI_CONFIG.COLORS.GAME_OVER);

        // Add final score and restart instruction
        const canvasWidth = MAP_WIDTH * CELL_SIZE;
        const canvasHeight = MAP_HEIGHT * CELL_SIZE;
        const centerX = canvasWidth / 2;
        const centerY = (canvasHeight + UI_CONFIG.TOP_BAR_HEIGHT) / 2;

        ctx.font = `${UI_CONFIG.FONT_SIZE_MEDIUM}px ${UI_CONFIG.FONT_FAMILY}`;
        ctx.fillStyle = UI_CONFIG.COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.fillText(`Final Score: ${finalScore}`, centerX, centerY + 40);

        ctx.font = `${UI_CONFIG.FONT_SIZE_SMALL}px ${UI_CONFIG.FONT_FAMILY}`;
        ctx.fillText('Press ENTER to restart', centerX, centerY + 70);
    }

    /**
     * Render LEVEL COMPLETE message
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} level - Completed level
     */
    function renderLevelComplete(ctx, level) {
        renderCenterMessage(ctx, `LEVEL ${level} COMPLETE!`, UI_CONFIG.COLORS.LEVEL_COMPLETE);

        // Add instruction
        const canvasWidth = MAP_WIDTH * CELL_SIZE;
        const canvasHeight = MAP_HEIGHT * CELL_SIZE;
        const centerX = canvasWidth / 2;
        const centerY = (canvasHeight + UI_CONFIG.TOP_BAR_HEIGHT) / 2;

        ctx.font = `${UI_CONFIG.FONT_SIZE_SMALL}px ${UI_CONFIG.FONT_FAMILY}`;
        ctx.fillStyle = UI_CONFIG.COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.fillText('Get ready for next level...', centerX, centerY + 40);
    }

    /**
     * Render ghost score popup (when ghost is eaten)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} score - Ghost score
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    function renderGhostScore(ctx, score, x, y) {
        ctx.font = `bold ${UI_CONFIG.FONT_SIZE_SMALL}px ${UI_CONFIG.FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw text shadow
        ctx.fillStyle = UI_CONFIG.COLORS.TEXT_SHADOW;
        ctx.fillText(`${score}`, x + 1, y + 1);

        // Draw main text
        ctx.fillStyle = UI_CONFIG.COLORS.LEVEL_COMPLETE;
        ctx.fillText(`${score}`, x, y);
    }

    /**
     * Render full UI based on game state
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} gameState - Complete game state
     */
    function render(ctx, gameState) {
        // Always render top bar
        renderTopBar(ctx, gameState.score, gameState.level, gameState.lives);

        // Render state-specific messages
        switch (gameState.state) {
            case 'ready':
                renderReady(ctx);
                break;
            case 'paused':
                renderPaused(ctx);
                break;
            case 'game_over':
                renderGameOver(ctx, gameState.score);
                break;
            case 'level_complete':
                renderLevelComplete(ctx, gameState.level);
                break;
            case 'playing':
                // No overlay during normal play
                break;
        }

        // Render ghost score popup if recently eaten
        if (gameState.lastGhostScore && gameState.ghostScorePosition) {
            renderGhostScore(
                ctx,
                gameState.lastGhostScore,
                gameState.ghostScorePosition.x,
                gameState.ghostScorePosition.y
            );
        }
    }

    /**
     * Get UI configuration (for external use)
     * @returns {Object} UI configuration
     */
    function getConfig() {
        return UI_CONFIG;
    }

    // Public API
    return {
        renderTopBar,
        renderCenterMessage,
        renderReady,
        renderPaused,
        renderGameOver,
        renderLevelComplete,
        renderGhostScore,
        render,
        getConfig
    };
})();