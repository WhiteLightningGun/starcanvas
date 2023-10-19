/**
 * clears canvas and sets a certain colour
 * @param ref ref is the useRef which comes from use_canvas.js
 * @param colour colour is a hex string, here used to set the background colour
 */

function clearCanvas(ref, colour) {
  const canvas = ref.current;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = colour;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

export default clearCanvas;
