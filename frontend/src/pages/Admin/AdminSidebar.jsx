import { NavLink } from "react-router-dom";
import { FaUserCog, FaUsers, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";

const AdminSidebar = ({ onLogout }) => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 text-center font-bold text-xl border-b border-gray-700">
        Admin Panel
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-2 mt-4">
          <li>
            <NavLink
              to="/admin/dashboard"
              className="flex items-center p-3 hover:bg-gray-700 transition rounded-md"
            >
              <FaTachometerAlt className="mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/user-management"
              className="flex items-center p-3 hover:bg-gray-700 transition rounded-md"
            >
              <FaUsers className="mr-3" />
              User Management
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/settings"
              className="flex items-center p-3 hover:bg-gray-700 transition rounded-md"
            >
              <FaUserCog className="mr-3" />
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center w-full p-3 bg-red-600 hover:bg-red-700 rounded-md transition"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
