let mediaRecorder = null;
let recordedChunks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    startRecording(request.streamId, request.useWebcam, sendResponse);
    return true; // Indicates that the response is asynchronous
  } else if (request.action === 'stopRecording') {
    stopRecording(sendResponse);
    return true; // Indicates that the response is asynchronous
  }
});

async function startRecording(streamId, useWebcam, sendResponse) {
  try {
    const constraints = {
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: streamId
        }
      },
      audio: true
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (useWebcam) {
      const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stream.addTrack(webcamStream.getVideoTracks()[0]);
    }

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      chrome.runtime.sendMessage({action: 'openRecordingTab', url});
      recordedChunks = [];
    };

    mediaRecorder.start();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error starting recording:', error);
    sendResponse({ success: false, error: 'Failed to start recording' });
  }
}

function stopRecording(sendResponse) {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: 'No active recording' });
  }
}