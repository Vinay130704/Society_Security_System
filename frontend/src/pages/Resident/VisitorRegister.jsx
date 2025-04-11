import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  QrCode, UserPlus, Users, Clock, Check, X, Share2, 
  MessageSquare, Smartphone, Calendar, Search, Home, 
  User, ArrowRightCircle, ArrowLeftCircle, Download 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ResidentVisitorManagement = () => {
  const [activeTab, setActiveTab] = useState('invite');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [residentData, setResidentData] = useState(null);
  const [residentLoading, setResidentLoading] = useState(true);
  const navigate = useNavigate();

  const [visitorForm, setVisitorForm] = useState({
    name: '',
    phone: '',
    purpose: 'Guest'
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return {};
    }
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const fetchResidentData = async () => {
    try {
      setResidentLoading(true);
      const response = await axios.get(`${API_BASE_URL}/profile/get-profile`, getAuthHeaders());
      console.log('Resident Data Response:', response.data);
      const resident = response.data.user || response.data.data || response.data;
      if (!resident._id || !resident.flat_no) {
        throw new Error('Resident data missing _id or flat_no');
      }
      setResidentData(resident);
    } catch (error) {
      console.error('Error fetching resident data:', error);
      toast.error(error.message || 'Failed to load resident information');
      navigate('/login');
    } finally {
      setResidentLoading(false);
    }
  };

  const fetchVisitorLogs = async () => {
    if (!residentData) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/visitor/logs`, getAuthHeaders());
      console.log('Visitor Logs Response:', response.data);
      const residentVisitors = response.data.data.filter(
        visitor => visitor.resident_id._id === residentData._id
      );
      setVisitors(residentVisitors);
    } catch (error) {
      console.error('Error fetching visitor logs:', error);
      toast.error(error.response?.data?.message || 'Failed to load visitor logs');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteVisitor = async (e) => {
    e.preventDefault();
    if (!residentData || !residentData._id || !residentData.flat_no) {
      toast.error('Resident data not fully loaded. Please try again.');
      return;
    }
    const payload = {
      name: visitorForm.name,
      phone: visitorForm.phone,
      purpose: visitorForm.purpose,
      resident_id: residentData._id,
      flat_no: residentData.flat_no
    };
    console.log('Invite Payload:', payload);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/visitor/invite`,
        payload,
        getAuthHeaders()
      );
      console.log('Invite Response:', response.data);
      setQrData(response.data.data); // Set qrData with visitor and qr_code_url
      toast.success('Visitor invited successfully!');
      setVisitorForm({ 
        name: '', 
        phone: '', 
        purpose: 'Guest'
      });
      fetchVisitorLogs();
    } catch (error) {
      console.error('Error inviting visitor:', error);
      console.log('Error Response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to invite visitor');
    }
  };

  const shareQRCode = async (method) => {
    if (!qrData) return;
    const visitorName = qrData.visitor.name;
    const shareText = `Visitor Pass for ${visitorName}\nScan this QR code for entry:`;
    const qrUrl = qrData.qr_code_url; // Use the backend-provided URL
    
    try {
      const qrElement = document.getElementById('qr-code-container');
      const canvas = await html2canvas(qrElement);
      if (method === 'sms') {
        window.open(`sms:${qrData.visitor.phone}?body=${encodeURIComponent(`${shareText}\n${qrUrl}`)}`);
      } else if (method === 'whatsapp') {
        window.open(`https://wa.me/${qrData.visitor.phone}?text=${encodeURIComponent(`${shareText}\n${qrUrl}`)}`);
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast.error('Failed to share visitor pass');
    } finally {
      setShowShareOptions(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      const qrElement = document.getElementById('qr-code-container');
      const canvas = await html2canvas(qrElement);
      const link = document.createElement('a');
      link.download = `visitor-pass-${qrData.visitor.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         visitor.phone.includes(searchTerm);
    const matchesDate = !selectedDate || 
                       new Date(visitor.createdAt).toDateString() === selectedDate.toDateString();
    return matchesSearch && matchesDate;
  });

  useEffect(() => {
    fetchResidentData();
  }, []);

  useEffect(() => {
    if (residentData) fetchVisitorLogs();
  }, [residentData]);

  if (residentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Visitor Management</h1>
              <p className="text-gray-600 mt-1">
                {residentData ? `Resident: ${residentData.name}` : 'No resident information available'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 md:mt-0 flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition"
            >
              <Home size={18} /> Back to Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${activeTab === 'invite' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <UserPlus size={18} /> Invite Visitor
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users size={18} /> My Visitor Logs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6">
          {activeTab === 'invite' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Invite New Visitor</h2>
                <form onSubmit={handleInviteVisitor} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name *</label>
                    <input
                      type="text"
                      value={visitorForm.name}
                      onChange={(e) => setVisitorForm({...visitorForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                      placeholder="Enter visitor's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={visitorForm.phone}
                      onChange={(e) => setVisitorForm({...visitorForm, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                      placeholder="Enter visitor's phone number"
                      pattern="[0-9]{10}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                    <select
                      value={visitorForm.purpose}
                      onChange={(e) => setVisitorForm({...visitorForm, purpose: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="Guest">Guest</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={!residentData}
                    className={`w-full py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-md ${
                      residentData 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <QrCode size={18} /> Generate Visitor Pass
                  </button>
                </form>
              </div>

              <div className="flex flex-col items-center justify-center">
                {qrData ? (
                  <div className="text-center">
                    <div id="qr-code-container" className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                      <div className="flex justify-center mb-2">
                        <img 
                          src={qrData.qr_code_url} // Use the backend-provided QR code URL
                          alt="Visitor QR Code"
                          style={{ width: 220, height: 220 }}
                        />
                      </div>
                      <div className="mt-4 space-y-1">
                        <p className="text-lg font-semibold text-gray-800">{qrData.visitor.name}</p>
                        <p className="text-gray-600 flex items-center justify-center gap-2">
                          <Smartphone size={16} /> {qrData.visitor.phone}
                        </p>
                        <p className="text-sm text-gray-500">Purpose: {qrData.visitor.purpose}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => setShowShareOptions(!showShareOptions)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow"
                      >
                        <Share2 size={16} /> Share Pass
                      </button>
                      <button
                        onClick={downloadQRCode}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow"
                      >
                        <Download size={16} /> Download
                      </button>
                      {showShareOptions && (
                        <div className="absolute mt-12 bg-white shadow-xl rounded-lg p-3 z-10 flex gap-3 border border-gray-200">
                          <button
                            onClick={() => shareQRCode('sms')}
                            className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex flex-col items-center gap-1"
                            title="Share via SMS"
                          >
                            <MessageSquare size={20} />
                            <span className="text-xs">SMS</span>
                          </button>
                          <button
                            onClick={() => shareQRCode('whatsapp')}
                            className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex flex-col items-center gap-1"
                            title="Share via WhatsApp"
                          >
                            <Smartphone size={20} />
                            <span className="text-xs">WhatsApp</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <QrCode size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">Visitor QR Pass</h3>
                    <p className="mt-2">Fill the form to generate a visitor pass QR code</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">My Visitor History</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search visitors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg">
                    <Calendar className="text-gray-400" size={18} />
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      placeholderText="Filter by date"
                      className="w-32 focus:outline-none"
                      dateFormat="MMMM d, yyyy"
                      isClearable
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredVisitors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p>No visitor records found</p>
                  {searchTerm || selectedDate ? (
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedDate(null);
                      }}
                      className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Information</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timings</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVisitors.map((visitor) => (
                        <tr key={visitor._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="text-blue-600" size={18} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                                <div className="text-sm text-gray-500">{visitor.phone}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(visitor.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">{visitor.purpose}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              Pre-registered
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              visitor.entry_status === 'Checked In' || visitor.entry_status === 'granted' ? 'bg-green-100 text-green-800' :
                              visitor.entry_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              visitor.entry_status === 'exit' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {visitor.entry_status === 'Checked In' ? 'Checked In' :
                               visitor.entry_status === 'granted' ? 'Approved' :
                               visitor.entry_status === 'pending' ? 'Pending' :
                               visitor.entry_status === 'exit' ? 'Checked Out' : 
                               visitor.entry_status === 'denied' ? 'Denied' : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {visitor.entry_time ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    <ArrowRightCircle size={14} className="text-green-500" />
                                    {new Date(visitor.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                  {visitor.exit_time && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <ArrowLeftCircle size={14} className="text-blue-500" />
                                      {new Date(visitor.exit_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                  )}
                                </>
                              ) : '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentVisitorManagement;