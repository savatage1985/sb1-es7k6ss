import React, { useState } from 'react'
import './App.css'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [useWebcam, setUseWebcam] = useState(false)

  const startRecording = () => {
    chrome.runtime.sendMessage({ action: 'startRecording' }, (response) => {
      if (response && response.success) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          const tab = tabs[0];
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'startRecording', streamId: response.streamId, useWebcam }, (contentResponse) => {
              if (contentResponse && contentResponse.success) {
                setIsRecording(true)
              } else {
                console.error('Failed to start recording:', contentResponse ? contentResponse.error : 'Unknown error')
              }
            });
          }
        });
      } else {
        console.error('Failed to get stream ID:', response ? response.error : 'Unknown error')
      }
    });
  }

  const stopRecording = () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'stopRecording' }, (response) => {
          if (response && response.success) {
            setIsRecording(false)
          } else {
            console.error('Failed to stop recording:', response ? response.error : 'Unknown error')
          }
        });
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
    </div>
  )
}

export default App