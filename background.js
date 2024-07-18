chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openAnnotation') {
    chrome.storage.local.get(['screenshot'], (result) => {
      if (result.screenshot) {
        chrome.tabs.create({ url: 'annotation.html' });
      }
    });
  }
});
