document.getElementById('fullPage').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Use chrome.scripting.executeScript to capture full page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Scroll to the bottom of the page to capture full content
      window.scrollTo(0, document.body.scrollHeight);

      // Use html2canvas to capture the entire document
      html2canvas(document.body).then(canvas => {
        // Convert canvas to data URL and open annotation page
        openAnnotation(canvas.toDataURL('image/png'));
      });
    }
  });
});

document.getElementById('visiblePart').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
    openAnnotation(dataUrl);
  });
});

document.getElementById('selectedArea').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

function openAnnotation(dataUrl) {
  chrome.storage.local.set({ screenshot: dataUrl }, () => {
    chrome.tabs.create({ url: 'annotation.html' });
  });
}
