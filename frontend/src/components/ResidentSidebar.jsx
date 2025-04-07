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
    { name: "Dashboard", icon: Home, path: "/resident/dashboard" },
    { name: "Announcements", icon: Bell, path: "/resident/announcements" },
    { name: "Visitors", icon: User, path: "/resident/visitors" },
    { name: "Deliveries", icon: Truck, path: "/resident/deliveries" },
    { name: "Events", icon: CalendarRange, path: "/resident/events" },
    { name: "Emergency", icon: AlertTriangle, path: "/resident/emergency" }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className={`bg-primary-dark text-white ${isOpen ? "w-64" : "w-16"} transition-all duration-300 flex-shrink-0 sticky top-0 h-screen`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              {isOpen && <h2 className="text-xl font-bold">Resident Portal</h2>}
              <button 
                onClick={toggleSidebar} 
                className="text-white focus:outline-none hover:bg-primary-light/20 p-2 rounded-lg"
              >
                <Menu size={24} />
              </button>
            </div>
            
            {/* Profile Section */}
            <div className={`flex items-center gap-3 p-3 mb-6 rounded-lg bg-primary/50 ${!isOpen && "justify-center"}`}>
              <div className="bg-secondary p-2 rounded-full">
                <User size={20} />
              </div>
              {isOpen && (
                <div>
                  <p className="font-medium">John Resident</p>
                  <p className="text-xs text-primary-light">Unit 101</p>
                </div>
              )}
            </div>
            
            {/* Navigation */}
            <ul className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.path}
                    onClick={() => setActiveItem(item.name)}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors 
                      ${activeItem === item.name 
                        ? "bg-secondary text-white" 
                        : "hover:bg-primary-light/20 text-white/90"}`}
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    {isOpen && <span className="truncate">{item.name}</span>}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Logout */}
            <div className="mt-auto pt-4">
              <a 
                href="/logout" 
                className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                {isOpen && <span>Logout</span>}
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-background overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ResidentLayout;