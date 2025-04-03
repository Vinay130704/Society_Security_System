import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";

const VisitorLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [visitorLogs, setVisitorLogs] = useState([]);

  useEffect(() => {
    const fetchVisitorLogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/visitor/logs");
        
        console.log("Full API Response:", response.data); // Debugging
    
        if (Array.isArray(response.data.visitors)) {
          setVisitorLogs(response.data.visitors); // Store the array only
        } else {
          setVisitorLogs([]); // Fallback in case visitors is not an array
        }
      } catch (error) {
        console.error("Error fetching visitor logs:", error);
      }
    };
    

    fetchVisitorLogs();
  }, []);

  const filteredLogs = visitorLogs.filter((visitor) =>
    visitor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-10 m-10 min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-primary">Visitor Logs</h2>

      {/* Search Bar */}
      <div className="mb-6 flex justify-between w-full md:w-3/4">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search Visitor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-3 w-full rounded-full shadow-md pl-10 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <FaSearch className="absolute left-3 top-4 text-gray-500" />
        </div>
      </div>

      {/* Visitor Logs Table */}
      <div className="h-full w-full overflow-scroll justify-center">
        <table className="w-full min-w-max border-collapse shadow-lg rounded-lg table-auto text-left">
          <thead>
            <tr className="bg-primary text-white text-center">
              <th className="border p-3">Name</th>
              <th className="border p-3">Phone</th>
              <th className="border p-3">Flat No</th>
              <th className="border p-3">Resident Name</th>
              <th className="border p-3">Entry Status</th>
              <th className="border p-3">Entry Time</th>
              <th className="border p-3">Exit Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((visitor) => (
                <tr key={visitor._id} className="border text-center bg-white hover:bg-gray-100">
                  <td className="border p-3">{visitor.name}</td>
                  <td className="border p-3">{visitor.phone}</td>
                  <td className="border p-3">{visitor.flat_no}</td>
                  <td className="border p-3">{visitor.resident_id?.name || "N/A"}</td>
                  <td className="border p-3">{visitor.entry_status}</td>
                  <td className="border p-3">
                    {visitor.entry_time ? new Date(visitor.entry_time).toLocaleString() : "-"}
                  </td>
                  <td className="border p-3">
                    {visitor.exit_time ? new Date(visitor.exit_time).toLocaleString() : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-5 text-center">No visitor logs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitorLogs;
