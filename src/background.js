chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], (streamId) => {
      if (streamId) {
        sendResponse({ success: true, streamId });
      } else {
        sendResponse({ success: false, error: 'Failed to get stream ID' });
      }
    });
    return true; // Indicates that the response is asynchronous
  } else if (request.action === 'openRecordingTab') {
    chrome.tabs.create({ url: request.url });
  }
});