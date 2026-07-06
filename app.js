const canvas = document.querySelector("#drawingCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.querySelector("#colorPicker");
const brushSize = document.querySelector("#brushSize");
const sizeValue = document.querySelector("#sizeValue");
const penBtn = document.querySelector("#penBtn");
const eraserBtn = document.querySelector("#eraserBtn");
const undoBtn = document.querySelector("#undoBtn");
const clearBtn = document.querySelector("#clearBtn");
const downloadBtn = document.querySelector("#downloadBtn");

let drawing = false;
let erasing = false;
let lastPoint = null;
const history = [];

function setupCanvas() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveSnapshot();
}

function saveSnapshot() {
  history.push(canvas.toDataURL("image/png"));
  if (history.length > 30) history.shift();
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const pointer = event.touches?.[0] ?? event.changedTouches?.[0] ?? event;
  return {
    x: ((pointer.clientX - rect.left) / rect.width) * canvas.width,
    y: ((pointer.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function startDrawing(event) {
  event.preventDefault();
  drawing = true;
  lastPoint = getCanvasPoint(event);
}

function draw(event) {
  if (!drawing || !lastPoint) return;
  event.preventDefault();
  const currentPoint = getCanvasPoint(event);

  ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = Number(brushSize.value);
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(currentPoint.x, currentPoint.y);
  ctx.stroke();
  lastPoint = currentPoint;
}

function stopDrawing() {
  if (!drawing) return;
  drawing = false;
  lastPoint = null;
  ctx.globalCompositeOperation = "source-over";
  saveSnapshot();
}

function setTool(useEraser) {
  erasing = useEraser;
  penBtn.classList.toggle("active", !useEraser);
  eraserBtn.classList.toggle("active", useEraser);
  canvas.style.cursor = useEraser ? "grab" : "crosshair";
}

function restoreSnapshot(dataUrl) {
  const image = new Image();
  image.onload = () => {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  };
  image.src = dataUrl;
}

function undo() {
  if (history.length <= 1) return;
  history.pop();
  restoreSnapshot(history[history.length - 1]);
}

function clearCanvas() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveSnapshot();
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = `小画板-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);
canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing);

brushSize.addEventListener("input", () => {
  sizeValue.value = brushSize.value;
});
penBtn.addEventListener("click", () => setTool(false));
eraserBtn.addEventListener("click", () => setTool(true));
undoBtn.addEventListener("click", undo);
clearBtn.addEventListener("click", clearCanvas);
downloadBtn.addEventListener("click", downloadImage);

setupCanvas();
