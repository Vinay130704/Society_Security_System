import { useState } from "react";
import { Outlet } from "react-router-dom";
import { 
  Home,
  ShieldCheck,
  UserCog,
  HardHat,
  AlertTriangle,
  Menu,
  LogOut,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Truck,
  CalendarRange,
  Users
} from "lucide-react";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [usersOpen, setUsersOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleUsersDropdown = () => {
    setUsersOpen(!usersOpen);
  };

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { name: "User Management", icon: Users, path: "/admin/user-management" },
    { name: "Resident Logs", icon: ClipboardList, path: "/admin/resident-logs" },
    { name: "Delivery Logs", icon: Truck, path: "/admin/delivery-logs" },
    { name: "Emergency", icon: AlertTriangle, path: "/admin/emergency" },
    { name: "Events", icon: CalendarRange, path: "/admin/events" },
    { name: "Workers", icon: HardHat, path: "/admin/workers" }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Removed overflow-y-auto */}
        <div 
          className={`bg-primary-dark text-white ${isOpen ? "w-64" : "w-20"} transition-all duration-300 flex-shrink-0 fixed top-0 left-0 h-full z-40 pt-16`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              {isOpen && <h2 className="text-xl font-bold">Admin Panel</h2>}
              <button 
                onClick={toggleSidebar} 
                className="text-white focus:outline-none hover:bg-primary-light/20 p-2 rounded-lg"
              >
                <Menu size={24} className="shrink-0" />
              </button>
            </div>
            
            {/* Navigation - Removed overflow-y-auto */}
            <div className="flex-1">
              <ul className="space-y-2">
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

                {/* Users Dropdown */}
                <li>
                  <button
                    onClick={toggleUsersDropdown}
                    className={`flex items-center p-3 rounded-lg transition-colors w-full 
                      ${usersOpen ? 'bg-primary-light/10' : ''}
                      hover:bg-primary-light/20 ${isOpen ? "justify-between" : "justify-center"}`}
                  >
                    <div className="flex items-center gap-4">
                      <Users size={20} className="shrink-0" />
                      {isOpen && <span>User </span>}
                    </div>
                    {isOpen && (usersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                  </button>
                  
                  {usersOpen && isOpen && (
                    <ul className="ml-8 mt-2 space-y-2">
                      <li>
                        <a 
                          href="/admin/residents" 
                          className={`flex items-center p-2 rounded-lg transition-colors 
                            ${activeItem === "Residents" ? "bg-secondary/70 text-white" : "hover:bg-primary-light/20 text-white/90"}`}
                          onClick={() => setActiveItem("Residents")}
                        >
                          <UserCog size={16} className="shrink-0 mr-3" />
                          <span>Residents</span>
                        </a>
                      </li>
                      <li>
                        <a 
                          href="/admin/security-users" 
                          className={`flex items-center p-2 rounded-lg transition-colors 
                            ${activeItem === "Security Users" ? "bg-secondary/70 text-white" : "hover:bg-primary-light/20 text-white/90"}`}
                          onClick={() => setActiveItem("Security Users")}
                        >
                          <ShieldCheck size={16} className="shrink-0 mr-3" />
                          <span>Security Users</span>
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>
            
            {/* Logout */}
            {/* <div className="mt-auto pt-4">
              <a 
                href="/logout" 
                className={`flex items-center p-3 hover:bg-primary-light/20 rounded-lg transition-colors ${isOpen ? "gap-4" : "justify-center"}`}
              >
                <LogOut size={20} className="shrink-0" />
                {isOpen && <span>Logout</span>}
              </a>
            </div> */}
          </div>
        </div>

        {/* Main Content Area - Keep overflow-y-auto here for content scrolling */}
        <div className={`flex-1 bg-background overflow-y-auto ${isOpen ? "ml-64" : "ml-20"} transition-all duration-300 pt-16`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;