import { useEffect, useState } from "react";
import { FaSearch, FaUser, FaHome, FaPhone, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

const VisitorLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchVisitorLogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/visitor/log", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (Array.isArray(response.data.visitors)) {
          setVisitorLogs(response.data.visitors);
        } else {
          setVisitorLogs([]);
          toast.warning("No visitor data found");
        }
      } catch (error) {
        console.error("Error fetching visitor logs:", error);
        toast.error("Failed to load visitor logs");
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorLogs();
  }, []);

  // Filter visitors based on search query
  const filteredLogs = visitorLogs.filter((visitor) =>
    visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visitor.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visitor.flat_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (visitor.resident_id?.name && visitor.resident_id.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Approved</span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejected</span>;
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <FaUser className="text-3xl text-secondary mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-primary-dark">Visitor Management</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <>
            {/* Visitor Logs Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-primary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaUser className="mr-2" /> Visitor
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaPhone className="mr-2" /> Contact
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaHome className="mr-2" /> Flat
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Resident
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaSignInAlt className="mr-2" /> Entry
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaSignOutAlt className="mr-2" /> Exit
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentLogs.length > 0 ? (
                      currentLogs.map((visitor) => (
                        <motion.tr 
                          key={visitor._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold">
                                {visitor.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-primary-dark">{visitor.name}</div>
                                <div className="text-xs text-gray-500">{visitor.purpose || "Visit"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {visitor.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {visitor.flat_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {visitor.resident_id?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {visitor.resident_id?.phone || ""}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(visitor.entry_status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {visitor.entry_time ? new Date(visitor.entry_time).toLocaleString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {visitor.exit_time ? new Date(visitor.exit_time).toLocaleString() : "-"}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No visitor logs found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {filteredLogs.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredLogs.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredLogs.length}</span> visitors
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark"}`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md ${currentPage === number ? "bg-secondary text-white" : "bg-white text-primary hover:bg-gray-100"}`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark"}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-secondary"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Visitors</p>
                    <p className="text-2xl font-bold text-primary-dark">
                      {visitorLogs.length}
                    </p>
                  </div>
                  <FaUser className="text-secondary text-3xl" />
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-primary-dark">
                      {visitorLogs.filter(v => v.entry_status === "approved").length}
                    </p>
                  </div>
                  <FaSignInAlt className="text-green-500 text-3xl" />
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-primary-dark">
                      {visitorLogs.filter(v => v.entry_status === "pending").length}
                    </p>
                  </div>
                  <FaUser className="text-yellow-500 text-3xl" />
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-primary-dark">
                      {visitorLogs.filter(v => v.entry_status === "rejected").length}
                    </p>
                  </div>
                  <FaSignOutAlt className="text-red-500 text-3xl" />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VisitorLogs;