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
  Truck,
  UserCircle
} from "lucide-react";

const SecurityLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [logsOpen, setLogsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleLogsDropdown = () => {
    setLogsOpen(!logsOpen);
  };

  const navItems = [
    { name: "Dashboard", icon: ShieldCheck, path: "/security/security-dashboard" },
    { name: "Profile", icon: UserCircle, path: "/security/profile" },
    { name: "Scan Visitor", icon: QrCode, path: "/security/scan-visitor" },
    { name: "Vehicle Record", icon: Car, path: "/security/vehicle-record" },
    { name: "Verify Staff", icon: Badge, path: "/security/staff-worker" },
    { name: "Emergency Alerts", icon: AlertTriangle, path: "/security/emergency" }
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <div 
          className={`bg-primary-dark text-white ${isOpen ? "w-64" : "w-20"} transition-all duration-300 flex-shrink-0 fixed top-16 left-0 h-[calc(100vh-64px)] z-40`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              {isOpen && <h2 className="text-xl font-bold">Security Panel</h2>}
              <button 
                onClick={toggleSidebar} 
                className="text-white focus:outline-none hover:bg-primary-light/20 p-2 rounded-lg"
              >
                <Menu size={24} className="shrink-0" />
              </button>
            </div>
            
            {/* Navigation */}
            <ul className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.path}
                    onClick={() => setActiveItem(item.name)}
                    className={`flex items-center p-3 rounded-lg transition-colors 
                      ${activeItem === item.name 
                        ? "bg-secondary text-white" 
                        : "hover:bg-primary-light/20 text-white/90"}
                      ${isOpen ? "gap-4" : "justify-center"}`}
                  >
                    <item.icon size={20} className="shrink-0" />
                    {isOpen && <span className="truncate">{item.name}</span>}
                  </a>
                </li>
              ))}

              {/* Logs Dropdown */}
              <li>
                <button
                  onClick={toggleLogsDropdown}
                  className={`flex items-center p-3 rounded-lg transition-colors w-full hover:bg-primary-light/20 ${isOpen ? "justify-between" : "justify-center"}`}
                >
                  <div className="flex items-center gap-4">
                    <ClipboardList size={20} className="shrink-0" />
                    {isOpen && <span>All Logs</span>}
                  </div>
                  {isOpen && (logsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                </button>
                
                {logsOpen && isOpen && (
                  <ul className="ml-8 mt-2 space-y-2">
                    <li>
                      <a 
                        href="/security/visitor-logs" 
                        className={`flex items-center p-2 rounded-lg transition-colors hover:bg-primary-light/20 ${activeItem === "Visitor Logs" ? "bg-secondary/70 text-white" : "text-white/90"}`}
                        onClick={() => setActiveItem("Visitor Logs")}
                      >
                        <User size={16} className="shrink-0" />
                        <span className="ml-3">Visitor Logs</span>
                      </a>
                    </li>
                    <li>
                      <a 
                        href="/security/vehicle-record" 
                        className={`flex items-center p-2 rounded-lg transition-colors hover:bg-primary-light/20 ${activeItem === "Vehicle Logs" ? "bg-secondary/70 text-white" : "text-white/90"}`}
                        onClick={() => setActiveItem("Vehicle Logs")}
                      >
                        <Car size={16} className="shrink-0" />
                        <span className="ml-3">Vehicle Logs</span>
                      </a>
                    </li>
                    <li>
                      <a 
                        href="/security/delivery-logs" 
                        className={`flex items-center p-2 rounded-lg transition-colors hover:bg-primary-light/20 ${activeItem === "Delivery Logs" ? "bg-secondary/70 text-white" : "text-white/90"}`}
                        onClick={() => setActiveItem("Delivery Logs")}
                      >
                        <Truck size={16} className="shrink-0" />
                        <span className="ml-3">Delivery Logs</span>
                      </a>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
            
            {/* Logout */}
            <div className="mt-auto pt-4">
              <a 
                href="/login" 
                className={`flex items-center p-3 hover:bg-primary-light/20 rounded-lg transition-colors ${isOpen ? "gap-4" : "justify-center"}`}
              >
                <LogOut size={20} className="shrink-0" />
                {isOpen && <span>Logout</span>}
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 bg-background overflow-y-auto scrollbar-hide ${isOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SecurityLayout;