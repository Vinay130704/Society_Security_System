import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaExclamationTriangle, 
  FaSearch, 
  FaFilter, 
  FaTimes,
  FaPlus,
  FaUserShield,
  FaHistory,
  FaChartLine,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { 
  MdWarning, 
  MdEmergency, 
  MdSecurity,
  MdPerson,
  MdLocationOn,
  MdAccessTime,
  MdOutlineAssignment
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { useAuth } from '../../context/AuthContext';

Modal.setAppElement('#root');

const EmergencyAlertsAdmin = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: 'pending',
    actionTaken: '',
    assignedTo: ''
  });
  const [securityStaff, setSecurityStaff] = useState([]);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    fetchAlerts();
    fetchSecurityStaff();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/emergency/all-emergency-alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch emergency alerts');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSecurityStaff(response.data || []);
    } catch (error) {
      console.error('Failed to fetch security staff', error);
    }
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusForm({
      ...statusForm,
      [name]: value
    });
  };

  const openStatusModal = (alert) => {
    setCurrentAlert(alert);
    setStatusForm({
      status: alert.status,
      actionTaken: alert.actionTaken || '',
      assignedTo: alert.assignedTo?._id || ''
    });
    setIsStatusModalOpen(true);
  };

  const openDetailsModal = (alert) => {
    setCurrentAlert(alert);
    setIsDetailsModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/emergency/${currentAlert._id}/status`,
        statusForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Alert status updated successfully');
      fetchAlerts();
      setIsStatusModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update alert status');
      console.error('Status update error:', error);
    }
  };

  // Filter and pagination logic
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.residentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = 
      filters.type === 'all' || 
      alert.type === filters.type;

    const matchesStatus = 
      filters.status === 'all' || 
      alert.status === filters.status;

    const matchesPriority = 
      filters.priority === 'all' || 
      alert.priority === filters.priority;

    const matchesDateRange = () => {
      if (filters.dateRange === 'all') return true;
      const alertDate = new Date(alert.createdAt);
      const now = new Date();
      const diffHours = (now - alertDate) / (1000 * 60 * 60);
      
      if (filters.dateRange === 'today') return diffHours < 24;
      if (filters.dateRange === 'week') return diffHours < 168;
      if (filters.dateRange === 'month') return diffHours < 720;
      return true;
    };

    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesDateRange();
  });

  const activeAlerts = filteredAlerts.filter(alert => alert.status !== 'Resolved');
  const resolvedAlerts = filteredAlerts.filter(alert => alert.status === 'Resolved');

  const sortedAlerts = [...(tab === 'active' ? activeAlerts : resolvedAlerts)].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlerts = sortedAlerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAlerts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'Fire':
        return <MdEmergency className="text-red-500 text-2xl" />;
      case 'Medical':
        return <FaExclamationTriangle className="text-red-500 text-2xl" />;
      case 'Security Threat':
        return <MdSecurity className="text-blue-500 text-2xl" />;
      default:
        return <MdWarning className="text-yellow-500 text-2xl" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">High</span>;
      case 'Medium':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">Medium</span>;
      case 'Low':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Low</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">Unknown</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>;
      case 'Processing':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Processing</span>;
      case 'Resolved':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Resolved</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">Unknown</span>;
    }
  };

  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-primary p-3 rounded-lg mr-4">
              <FaExclamationTriangle className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">Emergency Alerts Dashboard</h1>
              <p className="text-sm text-gray-600">
                {user?.role === 'admin' ? 'Full administrative access' : 'Limited access based on your role'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {user?.role === 'admin' && (
              <button className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors shadow-md">
                <FaPlus /> New Alert
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search alerts by type, description, resident or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-primary text-white' : 'bg-white text-primary border border-primary'}`}
              >
                <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={() => {
                  setFilters({
                    type: 'all',
                    status: 'all',
                    priority: 'all',
                    dateRange: 'all'
                  });
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="Fire">Fire</option>
                      <option value="Medical">Medical</option>
                      <option value="Security Threat">Security Threat</option>
                      <option value="Unauthorized Entry">Unauthorized Entry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters({...filters, priority: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    >
                      <option value="all">All Priorities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Last 24 Hours</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 font-medium text-sm flex items-center gap-2 ${tab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'}`}
            onClick={() => {
              setTab('active');
              setCurrentPage(1);
            }}
          >
            <FaExclamationTriangle /> Active Alerts ({activeAlerts.length})
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm flex items-center gap-2 ${tab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'}`}
            onClick={() => {
              setTab('history');
              setCurrentPage(1);
            }}
          >
            <FaHistory /> Resolved Alerts ({resolvedAlerts.length})
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Alerts Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentAlerts.length > 0 ? (
                      currentAlerts.map((alert) => (
                        <tr key={alert._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {getAlertIcon(alert.type)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                  {alert.type}
                                  {alert.photo && (
                                    <span 
                                      className="text-xs text-secondary cursor-pointer hover:underline"
                                      onClick={() => setExpandedAlert(alert._id)}
                                    >
                                      [View Photo]
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">{alert.description}</div>
                                <div className="text-xs text-gray-400 mt-1 flex items-center">
                                  <MdLocationOn className="mr-1" /> {alert.location}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <MdPerson className="text-gray-500 text-xl" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {alert.residentId?.name || 'System'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {alert.residentId?.flat_no ? `Flat ${alert.residentId.flat_no}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPriorityBadge(alert.priority || 'Medium')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(alert.status)}
                              {alert.assignedTo && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  <MdOutlineAssignment className="mr-1" /> {alert.assignedTo.name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <MdAccessTime className="text-gray-400" />
                              {formatDateTime(alert.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openDetailsModal(alert)}
                                className="text-primary hover:text-primary-dark px-3 py-1 rounded hover:bg-primary/10 transition-colors"
                              >
                                Details
                              </button>
                              {(user?.role === 'admin' || user?.role === 'security') && (
                                <button
                                  onClick={() => openStatusModal(alert)}
                                  className="text-secondary hover:text-secondary-dark px-3 py-1 rounded hover:bg-secondary/10 transition-colors"
                                >
                                  Update
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center">
                          <div className="text-gray-500 flex flex-col items-center justify-center">
                            <FaExclamationTriangle className="text-3xl text-gray-400 mb-2" />
                            <p className="text-lg font-medium">No {tab === 'active' ? 'active' : 'resolved'} alerts found</p>
                            <p className="text-sm">Try adjusting your filters or search query</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expanded Alert Photo */}
            <AnimatePresence>
              {expandedAlert && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                  onClick={() => setExpandedAlert(null)}
                >
                  <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                    <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                      <h3 className="text-lg font-bold text-primary">Alert Evidence</h3>
                      <button 
                        onClick={() => setExpandedAlert(null)}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                      >
                        <FaTimes className="text-xl" />
                      </button>
                    </div>
                    <div className="p-6">
                      <img 
                        src={alerts.find(a => a._id === expandedAlert)?.photo} 
                        alt="Alert evidence" 
                        className="max-w-full max-h-[70vh] mx-auto rounded-lg border border-gray-200"
                      />
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Uploaded: {formatDateTime(alerts.find(a => a._id === expandedAlert)?.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {sortedAlerts.length > itemsPerPage && (
              <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, sortedAlerts.length)}
                  </span>{' '}
                  of <span className="font-medium">{sortedAlerts.length}</span> alerts
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md flex items-center gap-1 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-primary border border-primary hover:bg-primary/10'}`}
                  >
                    <FaChevronLeft className="text-sm" /> Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-primary text-white' : 'bg-white text-primary border border-primary hover:bg-primary/10'}`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md flex items-center gap-1 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-primary border border-primary hover:bg-primary/10'}`}
                  >
                    Next <FaChevronRight className="text-sm" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Status Update Modal */}
        <Modal
          isOpen={isStatusModalOpen}
          onRequestClose={() => setIsStatusModalOpen(false)}
          style={{
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000
            },
            content: {
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0',
              maxWidth: '90%',
              width: '32rem',
              margin: '0 auto',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">Update Alert Status</h2>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleStatusSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={statusForm.status}
                    onChange={handleStatusChange}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                
                {statusForm.status === 'Processing' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Security Staff</label>
                    <select
                      name="assignedTo"
                      value={statusForm.assignedTo}
                      onChange={handleStatusChange}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    >
                      <option value="">Select staff member</option>
                      {securityStaff.map(staff => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} ({staff.position})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
                  <textarea
                    name="actionTaken"
                    value={statusForm.actionTaken}
                    onChange={handleStatusChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    placeholder="Describe what action was taken..."
                    required={statusForm.status === 'Resolved'}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors shadow-md"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Alert Details Modal */}
        <Modal
          isOpen={isDetailsModalOpen}
          onRequestClose={() => setIsDetailsModalOpen(false)}
          style={{
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000
            },
            content: {
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0',
              maxWidth: '90%',
              width: '40rem',
              margin: '0 auto',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          {currentAlert && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Alert Details</h2>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{currentAlert.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <p>{getPriorityBadge(currentAlert.priority || 'Medium')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p>{getStatusBadge(currentAlert.status)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{currentAlert.location}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Timeline</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Reported At</p>
                      <p className="font-medium">{formatDateTime(currentAlert.createdAt)}</p>
                    </div>
                    {currentAlert.verifiedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Resolved At</p>
                        <p className="font-medium">{formatDateTime(currentAlert.verifiedAt)}</p>
                      </div>
                    )}
                    {currentAlert.assignedTo && (
                      <div>
                        <p className="text-sm text-gray-500">Assigned To</p>
                        <p className="font-medium">
                          {currentAlert.assignedTo.name} ({currentAlert.assignedTo.position})
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-800">{currentAlert.description}</p>
              </div>
              
              {currentAlert.actionTaken && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Action Taken</h3>
                  <p className="text-gray-800">{currentAlert.actionTaken}</p>
                </div>
              )}
              
              {currentAlert.photo && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Evidence Photo</h3>
                  <img 
                    src={currentAlert.photo} 
                    alt="Alert evidence" 
                    className="max-w-full rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setExpandedAlert(currentAlert._id);
                    }}
                  />
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </motion.div>
    </div>
  );
};

export default EmergencyAlertsAdmin;