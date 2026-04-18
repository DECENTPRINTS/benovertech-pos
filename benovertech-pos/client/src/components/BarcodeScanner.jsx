/**
 * Barcode Scanner Component
 * Uses BarcodeDetector API to scan product barcodes via device camera
 */
import { useState, useRef, useEffect } from 'react';
import { Camera, X, AlertCircle, Loader } from 'lucide-react';
import Button from './Button';

export default function BarcodeScanner({ onBarcodeDetected, products, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isBarcodeDetectorSupported, setIsBarcodeDetectorSupported] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const [manualSearch, setManualSearch] = useState('');
  const [showFallback, setShowFallback] = useState(false);

  // Check BarcodeDetector support on mount
  useEffect(() => {
    const checkSupport = async () => {
      try {
        if ('BarcodeDetector' in window) {
          // Check supported formats
          const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
          if (supportedFormats.length > 0) {
            setIsBarcodeDetectorSupported(true);
          }
        }
      } catch (err) {
        console.warn('BarcodeDetector not supported:', err);
      }
    };

    checkSupport();
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setShowFallback(false);

        // Start scanning
        if (isBarcodeDetectorSupported) {
          startBarcodeDetection();
        }
      }
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied'
          : 'Failed to access camera'
      );
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
      setIsScanning(false);
      setManualSearch('');
    }
  };

  const startBarcodeDetection = async () => {
    if (!isCameraActive || !videoRef.current) return;

    setIsScanning(true);

    const detector = new window.BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upca', 'upce'],
    });

    const scanInterval = setInterval(async () => {
      if (!videoRef.current || !isCameraActive) {
        clearInterval(scanInterval);
        return;
      }

      try {
        const barcodes = await detector.detect(videoRef.current);

        if (barcodes.length > 0) {
          const barcode = barcodes[0].rawValue;

          // Prevent duplicate scans within 2 seconds
          if (lastScanned === barcode) return;

          setLastScanned(barcode);
          
          // Find product by barcode
          const product = products.find(
            (p) => p.barcode?.toLowerCase() === barcode.toLowerCase()
          );

          if (product) {
            onBarcodeDetected(product);
            stopCamera();
            
            // Reset after 2 seconds
            setTimeout(() => setLastScanned(null), 2000);
          } else {
            setError(`Product not found: ${barcode}`);
            setTimeout(() => {
              setError(null);
              setLastScanned(null);
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Barcode detection error:', err);
      }
    }, 500); // Scan every 500ms

    // Cleanup on unmount or camera stop
    return () => clearInterval(scanInterval);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualSearch.trim()) return;

    // Search by barcode or product name
    const product = products.find(
      (p) =>
        p.barcode?.toLowerCase() === manualSearch.toLowerCase() ||
        p.name?.toLowerCase().includes(manualSearch.toLowerCase())
    );

    if (product) {
      onBarcodeDetected(product);
      stopCamera();
      onClose?.();
    } else {
      setError(`Product not found: ${manualSearch}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera Feed */}
      {isCameraActive ? (
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video w-full max-w-md mx-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Scanning Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-orange-500 rounded-lg relative">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

              {/* Scanning line animation */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-2 rounded-full">
            <p className="text-xs text-white font-medium flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Live Scan
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-2xl aspect-video w-full max-w-md mx-auto flex items-center justify-center">
          <div className="text-center">
            <Camera size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Camera ready</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Camera Controls */}
      <div className="flex gap-2 justify-center">
        {!isCameraActive ? (
          <>
            <Button
              variant="accent"
              size="md"
              onClick={startCamera}
              disabled={!isBarcodeDetectorSupported}
              className="flex items-center"
            >
              <Camera size={16} className="mr-2" />
              {isBarcodeDetectorSupported ? 'Start Scan' : 'Not Supported'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowFallback(!showFallback)}
              className="flex items-center"
            >
              Manual Search
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            size="md"
            onClick={stopCamera}
            className="flex items-center"
          >
            Stop Camera
          </Button>
        )}
        {onClose && (
          <Button variant="ghost" size="md" onClick={onClose}>
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Manual Search Fallback */}
      {showFallback && (
        <form onSubmit={handleManualSearch} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              Search by Barcode or Product Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter barcode or product name..."
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                autoFocus
              />
              <Button
                type="submit"
                variant="accent"
                size="sm"
                disabled={!manualSearch.trim()}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Suggested Products */}
          {manualSearch && (
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Suggestions:</p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {products
                  .filter(
                    (p) =>
                      p.name?.toLowerCase().includes(manualSearch.toLowerCase()) ||
                      p.barcode?.toLowerCase().includes(manualSearch.toLowerCase())
                  )
                  .slice(0, 6)
                  .map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        onBarcodeDetected(product);
                        stopCamera();
                        onClose?.();
                      }}
                      className="p-2 text-left border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 transition"
                    >
                      <p className="text-xs font-medium text-black truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600">{product.barcode}</p>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> Hold the product barcode 15-20cm from the camera. 
          Make sure it's well-lit and not bent.
        </p>
      </div>

      {/* Supported Formats */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Supported Formats:</p>
        <div className="flex flex-wrap gap-1">
          {['EAN-13', 'EAN-8', 'Code 128', 'Code 39', 'UPC-A', 'UPC-E'].map((format) => (
            <span
              key={format}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-600"
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
