console.log('Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message in background script:', request);

  if (request.action === 'startRecording') {
    console.log('Attempting to choose desktop media');
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      if (!tab) {
        console.error('No active tab found');
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }

      chrome.desktopCapture.chooseDesktopMedia(
        ['screen', 'window', 'tab'],
        tab.id,
        (streamId) => {
          if (streamId) {
            console.log('Successfully got stream ID:', streamId);
            sendResponse({ success: true, streamId });
          } else {
            console.error('Failed to get stream ID: User cancelled or an error occurred');
            sendResponse({ success: false, error: 'Failed to get stream ID' });
          }
        }
      );
    });

    return true; // Indicates that the response is asynchronous
  } else if (request.action === 'openRecordingTab') {
    console.log('Opening recording tab with URL:', request.url);
    chrome.tabs.create({ url: request.url });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});