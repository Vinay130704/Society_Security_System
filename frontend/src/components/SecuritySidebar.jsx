import { useState } from "react";
import { Outlet } from "react-router-dom";
import { 
  QrCode,
  ShieldCheck,
  User,
  AlertTriangle,
  Menu,
  LogOut,
  HardHat,
  Badge,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Car,
  Truck
} from "lucide-react";

const SecurityLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [logsOpen, setLogsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleLogsDropdown = () => {
    setLogsOpen(!logsOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`bg-primary-dark text-white h-screen ${isOpen ? "w-64" : "w-16"} transition-all duration-300 p-4 sticky top-0 overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          {isOpen && <h2 className="text-xl font-bold">Security Panel</h2>}
          <button 
            onClick={toggleSidebar} 
            className="text-white focus:outline-none hover:bg-primary-light/20 p-2 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <ul className="space-y-2">
          {/* Security Dashboard */}
          <li>
            <a 
              href="/security/dashboard" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <ShieldCheck size={20} />
              {isOpen && <span>Dashboard</span>}
            </a>
          </li>

          {/* Visitor Management */}
          <li>
            <a 
              href="/security/scan-visitor" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <QrCode size={20} />
              {isOpen && <span>Scan Visitor</span>}
            </a>
          </li>
          <li>
            <a 
              href="/security/manual-entry" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <User size={20} />
              {isOpen && <span>Manual Entry</span>}
            </a>
          </li>

          {/* Verification Systems */}
          <li>
            <a 
              href="/security/verify-staff" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <Badge size={20} />
              {isOpen && <span>Verify Staff</span>}
            </a>
          </li>
          <li>
            <a 
              href="/security/verify-worker" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <HardHat size={20} />
              {isOpen && <span>Verify Worker</span>}
            </a>
          </li>

          {/* Logs Dropdown */}
          <li>
            <button
              onClick={toggleLogsDropdown}
              className="flex items-center justify-between w-full p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <ClipboardList size={20} />
                {isOpen && <span>All Logs</span>}
              </div>
              {isOpen && (logsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
            </button>
            
            {logsOpen && isOpen && (
              <ul className="ml-8 mt-2 space-y-2">
                <li>
                  <a 
                    href="/security/visitor-logs" 
                    className="flex items-center gap-3 p-2 hover:bg-primary-light/20 rounded-lg transition-colors text-sm"
                  >
                    <User size={16} />
                    <span>Visitor Logs</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/security/vehicle-logs" 
                    className="flex items-center gap-3 p-2 hover:bg-primary-light/20 rounded-lg transition-colors text-sm"
                  >
                    <Car size={16} />
                    <span>Vehicle Logs</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/security/delivery-logs" 
                    className="flex items-center gap-3 p-2 hover:bg-primary-light/20 rounded-lg transition-colors text-sm"
                  >
                    <Truck size={16} />
                    <span>Delivery Logs</span>
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Emergency */}
          <li>
            <a 
              href="/security/emergency" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors text-red-300 hover:text-red-100"
            >
              <AlertTriangle size={20} />
              {isOpen && <span>Emergency Alerts</span>}
            </a>
          </li>

          {/* Logout */}
          <li className="mt-8">
            <a 
              href="/logout" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              {isOpen && <span>Logout</span>}
            </a>
          </li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 bg-background min-h-screen overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default SecurityLayout;