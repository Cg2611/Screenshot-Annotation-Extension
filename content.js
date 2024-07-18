let startX, startY, endX, endY;
let isDrawing = false;
const selectionBox = document.createElement('div');
selectionBox.style.position = 'absolute';
selectionBox.style.border = '2px dashed #000';
document.body.appendChild(selectionBox);

document.addEventListener('mousedown', (e) => {
  startX = e.pageX;
  startY = e.pageY;
  isDrawing = true;
});

document.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  endX = e.pageX;
  endY = e.pageY;
  selectionBox.style.left = `${Math.min(startX, endX)}px`;
  selectionBox.style.top = `${Math.min(startY, endY)}px`;
  selectionBox.style.width = `${Math.abs(startX - endX)}px`;
  selectionBox.style.height = `${Math.abs(startY - endY)}px`;
});

document.addEventListener('mouseup', async (e) => {
  isDrawing = false;
  if (selectionBox.parentElement) {
    selectionBox.parentElement.removeChild(selectionBox);
  }

  const rect = {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(startX - endX),
    height: Math.abs(startY - endY)
  };

  // Capture visible tab in the specified rectangle
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    if (dataUrl) {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, -rect.x, -rect.y);
        const croppedDataUrl = canvas.toDataURL('image/png');
        openAnnotation(croppedDataUrl);
      };
    } else {
      console.error('Failed to capture visible tab.');
    }
  });
});

function openAnnotation(dataUrl) {
  chrome.storage.local.set({ screenshot: dataUrl }, () => {
    chrome.runtime.sendMessage({ action: 'openAnnotation' });
  });
}
