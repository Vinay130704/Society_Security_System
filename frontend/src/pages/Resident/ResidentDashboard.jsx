import { useState } from "react";

const ResidentDashboard = () => {
  const [visitorRequests, setVisitorRequests] = useState([
    { id: 1, name: "Amit Sharma", status: "Pending" },
    { id: 2, name: "Neha Verma", status: "Approved" },
  ]);

  const handleRequest = (id, newStatus) => {
    setVisitorRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center text-blue-600">Resident Dashboard</h1>
      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        {visitorRequests.map((visitor) => (
          <div key={visitor.id} className="p-4 bg-white shadow-md rounded-xl">
            <h2 className="text-lg font-semibold">{visitor.name}</h2>
            <p className={`text-sm ${visitor.status === "Approved" ? "text-green-600" : "text-red-600"}`}>
              {visitor.status}
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => handleRequest(visitor.id, "Approved")} className="px-4 py-2 bg-green-500 text-white rounded">
                Approve
              </button>
              <button onClick={() => handleRequest(visitor.id, "Rejected")} className="px-4 py-2 bg-red-500 text-white rounded">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResidentDashboard;
