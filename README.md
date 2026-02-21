# Vändtia- game 

**URL**: https://vad-tians-game.lovable.app/

## Add Örjan win/loss pictures

To use your own pictures in the end-game modal:

1. Save your images in the `public/` folder with these exact names:
   - `public/orjan-winning.jpg` (shown when Örjan wins)
   - `public/orjan-losing.jpg` (shown when Örjan loses)
2. Restart `npm run dev` if it is already running.
3. Play a single-player game against Örjan and finish the game to verify both outcomes.

Notes:
- `.jpg` is used first. If a `.jpg` is missing, the app falls back to existing SVG placeholders.
- Recommended image ratio is around `16:9` (for example `960x540`) for best fit.
