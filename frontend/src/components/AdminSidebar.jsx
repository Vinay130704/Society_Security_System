import { useState } from "react";
import { Outlet } from "react-router-dom";
import { 
  Home, 
  Users, 
  Shield, 
  Bell, 
  Calendar, 
  UserCog, 
  HardHat,
  ClipboardList,
  Settings,
  Menu,
  Truck,
  AlertTriangle,
  CalendarRange,
  LogIn,
  Car,
  UserCheck
} from "lucide-react";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`bg-primary-dark text-white h-screen ${isOpen ? "w-64" : "w-16"} transition-all duration-300 p-4 sticky top-0 overflow-y-auto`}>
        <button 
          onClick={toggleSidebar} 
          className="text-white mb-6 focus:outline-none hover:bg-primary-light/20 p-2 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <ul className="space-y-2">
          <li>
            <a 
              href="/admin/admin-dashboard" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <Home size={20} />
              {isOpen && <span>Dashboard</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/user-management" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <Users size={20} />
              {isOpen && <span>User Management</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/manage-residents" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <UserCog size={20} />
              {isOpen && <span>Residents</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/guards" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <Shield size={20} />
              {isOpen && <span>Security Guards</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/visitor-log" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <ClipboardList size={20} />
              {isOpen && <span>Visitor Logs</span>}
            </a>
          </li>
          
          {/* New components added */}
          <li>
            <a 
              href="/admin/delivery" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <Truck size={20} />
              {isOpen && <span>Delivery</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/emergency" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <AlertTriangle size={20} />
              {isOpen && <span>Emergency</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/events" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <CalendarRange size={20} />
              {isOpen && <span>Events</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/entry-exit" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <LogIn size={20} />
              {isOpen && <span>Entry/Exit</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/staff" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <UserCheck size={20} />
              {isOpen && <span>Staff</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/vehicle" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <Car size={20} />
              {isOpen && <span>Vehicle</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/worker" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <HardHat size={20} />
              {isOpen && <span>Worker</span>}
            </a>
          </li>
          <li>
            <a 
              href="/admin/security-report" 
              className="flex items-center gap-4 p-3 hover:bg-primary-light/20 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {isOpen && <span>Security Report</span>}
            </a>
          </li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 bg-background min-h-screen">
        <Outlet /> {/* This will render the current route's component */}
      </div>
    </div>
  );
};

export default AdminLayout;