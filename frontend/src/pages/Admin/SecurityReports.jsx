import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaFileAlt, FaCalendarAlt, FaUserShield } from 'react-icons/fa';
import { MdSecurity, MdWarning, MdCheckCircle } from 'react-icons/md';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SecurityReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    type: 'all',
    fromDate: null,
    toDate: null
  });
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/security/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data.reports || []);
    } catch (error) {
      toast.error('Failed to fetch security reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/security/reports/${reportId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Report status updated');
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update report');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      filters.status === 'all' || 
      report.status === filters.status;

    const matchesSeverity = 
      filters.severity === 'all' || 
      report.severity === filters.severity;

    const matchesType = 
      filters.type === 'all' || 
      report.type === filters.type;

    const matchesDate = 
      (!filters.fromDate || new Date(report.createdAt) >= new Date(filters.fromDate)) &&
      (!filters.toDate || new Date(report.createdAt) <= new Date(filters.toDate));

    return matchesSearch && matchesStatus && matchesSeverity && matchesType && matchesDate;
  });

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <MdWarning className="text-red-500 text-xl" />;
      case 'medium':
        return <MdWarning className="text-yellow-500 text-xl" />;
      case 'low':
        return <MdWarning className="text-green-500 text-xl" />;
      default:
        return <MdSecurity className="text-secondary text-xl" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>;
      case 'resolved':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Resolved</span>;
      case 'investigating':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Investigating</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Unknown</span>;
    }
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
            <MdSecurity className="text-3xl text-secondary mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-primary-dark">Security Incident Reports</h1>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 bg-primary-light text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors"
            >
              <FaFilter /> Filters
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
              className="bg-white p-4 rounded-lg shadow-md mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters({...filters, severity: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                  >
                    <option value="all">All Severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                  >
                    <option value="all">All Types</option>
                    <option value="theft">Theft</option>
                    <option value="vandalism">Vandalism</option>
                    <option value="suspicious">Suspicious Activity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">Date Range</label>
                  <div className="flex gap-2">
                    <div className="relative w-full">
                      <DatePicker
                        selected={filters.fromDate}
                        onChange={(date) => setFilters({...filters, fromDate: date})}
                        selectsStart
                        startDate={filters.fromDate}
                        endDate={filters.toDate}
                        placeholderText="From"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                      />
                      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                    <div className="relative w-full">
                      <DatePicker
                        selected={filters.toDate}
                        onChange={(date) => setFilters({...filters, toDate: date})}
                        selectsEnd
                        startDate={filters.fromDate}
                        endDate={filters.toDate}
                        minDate={filters.fromDate}
                        placeholderText="To"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                      />
                      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Reports Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Report</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Reported By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <motion.tr 
                        key={report._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`hover:bg-gray-50 ${expandedReport === report._id ? 'bg-gray-50' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaFileAlt className="text-secondary mr-3" />
                            <div>
                              <div className="text-sm font-medium text-primary-dark">{report.title}</div>
                              {expandedReport === report._id && (
                                <div className="text-xs text-gray-500 mt-1">{report.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSeverityIcon(report.severity)}
                            <span className="ml-2 capitalize">{report.severity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {report.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white text-xs">
                              {report.reportedBy?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-primary-dark">{report.reportedBy?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{report.reportedBy?.role || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                              className="text-secondary hover:text-secondary-dark text-sm"
                            >
                              {expandedReport === report._id ? 'Hide' : 'View'}
                            </button>
                            {report.status !== 'resolved' && (
                              <button
                                onClick={() => handleStatusChange(report._id, 'resolved')}
                                className="text-green-600 hover:text-green-800 text-sm flex items-center"
                              >
                                <MdCheckCircle className="mr-1" /> Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No security reports found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">High Severity</p>
                  <p className="text-2xl font-bold text-primary-dark">
                    {reports.filter(r => r.severity === 'high').length}
                  </p>
                </div>
                <MdWarning className="text-red-500 text-3xl" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Medium Severity</p>
                  <p className="text-2xl font-bold text-primary-dark">
                    {reports.filter(r => r.severity === 'medium').length}
                  </p>
                </div>
                <MdWarning className="text-yellow-500 text-3xl" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Low Severity</p>
                  <p className="text-2xl font-bold text-primary-dark">
                    {reports.filter(r => r.severity === 'low').length}
                  </p>
                </div>
                <MdWarning className="text-green-500 text-3xl" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-secondary"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Reports</p>
                  <p className="text-2xl font-bold text-primary-dark">
                    {reports.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <FaFileAlt className="text-secondary text-3xl" />
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SecurityReports;