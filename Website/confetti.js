/*Confetti*/
// Set Confetti Duration 
var duration = 1 * 1000;
var end = Date.now() + duration;

(function frame() {
  // Launch Confetti From the Left
  confetti({
    shapes: ['circle'],
    colors: ['#d43283', '#d43253', '#8d52cd', '#b95892', '#ffb6f0', '#7f75aa', '#fced6c', '#ebdb49', '#ef9746', '#ef4654', '#e5aacf'],
    particleCount: 12,
    angle: 60,
    spread: 1000,
    origin: { x: 0, y: 0 }
  });

  // Launch Confetti From the Right
  confetti({
    shapes: ['circle'],
    colors: ['#d43283', '#d43253', '#8d52cd', '#b95892', '#ffb6f0', '#7f75aa', '#fced6c', '#ebdb49', '#ef9746', '#ef4654', '#e5aacf'],
    particleCount: 12,
    angle: 120,
    spread: 1000,
    origin: { x: 1, y: 0 }
  });

  // Keep Launching Confetti Until Time Is Up
  if (Date.now() < end) {
    requestAnimationFrame(frame);
  }
}());