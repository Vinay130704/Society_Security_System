import { useEffect, useState } from "react";

const VisitorLogs = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitorLogs();
  }, []);

  const fetchVisitorLogs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/visitor/invite"); // Adjust API URL
      const data = await response.json();
      setVisitors(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching visitor logs:", error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Visitor Entry Logs</h2>

    

      {loading ? (
        <p className="text-center text-gray-600">Loading visitor logs...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full lg:w-3/4 mx-auto border-collapse shadow-lg rounded-lg overflow-hidden bg-white">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3">Visitor Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Flat No</th>
                <th className="p-3">Entry Time</th>
                <th className="p-3">Exit Time</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length > 0 ? (
                visitors.map((visitor) => (
                  <tr key={visitor._id} className="border-b text-center">
                    <td className="p-3">{visitor.name}</td>
                    <td className="p-3">{visitor.phone}</td>
                    <td className="p-3">{visitor.flat_no}</td>
                    <td className="p-3">{visitor.entry_time ? new Date(visitor.entry_time).toLocaleString() : "N/A"}</td>
                    <td className="p-3">{visitor.exit_time ? new Date(visitor.exit_time).toLocaleString() : "Pending"}</td>
                    <td className={`p-3 ${visitor.entry_status === "granted" ? "text-green-600" : visitor.entry_status === "denied" ? "text-red-600" : "text-yellow-600"}`}>
                      {visitor.entry_status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-600">No visitor logs available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VisitorLogs; // ✅ Correct default export
