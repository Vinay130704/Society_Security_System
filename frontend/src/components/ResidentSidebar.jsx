import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Home,
  Bell,
  CalendarRange,
  User,
  Truck,
  AlertTriangle,
  LogOut,
  Menu
} from "lucide-react";


const ResidentLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/resident/resident-dashboard" },
    { name: "Announcements", icon: Bell, path: "/resident/announcements" },
    { name: "Visitors", icon: User, path: "/resident/resident-visitor" },
    { name: "Deliveries", icon: Truck, path: "/resident/deliveries" },
    { name: "Events", icon: CalendarRange, path: "/resident/events" },
    { name: "Emergency", icon: AlertTriangle, path: "/resident/emergency" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`bg-primary-dark text-white ${isOpen ? "w-64" : "w-20"} transition-all duration-300 flex-shrink-0 fixed top-0 left-0 h-full z-40 pt-16`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              {isOpen && <h2 className="text-xl font-bold">Resident Portal</h2>}
              <button
                onClick={toggleSidebar}
                className="text-white focus:outline-none hover:bg-primary-light/20 p-2 rounded-lg"
              >
                <Menu size={24} className="shrink-0" />
              </button>
            </div>

            {/* Navigation */}
            <ul className="space-y-2 flex-1 overflow-y-auto">
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
            </ul>

            {/* Logout */}
            {/* <div className="mt-auto pt-4">
              <a
                href="/login"
                className={`flex items-center p-3 hover:bg-primary-light/20 rounded-lg transition-colors ${isOpen ? "gap-4" : "justify-center"}`}
              >
                <LogOut size={20} className="shrink-0" />
                {isOpen && <span>Logout</span>}
              </a>
            </div> */}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 bg-background ${isOpen ? "ml-64" : "ml-20"} transition-all duration-300 pt-16 min-h-[calc(100vh-64px)]`}>
          <Outlet />
        </div>
      </div>


    </div>
  );
};

export default ResidentLayout;