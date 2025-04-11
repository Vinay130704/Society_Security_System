import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  QrCode, CheckCircle, XCircle, Camera, 
  User, Smartphone, Home, AlertCircle,
  Search, Clock, LogOut, List, Info 
} from 'lucide-react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';

const SecurityVisitorScan = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [visitorDetails, setVisitorDetails] = useState({
    name: '',
    phone: '',
    flat_no: '',
    purpose: ''
  });
  const [manualName, setManualName] = useState('');
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isUnregisteredFlow, setIsUnregisteredFlow] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [exitingVisitorId, setExitingVisitorId] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch all visitor logs
  const fetchVisitorLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/visitor/entry-logs`,
        getAuthHeaders()
      );
      setVisitorLogs(response.data.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load visitor logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/visitor/pending-approvals`,
        getAuthHeaders()
      );
      setPendingApprovals(response.data.data);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to load pending approvals');
    }
  };

  // QR Code Scanning Logic
  const scanQRCode = () => {
    if (!webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      setQrCode(code.data);
      setIsScanningQR(false);
      handleScan(code.data);
    }
  };

  useEffect(() => {
    let interval;
    if (isScanningQR) {
      interval = setInterval(scanQRCode, 1000);
    }
    return () => clearInterval(interval);
  }, [isScanningQR]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchVisitorLogs();
    } else if (activeTab === 'approvals') {
      fetchPendingApprovals();
    }
  }, [activeTab]);

  const captureImage = () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    } catch (err) {
      console.error('Capture error:', err);
      toast.error('Failed to capture image');
    }
  };

  const handleScan = async (code = qrCode) => {
    if (!code.trim()) {
      setError('Please enter a QR code');
      return;
    }

    setLoading(true);
    setError(null);
    setScanResult(null);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/visitor/scan`,
        { qr_code: code },
        getAuthHeaders()
      );

      setScanResult(response.data);
      setVisitorDetails(response.data.data);
      toast.success('QR Code scanned successfully!');
    } catch (error) {
      console.error('Scan error:', error);
      
      if (error.response?.status === 404) {
        setError('Invalid QR code - Visitor not found');
        toast.error('Invalid QR code! Visitor not found.');
        setIsUnregisteredFlow(true);
        setShowCamera(true);
      } else {
        const errorMsg = error.response?.data?.message || 
                       'Failed to scan QR code';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Convert base64 to blob for file upload
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSendForApproval = async () => {
    if (!capturedImage) {
      toast.error('Please capture an image first');
      return;
    }

    if (!visitorDetails.name || !visitorDetails.phone || !visitorDetails.flat_no) {
      toast.error('Please fill in all visitor details');
      return;
    }

    setLoading(true);
    try {
      const blob = dataURLtoBlob(capturedImage);
      const imageFile = new File([blob], "visitor_image.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('name', visitorDetails.name);
      formData.append('phone', visitorDetails.phone);
      formData.append('flat_no', visitorDetails.flat_no);
      formData.append('purpose', visitorDetails.purpose || 'Visit');

      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/visitor/capture`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Visitor details and image sent for resident approval');
      resetForm();
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error sending for approval:', error);
      toast.error(error.response?.data?.message || 'Failed to send for approval');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!manualName.trim()) {
      setError('Please enter a name');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/visitor/search-by-name`,
        { name: manualName },
        getAuthHeaders()
      );

      if (response.data.data.length > 0) {
        setVisitorDetails(response.data.data[0]);
        setQrCode(response.data.data[0].qr_code);
        toast.success('Visitor found!');
      } else {
        toast.info('No visitor found with that name');
        setIsUnregisteredFlow(true);
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.message || 'Failed to search visitor');
    } finally {
      setLoading(false);
    }
  };

  const handleExitVisitor = async (visitorId) => {
    setExitingVisitorId(visitorId);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/visitor/exit/${visitorId}`,
        {},
        getAuthHeaders()
      );
      
      if (response.data.success) {
        toast.success('Exit recorded successfully');
        
        // Update visitor logs state
        setVisitorLogs(prevLogs => 
          prevLogs.map(log => 
            log._id === visitorId 
              ? { 
                  ...log, 
                  exit_time: new Date().toISOString(), 
                  entry_status: 'exit' 
                }
              : log
          )
        );
        
        // Update current visitor details if being viewed
        if (scanResult?.data?._id === visitorId) {
          setScanResult(prev => ({
            ...prev,
            data: {
              ...prev.data,
              exit_time: new Date().toISOString(),
              entry_status: 'exit'
            }
          }));
          setVisitorDetails(prev => ({
            ...prev,
            exit_time: new Date().toISOString(),
            entry_status: 'exit'
          }));
        }
      } else {
        throw new Error(response.data.message || 'Failed to record exit');
      }
    } catch (error) {
      console.error('Exit error:', error);
      toast.error(error.response?.data?.message || 'Failed to record exit');
    } finally {
      setExitingVisitorId(null);
    }
  };

  const handleApproveVisitor = async (visitorId) => {
    try {
      await axios.get(
        `${API_BASE_URL}/visitor/approve/${visitorId}`,
        getAuthHeaders()
      );
      toast.success('Visitor approved successfully');
      fetchPendingApprovals();
      fetchVisitorLogs();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve visitor');
    }
  };

  const handleDenyVisitor = async (visitorId) => {
    try {
      await axios.get(
        `${API_BASE_URL}/visitor/deny/${visitorId}`,
        getAuthHeaders()
      );
      toast.success('Visitor denied successfully');
      fetchPendingApprovals();
      fetchVisitorLogs();
    } catch (error) {
      console.error('Deny error:', error);
      toast.error(error.response?.data?.message || 'Failed to deny visitor');
    }
  };

  const resetForm = () => {
    setShowCamera(false);
    setCapturedImage(null);
    setQrCode('');
    setManualName('');
    setError(null);
    setScanResult(null);
    setIsScanningQR(false);
    setVisitorDetails({
      name: '',
      phone: '',
      flat_no: '',
      purpose: ''
    });
    setIsUnregisteredFlow(false);
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'environment'
  };

  const handleVisitorDetailChange = (e) => {
    const { name, value } = e.target;
    setVisitorDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <QrCode size={24} /> Security Visitor Management
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-3 text-center font-medium flex items-center justify-center gap-2 ${
              activeTab === 'scan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <QrCode size={18} /> Scan Visitor
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 text-center font-medium flex items-center justify-center gap-2 ${
              activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List size={18} /> Visitor Logs
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 py-3 text-center font-medium flex items-center justify-center gap-2 ${
              activeTab === 'approvals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle size={18} /> Pending Approvals
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'scan' && (
            <div className="space-y-6">
              {/* QR Code Scanning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <QrCode size={20} /> QR Code Scanner
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter QR Code Data
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter QR code data"
                        disabled={loading}
                      />
                      <button
                        onClick={handleScan}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                          loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {loading ? 'Scanning...' : 'Scan'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        setIsScanningQR(!isScanningQR);
                        if (!isScanningQR) {
                          setShowCamera(false);
                          setCapturedImage(null);
                        }
                      }}
                      className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${
                        isScanningQR ? 'bg-red-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      disabled={loading}
                    >
                      {isScanningQR ? 'Stop Camera' : 'Use Webcam Scanner'}
                    </button>
                  </div>

                  {isScanningQR && (
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="w-full h-auto"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  {/* Manual Search */}
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <Search size={18} /> Search by Name
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter visitor name"
                        disabled={loading}
                      />
                      <button
                        onClick={handleManualSearch}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                          loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Unregistered Visitor Form */}
                  {isUnregisteredFlow && (
                    <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2 text-yellow-800">
                        <Info size={18} /> Unregistered Visitor Details
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visitor Name*
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={visitorDetails.name}
                            onChange={handleVisitorDetailChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter visitor name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number*
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={visitorDetails.phone}
                            onChange={handleVisitorDetailChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter phone number"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Flat Number to Visit*
                          </label>
                          <input
                            type="text"
                            name="flat_no"
                            value={visitorDetails.flat_no}
                            onChange={handleVisitorDetailChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter flat number"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Purpose of Visit
                          </label>
                          <input
                            type="text"
                            name="purpose"
                            value={visitorDetails.purpose}
                            onChange={handleVisitorDetailChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter purpose of visit"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="text-red-500 mr-2" size={20} />
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {scanResult && !isUnregisteredFlow && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-500" size={24} />
                        <div>
                          <h3 className="font-medium text-green-800">Valid Visitor</h3>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-500" />
                              <span className="font-medium">Name:</span>
                              <span>{visitorDetails?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Smartphone size={16} className="text-gray-500" />
                              <span className="font-medium">Phone:</span>
                              <span>{visitorDetails?.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Home size={16} className="text-gray-500" />
                              <span className="font-medium">Flat:</span>
                              <span>{visitorDetails?.flat_no}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-gray-500" />
                              <span className="font-medium">Status:</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                visitorDetails?.entry_status === 'Checked In' ? 'bg-green-100 text-green-800' :
                                visitorDetails?.entry_status === 'exit' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {visitorDetails?.entry_status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Camera Section */}
                  {(showCamera || isUnregisteredFlow) && (
                    <div className="space-y-4">
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                        {capturedImage ? (
                          <img 
                            src={capturedImage} 
                            alt="Captured visitor" 
                            className="w-full h-64 object-contain"
                          />
                        ) : (
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-64 object-cover"
                          />
                        )}
                      </div>

                      <div className="flex gap-3">
                        {!capturedImage ? (
                          <button
                            onClick={captureImage}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                          >
                            <Camera size={16} /> Capture Image
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setCapturedImage(null)}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                              Retake
                            </button>
                            <button
                              onClick={handleSendForApproval}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                              disabled={loading}
                            >
                              {loading ? 'Sending...' : 'Send for Approval'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <List size={20} /> Visitor Logs
                </h2>
                <button
                  onClick={fetchVisitorLogs}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  Refresh
                </button>
              </div>

              {logsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {visitorLogs.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                            No visitor logs found
                          </td>
                        </tr>
                      ) : (
                        visitorLogs.map((visitor) => (
                          <tr key={visitor._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="text-blue-600" size={16} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                                  <div className="text-xs text-gray-500">{visitor.purpose}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {visitor.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {visitor.flat_no}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                visitor.entry_status === 'Checked In' ? 'bg-green-100 text-green-800' :
                                visitor.entry_status === 'exit' ? 'bg-blue-100 text-blue-800' :
                                visitor.entry_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                visitor.entry_status === 'granted' ? 'bg-emerald-100 text-emerald-800' :
                                visitor.entry_status === 'denied' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {visitor.entry_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {visitor.entry_time ? new Date(visitor.entry_time).toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {visitor.exit_time ? new Date(visitor.exit_time).toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {['Checked In', 'granted'].includes(visitor.entry_status) && !visitor.exit_time && (
                                <button
                                  onClick={() => handleExitVisitor(visitor._id)}
                                  disabled={exitingVisitorId === visitor._id}
                                  className={`text-blue-600 hover:text-blue-900 mr-3 flex items-center gap-1 ${
                                    exitingVisitorId === visitor._id ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <LogOut size={14} /> 
                                  {exitingVisitorId === visitor._id ? 'Processing...' : 'Mark Exit'}
                                </button>
                              )}
                              {visitor.image && (
                                <button
                                  onClick={() => window.open(`${API_BASE_URL}/${visitor.image.replace(/\\/g, '/')}`, '_blank')}
                                  className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                >
                                  <Camera size={14} /> View Image
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'approvals' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle size={20} /> Pending Approvals
                </h2>
                <button
                  onClick={fetchPendingApprovals}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  Refresh
                </button>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending approvals
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map(visitor => (
                    <div key={visitor._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {visitor.image && (
                          <div className="flex-shrink-0">
                            <img 
                              src={`${API_BASE_URL}/${visitor.image.replace(/\\/g, '/')}`} 
                              alt="Visitor" 
                              className="h-24 w-24 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{visitor.name}</h3>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="text-sm text-gray-500">Phone:</span>
                              <p>{visitor.phone}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Flat:</span>
                              <p>{visitor.flat_no}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Purpose:</span>
                              <p>{visitor.purpose || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Status:</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                visitor.entry_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {visitor.entry_status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => handleDenyVisitor(visitor._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={16} /> Deny
                        </button>
                        <button
                          onClick={() => handleApproveVisitor(visitor._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityVisitorScan;