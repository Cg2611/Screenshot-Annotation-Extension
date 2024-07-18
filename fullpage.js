html2canvas(document.body).then(canvas => {
  openAnnotation(canvas.toDataURL('image/png'));
});

function openAnnotation(dataUrl) {
  chrome.storage.local.set({ screenshot: dataUrl }, () => {
      chrome.runtime.sendMessage({ action: 'openAnnotation' });
  });
}
