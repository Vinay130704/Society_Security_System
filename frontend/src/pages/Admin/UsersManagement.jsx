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
          timeout: 5000
        });

        if (response.data?.success && response.data.users) {
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
    const toastId = toast.loading("Approving user..."); // Show loading toast
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.update(toastId, {
          render: "Unauthorized: Token missing!",
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/approve/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      toast.update(toastId, {
        render: response.data.message,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setResidents((prev) =>
        prev.map((resident) =>
          resident._id === userId ? { ...resident, approval_status: "approved" } : resident
        )
      );
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Approval failed. Try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
      console.error("Approval error:", err);
    }
  };

  const rejectUser = async () => {
    if (!rejectRemark.trim()) {
      toast.warn("Please enter a remark for rejection.");
      return;
    }

    const toastId = toast.loading("Rejecting user..."); // Show loading toast
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.update(toastId, {
          render: "Unauthorized: Token missing!",
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/reject/${selectedRejectId}`,
        { remark: rejectRemark },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      toast.update(toastId, {
        render: response.data.message,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

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
      toast.update(toastId, {
        render: err.response?.data?.message || "Rejection failed. Try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
      console.error("Rejection error:", err);
    }
  };

  // Search filter logic
  const filteredResidents = residents.filter((resident) =>
    Object.values(resident).some(
      (value) =>
        value &&
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
    <div className="p-10 m-10 min-h-screen flex flex-col items-center ">
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
            className="border p-3 w-full rounded-full shadow-md pl-10 focus:outline-none focus:ring-2 focus:ring-secondary text-text"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-text">Loading users...</p>
      ) : (
        <>
          {/* Table */}
          <div className="h-full w-full overflow-scroll justify-center">
            <table className="w-full min-w-max border-collapse shadow-lg rounded-lg table-auto text-left">
              <thead>
                <tr className="bg-primary text-white text-center">
                  <th className="border border-background p-3">Name</th>
                  <th className="border border-background p-3">Email</th>
                  <th className="border border-background p-3">Role</th>
                  <th className="border border-background p-3">Flat No</th>
                  <th className="border border-background p-3">Approval Status</th>
                  <th className="border border-background p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentResidents.length > 0 ? (
                  currentResidents.map((resident) => (
                    <tr key={resident._id} className="border border-background text-center bg-white hover:bg-gray-100">
                      <td className="border border-background p-3 capitalize text-text">{resident.name || "N/A"}</td>
                      <td className="border border-background p-3 text-text">{resident.email || "N/A"}</td>
                      <td className="border border-background p-3 capitalize text-text">{resident.role || "N/A"}</td>
                      <td className="border border-background p-3 capitalize text-text">{resident.flat_no || "N/A"}</td>
                      <td className="border border-background p-3 capitalize">
                        <span
                          className={`font-bold ${resident.approval_status === "approved"
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
                            {selectedRejectId === resident._id && (
                              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                  <h3 className="text-lg font-bold mb-2 text-text">Enter Rejection Remark</h3>
                                  <textarea
                                    className="w-full p-2 border rounded text-text"
                                    placeholder="Enter reason for rejection"
                                    value={rejectRemark}
                                    onChange={(e) => setRejectRemark(e.target.value)}
                                  />
                                  <div className="flex justify-end mt-3 gap-2">
                                    <button
                                      onClick={() => setSelectedRejectId(null)}
                                      className="bg-gray-500 text-white px-4 py-2 rounded"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={rejectUser}
                                      className="bg-red-600 text-white px-4 py-2 rounded"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center border border-background p-3 text-text">
                      No residents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-300"
                } text-text`}
            >
              Previous
            </button>

            {[...Array(Math.ceil(filteredResidents.length / itemsPerPage)).keys()].map((num) => (
              <button
                key={num + 1}
                onClick={() => paginate(num + 1)}
                className={`px-4 py-2 rounded ${currentPage === num + 1 ? "bg-primary text-white" : "bg-gray-300 text-text"
                  }`}
              >
                {num + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastItem >= filteredResidents.length}
              className={`px-4 py-2 rounded ${indexOfLastItem >= filteredResidents.length
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-300"
                } text-text`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUser;