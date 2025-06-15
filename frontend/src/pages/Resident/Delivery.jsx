import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {
  Truck, Package, Clock, Check, X,
  Calendar, Search, Home, User,
  ArrowRightCircle, Plus, Edit, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DELIVERY_COMPANIES = [
  'Amazon',
  'Flipkart',
  'DHL',
  'FedEx',
  'Blue Dart',
  'DTDC',
  'Swiggy Instamart',
  'Zomato',
  'Other'
];

// Custom Phone Input Component
const PhoneInput = ({ value, onChange, error }) => {
  const [digits, setDigits] = useState(value.replace(/^\+91/, '') || '');

  useEffect(() => {
    setDigits(value.replace(/^\+91/, '') || '');
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 10);
    setDigits(input);
    onChange(`+91${input}`);
  };

  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
        <input
          type="text"
          value={digits}
          onChange={handleChange}
          className={`w-full pl-12 pr-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          placeholder="Enter 10-digit number"
          required
          pattern="[0-9]{10}"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const DeliveryManagement = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [uniqueIdData, setUniqueIdData] = useState(null);
  const [residentData, setResidentData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();

  const [deliveryForm, setDeliveryForm] = useState({
    deliveryPersonName: '',
    phone: '+91',
    apartment: '',
    deliveryCompany: '',
    expectedTime: new Date()
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to continue');
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
      const response = await axios.get(`${API_BASE_URL}/profile/get-profile`, getAuthHeaders());
      const resident = response.data.user || response.data.data || response.data;
      if (!resident._id || !resident.flat_no) {
        throw new Error('Resident data missing _id or flat_no');
      }
      setResidentData(resident);
      setDeliveryForm(prev => ({
        ...prev,
        apartment: resident.flat_no
      }));
    } catch (error) {
      console.error('Error fetching resident data:', error);
      toast.error(error.message || 'Failed to load resident information');
      navigate('/login');
    }
  };

  const fetchDeliveries = async () => {
    if (!residentData) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/delivery/all`,
        {
          ...getAuthHeaders(),
          params: { residentId: residentData._id }
        }
      );

      const residentDeliveries = response.data.deliveries || response.data.data || [];
      const validDeliveries = residentDeliveries.filter(delivery =>
        delivery && typeof delivery.status === 'string'
      );
      console.log('Fetched deliveries:', validDeliveries);
      setDeliveries(validDeliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error(error.response?.data?.message || 'Failed to load deliveries');
    }
  };

  const validatePhone = (phone) => {
    const digits = phone.replace(/^\+91/, '');
    if (!/^\d{10}$/.test(digits)) {
      setPhoneError('Phone number must be 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    if (!residentData || !residentData._id) {
      toast.error('Resident data not loaded');
      return;
    }

    if (!validatePhone(deliveryForm.phone)) return;

    const payload = {
      ...deliveryForm,
      residentId: residentData._id,
      expectedTime: deliveryForm.expectedTime.toISOString()
    };

    try {
      const response = await toast.promise(
        axios.post(`${API_BASE_URL}/delivery/create`, payload, getAuthHeaders()),
        {
          pending: 'Creating delivery request...',
          success: 'Delivery request created successfully!',
          error: {
            render({ data }) {
              const errorMessage = data.response?.data?.message ||
                data.response?.data?.error ||
                'Failed to create delivery';
              if (data.response?.data?.error === "A pending delivery request already exists") {
                return 'You can only have one active delivery at a time';
              }
              return errorMessage;
            }
          }
        }
      );

      setUniqueIdData(response.data.delivery);
      setDeliveryForm({
        deliveryPersonName: '',
        phone: '+91',
        apartment: residentData.flat_no,
        deliveryCompany: '',
        expectedTime: new Date()
      });
      setShowForm(false);
      fetchDeliveries();
    } catch (error) {
      console.error('Error creating delivery:', error);
    }
  };

  const handleUpdateDelivery = async (e) => {
    e.preventDefault();
    if (!uniqueIdData || !uniqueIdData._id) return;

    if (!validatePhone(deliveryForm.phone)) return;

    const payload = {
      ...deliveryForm,
      expectedTime: deliveryForm.expectedTime.toISOString()
    };

    try {
      const response = await toast.promise(
        axios.put(`${API_BASE_URL}/delivery/edit/${uniqueIdData._id}`, payload, getAuthHeaders()),
        {
          pending: 'Updating delivery request...',
          success: 'Delivery updated successfully!',
          error: {
            render({ data }) {
              const errorMessage = data.response?.data?.message ||
                data.response?.data?.error ||
                'Failed to update delivery';
              if (data.response?.data?.error === "Cannot edit: Delivery time has passed") {
                return 'You can only edit deliveries with future expected times';
              }
              return errorMessage;
            }
          }
        }
      );

      setUniqueIdData(response.data.delivery);
      setDeliveryForm({
        deliveryPersonName: '',
        phone: '+91',
        apartment: residentData.flat_no,
        deliveryCompany: '',
        expectedTime: new Date()
      });
      setShowForm(false);
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery:', error);
    }
  };

  const handleDeleteDelivery = async (id) => {
    try {
      await toast.promise(
        axios.delete(`${API_BASE_URL}/delivery/delete/${id}`, getAuthHeaders()),
        {
          pending: 'Deleting delivery request...',
          success: 'Delivery deleted successfully!',
          error: {
            render({ data }) {
              const errorMessage = data.response?.data?.message ||
                data.response?.data?.error ||
                'Failed to delete delivery';
              if (data.response?.data?.error === "Cannot delete: Delivery time has passed") {
                return 'You can only delete deliveries with future expected times';
              }
              return errorMessage;
            }
          }
        }
      );

      if (uniqueIdData && uniqueIdData._id === id) {
        setUniqueIdData(null);
      }
      fetchDeliveries();
    } catch (error) {
      console.error('Error deleting delivery:', error);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (!delivery || !delivery.status) return false;
    const matchesSearch = delivery.deliveryPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.phone.includes(searchTerm) ||
      delivery.deliveryCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate ||
      new Date(delivery.expectedTime).toDateString() === selectedDate.toDateString();

    if (activeTab === 'active') {
      return matchesSearch && matchesDate && delivery.status !== 'completed';
    } else {
      return matchesSearch && matchesDate && delivery.status === 'completed';
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  useEffect(() => {
    fetchResidentData();
  }, []);

  useEffect(() => {
    if (residentData) fetchDeliveries();
  }, [residentData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Delivery Management</h1>
              <p className="text-gray-600 mt-1">
                {residentData ? `Apartment ${residentData.flat_no} • ${residentData.name}` : 'Loading resident information...'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition"
              >
                <Home size={18} /> Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Truck size={18} /> Active Deliveries
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Clock size={18} /> Delivery History
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {activeTab === 'active' ? 'Active Deliveries' : 'Delivery History'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredDeliveries.length} {filteredDeliveries.length === 1 ? 'record' : 'records'})
              </span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, phone, or company..."
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
              <button
                onClick={() => {
                  setShowForm(true);
                  setUniqueIdData(null);
                }}
                disabled={deliveries.some(d => d.status === 'pending')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${deliveries.some(d => d.status === 'pending')
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                  }`}
              >
                <Plus size={18} /> New Delivery
              </button>
            </div>
          </div>

          {/* Delivery Form / Unique ID Display */}
          {(showForm || uniqueIdData) && (
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {uniqueIdData ? 'Delivery Pass Code' : 'Create New Delivery'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setUniqueIdData(null);
                    setDeliveryForm({
                      deliveryPersonName: '',
                      phone: '+91',
                      apartment: residentData?.flat_no || '',
                      deliveryCompany: '',
                      expectedTime: new Date()
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {uniqueIdData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Unique ID Section */}
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-200 flex flex-col items-center">
                    <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
                      <div className="text-2xl font-mono font-bold text-blue-800">
                        {uniqueIdData.uniqueId || 'No code available'}
                      </div>
                    </div>

                    <div className="w-full space-y-3">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Delivery Person:</span>
                        <span className="text-gray-800">{uniqueIdData.deliveryPersonName}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Phone:</span>
                        <span className="text-gray-800">{uniqueIdData.phone}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Company:</span>
                        <span className="text-gray-800">{uniqueIdData.deliveryCompany}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Apartment:</span>
                        <span className="text-gray-800">{uniqueIdData.apartment}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Expected Time:</span>
                        <span className="text-gray-800">{formatDateTime(uniqueIdData.expectedTime)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${uniqueIdData.status === 'approved' ? 'bg-green-100 text-green-800' :
                            uniqueIdData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              uniqueIdData.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {formatStatus(uniqueIdData.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form Section */}
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-4">Edit Delivery Details</h4>
                    <form onSubmit={handleUpdateDelivery} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Person Name *</label>
                        <input
                          type="text"
                          value={deliveryForm.deliveryPersonName}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryPersonName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                          placeholder="Enter delivery person's name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <PhoneInput
                          value={deliveryForm.phone}
                          onChange={(phone) => setDeliveryForm({ ...deliveryForm, phone })}
                          error={phoneError}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Company *</label>
                        <select
                          value={deliveryForm.deliveryCompany}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryCompany: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                        >
                          <option value="" disabled>Select a delivery company</option>
                          {DELIVERY_COMPANIES.map((company) => (
                            <option key={company} value={company}>{company}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Time *</label>
                        <DatePicker
                          selected={deliveryForm.expectedTime}
                          onChange={(date) => setDeliveryForm({ ...deliveryForm, expectedTime: date })}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow"
                        >
                          <Edit size={16} /> Update Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDelivery(uniqueIdData._id)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateDelivery} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Person Name *</label>
                      <input
                        type="text"
                        value={deliveryForm.deliveryPersonName}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryPersonName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                        placeholder="Enter delivery person's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <PhoneInput
                        value={deliveryForm.phone}
                        onChange={(phone) => setDeliveryForm({ ...deliveryForm, phone })}
                        error={phoneError}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apartment *</label>
                      <input
                        type="text"
                        value={deliveryForm.apartment}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, apartment: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                        placeholder="Enter apartment number"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Company *</label>
                      <select
                        value={deliveryForm.deliveryCompany}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryCompany: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      >
                        <option value="" disabled>Select a delivery company</option>
                        {DELIVERY_COMPANIES.map((company) => (
                          <option key={company} value={company}>{company}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Time *</label>
                      <DatePicker
                        selected={deliveryForm.expectedTime}
                        onChange={(date) => setDeliveryForm({ ...deliveryForm, expectedTime: date })}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow"
                      >
                        <Plus size={16} /> Generate Delivery Code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setDeliveryForm({
                            deliveryPersonName: '',
                            phone: '+91',
                            apartment: residentData?.flat_no || '',
                            deliveryCompany: '',
                            expectedTime: new Date()
                          });
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Deliveries List */}
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Truck size={48} className="mx-auto text-gray-300 mb-4" />
              <p>No {activeTab === 'active' ? 'active' : 'completed'} deliveries found</p>
              {(searchTerm || selectedDate) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDate(null);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto"
                >
                  <X size={16} /> Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((delivery) => (
                      <tr key={delivery._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="text-blue-600" size={18} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{delivery.deliveryPersonName}</div>
                              <div className="text-sm text-gray-500">{delivery.phone}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                Apartment {delivery.apartment}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{delivery.deliveryCompany}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${delivery.status === 'approved' ? 'bg-green-100 text-green-800' :
                              delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                delivery.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {formatStatus(delivery.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <Clock size={14} className="text-gray-500" />
                              {formatDateTime(delivery.expectedTime)}
                            </div>
                            {delivery.entryTime && (
                              <div className="flex items-center gap-1 mt-1">
                                <ArrowRightCircle size={14} className="text-green-500" />
                                {formatTime(delivery.entryTime)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setDeliveryForm({
                                  deliveryPersonName: delivery.deliveryPersonName,
                                  phone: delivery.phone,
                                  apartment: delivery.apartment,
                                  deliveryCompany: delivery.deliveryCompany,
                                  expectedTime: new Date(delivery.expectedTime)
                                });
                                setUniqueIdData(delivery);
                                setShowForm(true);
                              }}
                              disabled={delivery.status === 'completed'}
                              className={`p-2 rounded-lg transition ${delivery.status === 'completed'
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-blue-600 hover:bg-blue-100'
                                }`}
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setUniqueIdData(delivery);
                                setShowForm(false);
                              }}
                              disabled={!delivery.uniqueId}
                              className={`p-2 rounded-lg transition ${!delivery.uniqueId
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-purple-600 hover:bg-purple-100'
                                }`}
                              title="View Delivery Code"
                            >
                              <Package size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteDelivery(delivery._id)}
                              disabled={delivery.status === 'completed'}
                              className={`p-2 rounded-lg transition ${delivery.status === 'completed'
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:bg-red-100'
                                }`}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="flex items-end px-1">...</span>
                    )}

                    {totalPages > 5 && currentPage >= totalPages - 2 && (
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === totalPages
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryManagement;