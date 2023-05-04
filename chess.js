// https://nulltale.itch.io/chess
// https://souptonic.itch.io/souptonic-sfx-pack-1-ui-sounds

const spriteSheet = new Image();
spriteSheet.src = "chess.png";

const moveAudio = new Audio("move.mp3");
moveAudio.volume = 0.15;

const mouse = { x: 0, y: 0, down: false };

const canvas = document.createElement("canvas");
canvas.width = 320;
canvas.height = 240;
canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
});
canvas.addEventListener("mousedown", () => (mouse.down = true));
canvas.addEventListener("mouseup", () => (mouse.down = false));
canvas.addEventListener("mouseleave", () => (mouse.down = false));
document.body.appendChild(canvas);

let previousTimeStamp = null;

const ctx = canvas.getContext("2d");

const board = [
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♟︎", "♟︎", "♟︎", "♟︎", "♟︎", "♟︎", "♟︎", "♟︎"],
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
];

let selectedPiece = null;
let selectedPieceOffsetX = 0;
let selectedPieceOffsetY = 0;

requestAnimationFrame(render);

function render(timestamp) {
  const elapsed = (timestamp - (previousTimeStamp || timestamp)) / 1000;
  previousTimeStamp = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBoard();

  const mouseX = Math.floor(mouse.x * (canvas.width / canvas.offsetWidth));
  const mouseY = Math.floor(mouse.y * (canvas.height / canvas.offsetHeight));

  if (mouseX >= 96 && mouseX < 96 + 128 && mouseY >= 60 && mouseY < 60 + 120) {
    const tileX = Math.floor(mouseX / 16) * 16;
    const tileY = Math.floor(mouseY / 15) * 15;

    ctx.strokeStyle = "gold";
    ctx.beginPath();
    ctx.rect(tileX, tileY, 16, 15);
    ctx.stroke();

    const i = Math.floor((mouseY - 60) / 15);
    const j = Math.floor((mouseX - 96) / 16);

    if (mouse.down && !selectedPiece) {
      selectedPiece = board[i][j];
      selectedPieceOffsetX = tileX - mouseX;
      selectedPieceOffsetY = tileY - mouseY - 22;
      board[i][j] = "";
    } else if (!mouse.down && selectedPiece) {
      board[i][j] = selectedPiece;
      selectedPiece = null;
      moveAudio.currentTime = 0;
      moveAudio.play();
    }
  }

  drawPieces();
  // drawButton("reset", 135, 2);

  if (mouse.down && selectedPiece) {
    drawPiece(
      selectedPiece,
      mouseX + selectedPieceOffsetX,
      mouseY + selectedPieceOffsetY,
      22
    );
  } else if (!mouse.down && selectedPiece) {
    selectedPiece = null;
  }

  drawFps(elapsed);

  requestAnimationFrame(render);
}

function drawBoard() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const sx = 51;
      const sy = (i + j) % 2 === 0 ? 183 : 200;
      const dx = 96 + j * 16;
      const dy = 60 + i * 15;
      ctx.drawImage(spriteSheet, sx, sy, 16, 15, dx, dy, 16, 15);
    }
  }

  // Borders
  ctx.drawImage(spriteSheet, 10, 194, 6, 5, 96 - 6, 60 - 5, 6, 5); // TL
  ctx.drawImage(spriteSheet, 17, 194, 16, 6, 96, 60 - 5, 128, 6); // T
  ctx.drawImage(spriteSheet, 34, 194, 5, 5, 96 + 128, 60 - 5, 5, 5); // TR
  ctx.drawImage(spriteSheet, 34, 200, 6, 15, 96 + 128 - 1, 60, 6, 120); // R
  ctx.drawImage(spriteSheet, 34, 216, 6, 6, 96 + 128 - 1, 60 + 120 - 1, 6, 6); // BR
  ctx.drawImage(spriteSheet, 17, 216, 16, 6, 96, 60 + 120, 128, 6); // B
  ctx.drawImage(spriteSheet, 9, 216, 7, 7, 96 - 6, 60 + 120 - 1, 7, 7); // BL
  ctx.drawImage(spriteSheet, 10, 200, 6, 15, 96 - 6, 60, 6, 120); // L
}

function drawPieces() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (!piece) continue;
      const x = 96 + j * 16;
      const y = 60 + i * 15 - 16;
      drawPiece(piece, x, y);
    }
  }
}

function drawPiece(piece, x, y, shadowOffsetY = 16) {
  const [sx, sy] = {
    "♔": [160, 136],
    "♕": [144, 136],
    "♖": [112, 136],
    "♗": [80, 136],
    "♘": [128, 136],
    "♙": [96, 136],
    "♚": [160, 168],
    "♛": [144, 168],
    "♜": [112, 168],
    "♝": [80, 168],
    "♞": [128, 168],
    "♟︎": [96, 168],
  }[piece];
  ctx.drawImage(spriteSheet, 79, 200, 16, 15, x, y + shadowOffsetY, 16, 15); // Shadow
  ctx.drawImage(spriteSheet, sx, sy, 16, 30, x, y, 16, 30); // Piece
}

function drawFps(elapsed) {
  const fps = `${Math.round(1 / elapsed)}`;
  ctx.fillStyle = "white";
  ctx.font = "8px 'Press Start 2P'";
  const metrics = ctx.measureText(fps);
  const h = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  ctx.fillText(fps, 2, 2 + h);
}

function drawButton(text, x, y) {
  ctx.fillStyle = "black";
  ctx.font = "8px 'Press Start 2P'";
  const metrics = ctx.measureText(text);
  metrics.height;
  const h = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  ctx.drawImage(spriteSheet, 194, 211, 6, 17, x, y, 6, 17);
  ctx.drawImage(spriteSheet, 200, 211, 16, 17, x + 6, y, metrics.width, 17);
  ctx.drawImage(spriteSheet, 216, 211, 6, 17, x + 6 + metrics.width, y, 6, 17);
  ctx.fillText(text, x + 6, y + 8 + h / 2);
}
