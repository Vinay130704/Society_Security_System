const userRoles = [
    {
      title: "Resident Panel",
      description: [
        "Register visitors & generate QR codes",
        "Approve/deny visitor entry",
        "Manage staff (maids, drivers)",
        "Approve one-time delivery entries",
        "Emergency alert button",
      ],
      bgColor: "bg-blue-100",
      borderColor: "border-secondary",
      icon: "🏠",
    },
    {
      title: "Security Guard Panel",
      description: [
        "Scan visitor QR codes",
        "Capture visitor image for unregistered visitors",
        "Verify registered vehicles",
        "Approve/block staff IDs",
        "View emergency alerts",
      ],
      bgColor: "bg-green-100",
      borderColor: "border-green-500",
      icon: "🔐",
    },
    {
      title: "Admin Panel",
      description: [
        "Approve new residents & guards",
        "Manage entire system (staff, vehicles, alerts)",
        "Broadcast security alerts",
      ],
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-500",
      icon: "⚙️",
    },
  ];
  
  const UserRoles = () => {
    return (
      <div className="bg-white py-16 px-6 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-primary text-center">
          User Role-Based Panels
        </h2>
        <p className="text-lg text-text text-center mt-4">
          Dashboard previews for different user roles in the security system.
        </p>
  
        {/* Role Panels Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {userRoles.map((role, index) => (
            <div
              key={index}
              className={`${role.bgColor} ${role.borderColor} border-2 p-6 rounded-lg shadow-lg text-center`}
            >
              <div className="text-4xl">{role.icon}</div>
              <h3 className="mt-4 text-2xl font-semibold text-primary">{role.title}</h3>
              <ul className="mt-4 text-text text-left">
                {role.description.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    ✅ {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default UserRoles;
  