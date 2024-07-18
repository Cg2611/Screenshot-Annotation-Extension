let canvas = document.getElementById('screenshotCanvas');
let ctx = canvas.getContext('2d');
let currentTool = 'draw';
let drawing = false;
let startX, startY;

chrome.storage.local.get(['screenshot'], (result) => {
  if (result.screenshot) {
    let img = new Image();
    img.src = result.screenshot;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    }
  }
});

function setTool(tool) {
  currentTool = tool;
}

document.getElementById('draw').addEventListener('click', () => setTool('draw'));
document.getElementById('text').addEventListener('click', () => setTool('text'));
document.getElementById('arrow').addEventListener('click', () => setTool('arrow'));
document.getElementById('highlight').addEventListener('click', () => setTool('highlight'));
document.getElementById('rectangle').addEventListener('click', () => setTool('rectangle'));

document.getElementById('save').addEventListener('click', () => {
  let dataUrl = canvas.toDataURL('image/png');
  chrome.downloads.download({
    url: dataUrl,
    filename: 'screenshot.png'
  });
});

document.getElementById('share').addEventListener('click', async () => {
  let dataUrl = canvas.toDataURL('image/png');
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], "screenshot.png", { type: "image/png" });
  const filesArray = [file];

  if (navigator.canShare && navigator.canShare({ files: filesArray })) {
    try {
      await navigator.share({
        files: filesArray,
        title: 'Annotated Screenshot'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  } else {
    console.error('Web Share API not supported.');
  }
});

document.getElementById('clear').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  chrome.storage.local.get(['screenshot'], (result) => {
    if (result.screenshot) {
      let img = new Image();
      img.src = result.screenshot;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      }
    }
  });
});

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  startX = e.offsetX;
  startY = e.offsetY;
  if (currentTool === 'text') {
    const text = prompt('Enter text:');
    if (text) {
      ctx.font = '20px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText(text, startX, startY);
    }
    drawing = false;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  if (currentTool === 'draw') {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
  if (currentTool === 'highlight') {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 10;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
});

canvas.addEventListener('mouseup', (e) => {
  drawing = false;
  ctx.beginPath();
  if (currentTool === 'arrow') {
    drawArrow(startX, startY, e.offsetX, e.offsetY);
  }
  if (currentTool === 'rectangle') {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
  }
});

function drawArrow(fromx, fromy, tox, toy) {
  let headlen = 10; // length of head in pixels
  let dx = tox - fromx;
  let dy = toy - fromy;
  let angle = Math.atan2(dy, dx);
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
}
