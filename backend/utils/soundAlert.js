const path = require("path");
const player = require("play-sound")({});

exports.playSoundAlert = () => {
  const alertSound = path.join(__dirname, "../assets/alert.mp3"); 
  player.play(alertSound, (err) => {
    if (err) console.error("Error playing sound:", err);
  });
};
