import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";

const SecurityGuardManagement = () => {
  const [guards, setGuards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);
  const [guardData, setGuardData] = useState({
    name: "",
    email: "",
    phone: "",
    shift: "",
    password: "",
    assignedArea: "",
  });

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGuards(response.data || []);
    } catch (err) {
      toast.error("Failed to fetch security guards.");
      setGuards([]);
    }
  };

  const handleInputChange = (e) => {
    setGuardData({ ...guardData, [e.target.name]: e.target.value });
  };

  const handleAddGuard = async () => {
    try {
      const token = localStorage.getItem("token");
      const newGuard = { ...guardData, role: "security_guard" };
      await axios.post("http://localhost:5000/api/admin/users", newGuard, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      toast.success("Security guard added successfully!");
      fetchGuards();
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to add security guard.");
    }
  };

  const handleEditGuard = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/admin/users/${editingGuard._id}`, guardData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Security guard updated successfully!");
      fetchGuards();
      setShowModal(false);
      setEditingGuard(null);
    } catch (err) {
      toast.error("Failed to update security guard.");
    }
  };

  const handleDeleteGuard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this security guard?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Security guard deleted successfully!");
      fetchGuards();
    } catch (err) {
      toast.error("Failed to delete security guard.");
    }
  };

  const handleAssignGuard = async (id, assignedArea) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/admin/users/${id}/assign`, { assignedArea }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Security guard assigned successfully!");
      fetchGuards();
    } catch (err) {
      toast.error("Failed to assign security guard.");
    }
  };

  const handleRemoveAssignment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/admin/users/${id}/unassign`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Security guard removed from assignment!");
      fetchGuards();
    } catch (err) {
      toast.error("Failed to remove assignment.");
    }
  };

  return (
    <div className="p-10 m-10 min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-primary">Security Guard Management</h2>
      <div className="mb-6 flex justify-between w-full md:w-3/4">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search Guard"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-3 w-full rounded-full shadow-md pl-10"
          />
          <FaSearch className="absolute left-3 top-4 text-gray-500" />
        </div>
        <button onClick={() => setShowModal(true)} className="bg-green-500 text-white px-4 py-2 rounded">
          <FaPlus className="mr-2" /> Add Guard
        </button>
      </div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-primary text-white text-center">
            <th className="border p-3">Name</th>
            <th className="border p-3">Email</th>
            <th className="border p-3">Phone</th>
            <th className="border p-3">Shift</th>
            <th className="border p-3">Assigned Area</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {guards.length > 0 ? (
            guards.map((guard) => (
              <tr key={guard._id} className="border text-center bg-white hover:bg-gray-100">
                <td className="border p-3">{guard.name}</td>
                <td className="border p-3">{guard.email}</td>
                <td className="border p-3">{guard.phone}</td>
                <td className="border p-3">{guard.shift}</td>
                <td className="border p-3">{guard.assignedArea || "Not Assigned"}</td>
                <td className="p-3 flex justify-center gap-3">
                  <button onClick={() => setEditingGuard(guard)} className="bg-blue-500 text-white px-3 py-1 rounded">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteGuard(guard._id)} className="bg-red-500 text-white px-3 py-1 rounded">
                    <FaTrash />
                  </button>
                  <button onClick={() => handleAssignGuard(guard._id, "Main Gate")} className="bg-yellow-500 text-white px-3 py-1 rounded">
                    <FaUserShield /> Assign
                  </button>
                  <button onClick={() => handleRemoveAssignment(guard._id)} className="bg-gray-500 text-white px-3 py-1 rounded">
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center border p-3 text-gray-500">No guards found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SecurityGuardManagement;