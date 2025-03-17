import { useState, useEffect } from "react";

const SecurityDashboard = () => {
  const [visitorRequests, setVisitorRequests] = useState([]);
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [staffLogs, setStaffLogs] = useState([]);

  useEffect(() => {
    // Mock Data for Testing UI
    setVisitorRequests([
      { _id: "1", name: "Rahul Sharma", reason: "Delivery" },
      { _id: "2", name: "Amit Singh", reason: "Guest Visit" },
    ]);

    setVehicleLogs([
      { _id: "1", vehicleNumber: "HP 01 A 1234", status: "Allowed" },
      { _id: "2", vehicleNumber: "PB 10 B 5678", status: "Denied" },
    ]);

    setStaffLogs([
      { _id: "1", name: "Ramesh Kumar", entryTime: "10:00 AM" },
      { _id: "2", name: "Sita Verma", entryTime: "11:30 AM" },
    ]);
  }, []);

  // Simulate Approve/Reject Actions
  const handleVisitorAction = (id, status) => {
    alert(`Visitor ID ${id} marked as ${status}`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-6">Security Dashboard</h1>

      {/* Visitor Requests Section */}
      <div className="bg-white p-4 shadow-md rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Visitor Requests</h2>
        {visitorRequests.length === 0 ? (
          <p>No pending visitor requests.</p>
        ) : (
          <ul>
            {visitorRequests.map((visitor) => (
              <li key={visitor._id} className="flex justify-between items-center border-b py-2">
                <span>{visitor.name} - {visitor.reason}</span>
                <div>
                  <button
                    onClick={() => handleVisitorAction(visitor._id, "approved")}
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVisitorAction(visitor._id, "rejected")}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Vehicle Entry Logs */}
      <div className="bg-white p-4 shadow-md rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Vehicle Entry Logs</h2>
        {vehicleLogs.length === 0 ? (
          <p>No recent vehicle entries.</p>
        ) : (
          <ul>
            {vehicleLogs.map((vehicle) => (
              <li key={vehicle._id} className="border-b py-2">
                {vehicle.vehicleNumber} - {vehicle.status}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Staff Logs */}
      <div className="bg-white p-4 shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Staff Entry Logs</h2>
        {staffLogs.length === 0 ? (
          <p>No recent staff activity.</p>
        ) : (
          <ul>
            {staffLogs.map((staff) => (
              <li key={staff._id} className="border-b py-2">
                {staff.name} - {staff.entryTime}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;
