import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Users, Shield, Car, Bell, UserCheck, Menu } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white h-screen ${isOpen ? "w-64" : "w-16"} transition-all duration-300 p-4`}>
        <button onClick={toggleSidebar} className="text-white mb-4 focus:outline-none">
          <Menu size={24} />
        </button>
        <ul className="space-y-4">
          <li>
            <Link to="/dashboard" className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded">
              <Home size={24} />
              {isOpen && <span>Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link to="/residents" className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded">
              <Users size={24} />
              {isOpen && <span>Residents</span>}
            </Link>
          </li>
          <li>
            <Link to="/guards" className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded">
              <Shield size={24} />
              {isOpen && <span>Guards</span>}
            </Link>
          </li>
          <li>
            <Link to="/visitors" className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded">
              <UserCheck size={24} />
              {isOpen && <span>Visitors</span>}
            </Link>
          </li>
          <li>
            <Link to="/vehicles" className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded">
              <Car size={24} />
              {isOpen && <span>Vehicles</span>}
            </Link>
          </li>
          <li>
            <Link to="/staff" className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded">
              <Users size={24} />
              {isOpen && <span>Staff</span>}
            </Link>
          </li>
          <li>
            <Link to="/alerts" className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded">
              <Bell size={24} />
              {isOpen && <span>Alerts</span>}
            </Link>
          </li>
        </ul>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold">Welcome to Society Security System</h1>
      </div>
    </div>
  );
};

export default Sidebar;
