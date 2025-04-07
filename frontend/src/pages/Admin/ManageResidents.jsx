import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaPhone } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ResidentManagement = () => {
  const [residents, setResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [residentData, setResidentData] = useState({
    name: "",
    email: "",
    phone: "",
    flat_no: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    flat: "all",
    sort: "newest"
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found!");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", response.data); // Debug log

      if (response.data?.users) {
        const filteredResidents = response.data.users.filter(user => user.role === "resident");
        setResidents(filteredResidents);
      } else {
        setResidents([]);
      }
    } catch (err) {
      console.error("Error fetching residents:", err.response?.data || err.message);
      toast.error("Failed to fetch residents.");
      setResidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setResidentData({ ...residentData, [e.target.name]: e.target.value });
  };

  const handleAddResident = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }

      if (!residentData.name || !residentData.email || !residentData.flat_no || !residentData.password) {
        toast.error("Please fill in all required fields.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        { 
          ...residentData, 
          role: "resident",
          phone: residentData.phone || undefined // Send undefined if phone is empty
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Resident added successfully!");
      fetchResidents();
      setShowModal(false);
      setResidentData({ name: "", email: "", phone: "", flat_no: "", password: "" });
    } catch (err) {
      console.error("Error adding resident:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to add resident.");
    }
  };

  const handleEditResident = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${editingResident._id}`,
        {
          name: residentData.name,
          email: residentData.email,
          phone: residentData.phone || undefined,
          flat_no: residentData.flat_no
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Resident updated successfully!");
      fetchResidents();
      setShowModal(false);
      setEditingResident(null);
    } catch (err) {
      console.error("Error updating resident:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update resident.");
    }
  };

  const handleDeleteResident = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resident?")) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Delete response:", response.data); // Debug log

      toast.success("Resident deleted successfully!");
      fetchResidents();
    } catch (err) {
      console.error("Error deleting resident:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete resident.");
    }
  };

  const openModal = (resident = null) => {
    setEditingResident(resident);
    setResidentData(
      resident 
        ? { 
            name: resident.name || "",
            email: resident.email || "",
            phone: resident.phone || "",
            flat_no: resident.flat_no || "",
            password: "" // Don't pre-fill password for security
          }
        : { name: "", email: "", phone: "", flat_no: "", password: "" }
    );
    setShowModal(true);
  };

  // Apply filters
  const filteredResidents = residents.filter((resident) => {
    // Search filter
    const matchesSearch = 
      resident.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.flat_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = 
      filters.status === "all" || 
      resident.approval_status === filters.status;

    // Flat filter
    const matchesFlat = 
      filters.flat === "all" || 
      resident.flat_no === filters.flat;

    return matchesSearch && matchesStatus && matchesFlat;
  });

  // Sort residents
  const sortedResidents = [...filteredResidents].sort((a, b) => {
    if (filters.sort === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  // Get unique flats for filter
  const uniqueFlats = [...new Set(residents.map(resident => resident.flat_no).filter(Boolean))];
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedResidents.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(sortedResidents.length / itemsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-2xl m-10 md:text-3xl font-bold text-center text-primary mb-6">
          Resident Management
        </h1>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search residents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-primary-light text-white px-4 py-3 rounded-lg hover:bg-primary transition-colors"
            >
              <FaFilter /> Filters
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPlus /> Add Resident
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-4 rounded-lg shadow-md mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">
                    Approval Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">
                    Flat Number
                  </label>
                  <select
                    value={filters.flat}
                    onChange={(e) => setFilters({...filters, flat: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="all">All Flats</option>
                    {uniqueFlats.map(flat => (
                      <option key={flat} value={flat}>{flat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({...filters, sort: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
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
            {/* Residents Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Flat No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((resident) => (
                      <motion.tr 
                        key={resident._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold">
                              {resident.name?.charAt(0) || "R"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-primary-dark">
                                {resident.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resident.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaPhone className="mr-2 text-primary" />
                            {resident.phone || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resident.flat_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            resident.approval_status === "approved"
                              ? "bg-green-100 text-green-800"
                              : resident.approval_status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {resident.approval_status || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(resident)}
                              className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteResident(resident._id)}
                              className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No residents found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredResidents.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredResidents.length)}
              </span>{" "}
              of <span className="font-medium">{filteredResidents.length}</span> results
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark"}`}
              >
                Previous
              </button>
              {[...Array(Math.ceil(filteredResidents.length / itemsPerPage)).keys()].map((num) => (
                <button
                  key={num + 1}
                  onClick={() => paginate(num + 1)}
                  className={`px-3 py-1 rounded-md ${currentPage === num + 1 ? "bg-secondary text-white" : "bg-white text-primary hover:bg-gray-100"}`}
                >
                  {num + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastItem >= filteredResidents.length}
                className={`px-3 py-1 rounded-md ${indexOfLastItem >= filteredResidents.length ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark"}`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-bold mb-4 text-primary-dark">
                  {editingResident ? "Edit Resident" : "Add Resident"}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={residentData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={residentData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={residentData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flat No*</label>
                    <input
                      type="text"
                      name="flat_no"
                      placeholder="Flat Number"
                      value={residentData.flat_no}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>

                  {!editingResident && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={residentData.password}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary"
                        required={!editingResident}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingResident ? handleEditResident : handleAddResident}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingResident ? "Update" : "Add"} Resident
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResidentManagement;