import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";

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

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found!");
        return;
      }
  
      console.log("Fetching residents...");
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("API Response:", response.data);
  
      if (response.data && Array.isArray(response.data.users)) {
        const filteredResidents = response.data.users.filter(user => user.role === "resident");
        setResidents(filteredResidents);  // Only store residents
      } else {
        console.error("Unexpected API response format:", response.data);
        setResidents([]); // Prevent errors by ensuring it's always an array
      }
    } catch (err) {
      console.error("Error fetching residents:", err.response?.data || err.message);
      toast.error("Failed to fetch residents.");
      setResidents([]);
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
            console.log("No token found in localStorage");
            return;
        }

        // Validate required fields
        if (!residentData.name || !residentData.email || !residentData.flat_no) {
            toast.error("Please fill in all required fields.");
            console.log("Validation failed. Missing required fields:", residentData);
            return;
        }

        const newResident = { 
            ...residentData, 
            role: "resident"  // Ensure the role is correctly assigned
        };

        console.log("Sending request to add resident:", newResident);

        const response = await axios.post("http://localhost:5000/api/auth/register", newResident, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        console.log("Resident added successfully:", response.data);
        toast.success("Resident added successfully!");
        fetchResidents();  // Refresh the resident list
        setShowModal(false);  // Close the modal

    } catch (err) {
        console.error("Add resident error:", err.response?.data || err.message);

        if (err.response?.status === 400) {
            toast.error(err.response.data.message || "Invalid input data.");
            console.log("Error 400 - Invalid input:", err.response.data);
        } else if (err.response?.status === 401) {
            toast.error("Unauthorized. Please log in again.");
            console.log("Error 401 - Unauthorized");
        } else {
            toast.error("Failed to add resident. Please try again.");
            console.log("Unexpected error:", err);
        }
    }
};

  
  
  const handleEditResident = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/admin/update/${editingResident._id}`, residentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Resident updated successfully!");
      fetchResidents();
      setShowModal(false);
      setEditingResident(null);
    } catch (err) {
      toast.error("Failed to update resident.");
      console.error("Edit resident error:", err);
    }
  };

  const handleDeleteResident = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resident?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/residents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Resident deleted successfully!");
      fetchResidents();
    } catch (err) {
      toast.error("Failed to delete resident.");
      console.error("Delete resident error:", err);
    }
  };

  const openModal = (resident = null) => {
    setEditingResident(resident);
    setResidentData(
      resident || { name: "", email: "", phone: "", flat_no: "", password: "" }
    );
    setShowModal(true);
  };

  const filteredResidents = residents.filter((resident) =>
    Object.values(resident).some(
      (value) => typeof value === "string" && value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="p-10 m-10 min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-primary">Resident Management</h2>

      {/* Search Bar */}
      <div className="mb-6 flex justify-between w-full md:w-3/4">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search Resident"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-3 w-full rounded-full shadow-md pl-10 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <FaSearch className="absolute left-3 top-4 text-gray-500" />
        </div>
        <button
          onClick={() => openModal()}
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Add Resident
        </button>
      </div>

      {/* Residents Table */}
      <div className="h-full w-full overflow-scroll justify-center">
            <table className="w-full min-w-max border-collapse shadow-lg rounded-lg table-auto text-left">
          <thead>
            <tr className="bg-primary text-white text-center">
              <th className="border p-3">Name</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Phone</th>
              <th className="border p-3">Flat No</th>
              <th className="border p-3">Role</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResidents.length > 0 ? (
              filteredResidents.map((resident) => (
                <tr key={resident._id} className="border text-center bg-white hover:bg-gray-100">
                  <td className="border p-3">{resident.name}</td>
                  <td className="border p-3">{resident.email}</td>
                  <td className="border p-3">{resident.phone}</td>
                  <td className="border p-3">{resident.flat_no}</td>
                  <td className="border p-3">{resident.role}</td>
                  <td className="border p-3">{resident.approval_status}</td>
                  <td className="p-3 flex justify-center items-center gap-3">
                    <button
                      onClick={() => openModal(resident)}
                      className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteResident(resident._id)}
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center border p-3 text-gray-500">
                  No residents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h3 className="text-lg font-bold mb-3">
              {editingResident ? "Edit Resident" : "Add Resident"}
            </h3>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={residentData.name}
              onChange={handleInputChange}
              className="border p-2 w-full rounded mb-2"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={residentData.email}
              onChange={handleInputChange}
              className="border p-2 w-full rounded mb-2"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={residentData.phone}
              onChange={handleInputChange}
              className="border p-2 w-full rounded mb-2"
            />
            <input
              type="text"
              name="flat_no"
              placeholder="Flat No"
              value={residentData.flat_no}
              onChange={handleInputChange}
              className="border p-2 w-full rounded mb-2"
            />
             <input
              type="password"
              name="password"
              placeholder="Password"
              value={residentData.password}
              onChange={handleInputChange}
              className="border p-2 w-full rounded mb-2"
            />
            <button
              onClick={editingResident ? handleEditResident : handleAddResident}
              className="bg-green-500 text-white px-4 py-2 rounded">
              Save
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="bg-red-500 text-white px-4 py-2 rounded ml-2">
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentManagement;
