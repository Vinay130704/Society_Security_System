import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";

const ManageUser = () => {
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState("");
  const [rejectRemark, setRejectRemark] = useState("");
  const [selectedRejectId, setSelectedRejectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Unauthorized: Token missing!");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.users) {
          setResidents(response.data.users);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError("Failed to fetch residents.");
        toast.error("Failed to fetch residents.");
        console.error("Error fetching residents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, []);

  const approveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/approve/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setResidents((prev) =>
        prev.map((resident) =>
          resident._id === userId ? { ...resident, approval_status: "approved" } : resident
        )
      );
    } catch (err) {
      toast.error("Approval failed. Try again.");
      console.error("Approval error:", err);
    }
  };

  const rejectUser = async () => {
    if (!rejectRemark.trim()) {
      toast.warn("Please enter a remark for rejection.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/reject/${selectedRejectId}`,
        { remark: rejectRemark },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setResidents((prev) =>
        prev.map((resident) =>
          resident._id === selectedRejectId
            ? { ...resident, approval_status: "rejected", remark: rejectRemark }
            : resident
        )
      );
      setRejectRemark("");
      setSelectedRejectId(null);
    } catch (err) {
      toast.error("Rejection failed. Try again.");
      console.error("Rejection error:", err);
    }
  };

  // Search filter logic
  const filteredResidents = residents.filter((resident) =>
    Object.values(resident).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResidents = filteredResidents.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredResidents.length / itemsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="p-10 m-10 min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-primary text-center">Manage Users</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Search Bar */}
      <div className="mb-6 flex justify-center w-full">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search User"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-3 w-full rounded-full shadow-md pl-10 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <FaSearch className="absolute left-3 top-4 text-gray-500" />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto w-full flex justify-center">
            <table className="w-full lg:w-3/4 border-collapse shadow-lg rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-primary text-white text-center">
                  <th className="border p-3">Name</th>
                  <th className="border p-3">Email</th>
                  <th className="border p-3">Role</th>
                  <th className="border p-3">Flat No</th>
                  <th className="border p-3">Approval Status</th>
                  <th className="border p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentResidents.length > 0 ? (
                  currentResidents.map((resident) => (
                    <tr key={resident._id} className="border text-center bg-white hover:bg-gray-100">
                      <td className="border p-3 capitalize">{resident.name || "N/A"}</td>
                      <td className="border p-3">{resident.email || "N/A"}</td>
                      <td className="border p-3">{resident.role || "N/A"}</td>
                      <td className="border p-3">{resident.flat_no || "N/A"}</td>
                      <td className="border p-3">
                        <span
                          className={`font-bold ${
                            resident.approval_status === "approved"
                              ? "text-green-600"
                              : resident.approval_status === "rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {resident.approval_status}
                        </span>
                      </td>
                      <td className="p-3 flex justify-center items-center gap-3">
                        {resident.approval_status === "pending" && (
                          <>
                            <button
                              onClick={() => approveUser(resident._id)}
                              className="bg-secondary hover:bg-blue-700 text-white px-3 py-1 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setSelectedRejectId(resident._id)}
                              className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center border p-3 text-gray-500">
                      No residents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-4">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="bg-gray-300 px-4 py-2 rounded">
              Previous
            </button>
            <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastItem >= filteredResidents.length} className="bg-gray-300 px-4 py-2 rounded">
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUser;
