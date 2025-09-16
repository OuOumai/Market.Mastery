import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const FileScanner = ({ className = "" }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [watchedDirectories, setWatchedDirectories] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [directoryPath, setDirectoryPath] = useState('');
  const { API_BASE_URL } = useContext(AppContext);

  // Fetch scanner status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scanner/status`);
      const data = await response.json();
      
      if (data.success) {
        setIsScanning(data.isScanning);
        setWatchedDirectories(data.watchedDirectories);
      }
    } catch (err) {
      console.error('Error fetching scanner status:', err);
    }
  };

  // Scan directory
  const handleScan = async () => {
    if (!directoryPath.trim()) {
      setError('Please enter a directory path');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/scanner/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath: directoryPath.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setScanResult(data);
        fetchStatus(); // Refresh status
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (err) {
      setError('Failed to scan directory');
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Start watching directory
  const handleWatch = async () => {
    if (!directoryPath.trim()) {
      setError('Please enter a directory path');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/scanner/watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath: directoryPath.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setScanResult(data);
        fetchStatus(); // Refresh status
      } else {
        setError(data.error || 'Failed to start watching');
      }
    } catch (err) {
      setError('Failed to start watching directory');
      console.error('Watch error:', err);
    }
  };

  // Stop watching
  const handleStopWatch = async (path = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scanner/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath: path }),
      });

      const data = await response.json();
      
      if (data.success) {
        setScanResult(data);
        fetchStatus(); // Refresh status
      } else {
        setError(data.error || 'Failed to stop watching');
      }
    } catch (err) {
      setError('Failed to stop watching');
      console.error('Stop watch error:', err);
    }
  };

  // Fetch status on component mount
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">File Scanner</h3>
      
      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-sm font-medium">
            {isScanning ? 'Scanning...' : 'Ready'}
          </span>
        </div>
        
        {watchedDirectories.length > 0 && (
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Watching directories:</p>
            <ul className="list-disc list-inside space-y-1">
              {watchedDirectories.map((dir, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="truncate">{dir}</span>
                  <button
                    onClick={() => handleStopWatch(dir)}
                    className="text-red-600 hover:text-red-800 text-xs ml-2"
                  >
                    Stop
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Directory Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Directory Path
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={directoryPath}
            onChange={(e) => setDirectoryPath(e.target.value)}
            placeholder="C:\path\to\your\course\files"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleScan}
            disabled={isScanning || !directoryPath.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isScanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleWatch}
          disabled={!directoryPath.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Start Watching
        </button>
        
        {watchedDirectories.length > 0 && (
          <button
            onClick={() => handleStopWatch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Stop All Watching
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">How to use:</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Enter the path to your course files directory</li>
          <li>Click "Scan" to import existing files</li>
          <li>Click "Start Watching" to auto-import new files</li>
          <li>Files will appear on the website automatically</li>
        </ol>
        
        <div className="mt-3 text-xs text-gray-500">
          <p><strong>Example structure:</strong></p>
          <pre className="mt-1 bg-white p-2 rounded border text-xs overflow-x-auto">
{`course-materials/
├── Your Course Name/
│   ├── Chapter 1 - Introduction/
│   │   ├── video1.mp4
│   │   └── notes.pdf
│   └── Chapter 2 - Advanced/
│       ├── video2.mp4
│       └── guide.pdf`}
          </pre>
        </div>
      </div>

      {/* Results */}
      {scanResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <img src={assets.blue_tick_icon} alt="Success" className="w-4 h-4" />
            <span className="text-sm font-medium text-green-800">Success!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">{scanResult.message}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <img src={assets.cross_icon} alt="Error" className="w-4 h-4" />
            <span className="text-sm font-medium text-red-800">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileScanner;
