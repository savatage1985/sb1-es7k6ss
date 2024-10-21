import React, { useState } from 'react'
import './App.css'

// Mock chrome API for development
const mockChrome = {
  runtime: {
    sendMessage: (message: any, callback: (response: any) => void) => {
      console.log('Mock chrome.runtime.sendMessage called with:', message);
      callback({ success: true, streamId: 'mock-stream-id' });
    }
  },
  tabs: {
    query: (queryInfo: any, callback: (tabs: any[]) => void) => {
      console.log('Mock chrome.tabs.query called with:', queryInfo);
      callback([{ id: 1 }]);
    },
    sendMessage: (tabId: number, message: any, callback: (response: any) => void) => {
      console.log('Mock chrome.tabs.sendMessage called with:', tabId, message);
      callback({ success: true });
    }
  }
};

// Check if we're in a Chrome extension environment
const isExtensionEnvironment = () => {
  return !!(window.chrome && chrome.runtime && chrome.runtime.id);
};

// Use the real chrome API if in extension environment, otherwise use the mock
const chromeAPI = isExtensionEnvironment() ? chrome : mockChrome;

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [useWebcam, setUseWebcam] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startRecording = () => {
    setError(null);
    chromeAPI.runtime.sendMessage({ action: 'startRecording' }, (response) => {
      if (response && response.success) {
        chromeAPI.tabs.query({active: true, currentWindow: true}, (tabs) => {
          const tab = tabs[0];
          if (tab && tab.id) {
            chromeAPI.tabs.sendMessage(tab.id, { action: 'startRecording', streamId: response.streamId, useWebcam }, (contentResponse) => {
              if (contentResponse && contentResponse.success) {
                setIsRecording(true)
              } else {
                setError(contentResponse ? contentResponse.error : 'Unknown error starting recording');
              }
            });
          } else {
            setError('No active tab found');
          }
        });
      } else {
        setError(response ? response.error : 'Unknown error getting stream ID');
      }
    });
  }

  const stopRecording = () => {
    setError(null);
    chromeAPI.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id) {
        chromeAPI.tabs.sendMessage(tab.id, { action: 'stopRecording' }, (response) => {
          if (response && response.success) {
            setIsRecording(false)
          } else {
            setError(response ? response.error : 'Unknown error stopping recording');
          }
        });
      } else {
        setError('No active tab found');
      }
    });
  }

  return (
    <div className="App">
      <h1>Instructional Video Recorder</h1>
      <label>
        <input
          type="checkbox"
          checked={useWebcam}
          onChange={(e) => setUseWebcam(e.target.checked)}
          disabled={isRecording}
        />
        Use Webcam
      </label>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!isExtensionEnvironment() && (
        <p style={{color: 'red'}}>
          Note: You are running in development mode. Actual recording functionality is only available in the Chrome extension environment.
        </p>
      )}
    </div>
  )
}

export default App