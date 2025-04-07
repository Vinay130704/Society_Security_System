import { 
  AlertCircle, 
  Shield, 
  UserCheck, 
  Car,
  Clock,
  Lock,
  Siren,
  UserX,
  QrCode,
  ClipboardList
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement
);

const SecurityDashboard = () => {
  // Sample data
  const stats = [
    { title: "Active Alerts", value: "5", icon: <AlertCircle className="text-red-500" />, change: "+2 today" },
    { title: "Visitors Today", value: "24", icon: <UserCheck className="text-secondary" />, change: "8 expected" },
    { title: "Vehicles Logged", value: "18", icon: <Car className="text-primary-light" />, change: "3 deliveries" },
    { title: "Staff On Duty", value: "7", icon: <Shield className="text-primary" />, change: "2 on patrol" }
  ];

  const recentActivities = [
    { id: 1, action: "Unauthorized entry attempt", time: "10 mins ago", location: "North Gate" },
    { id: 2, action: "Visitor checked in", time: "25 mins ago", location: "Main Entrance" },
    { id: 3, action: "Fire alarm test", time: "1 hour ago", location: "East Wing" },
    { id: 4, action: "Vehicle logged", time: "2 hours ago", location: "Parking Lot" }
  ];

  const quickActions = [
    { title: "Gate Lockdown", icon: <Lock size={20} />, action: () => handleLockdown(), color: "bg-red-500 hover:bg-red-600" },
    { title: "Report Incident", icon: <Siren size={20} />, action: () => reportIncident(), color: "bg-yellow-500 hover:bg-yellow-600" },
    { title: "Unauthorized Entry", icon: <UserX size={20} />, action: () => logUnauthorizedEntry(), color: "bg-secondary hover:bg-secondary-dark" },
    { title: "Scan QR Code", icon: <QrCode size={20} />, action: () => openScanner(), color: "bg-primary hover:bg-primary-dark" }
  ];

  // Visitor data for bar chart
  const visitorData = {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [
      {
        label: 'Visitors',
        data: [2, 8, 12, 6, 4, 1],
        backgroundColor: '#3498DB',
        borderRadius: 4,
      }
    ]
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Handler functions
  const handleLockdown = () => {
    // Implement lockdown logic
    alert("Initiating building lockdown procedure!");
  };

  const reportIncident = () => {
    // Implement incident reporting
    alert("Opening incident report form");
  };

  const logUnauthorizedEntry = () => {
    // Implement unauthorized entry logging
    alert("Logging unauthorized entry attempt");
  };

  const openScanner = () => {
    // Implement QR scanner
    alert("Opening QR code scanner");
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Added top margin and removed scroll */}
      <div className="mt-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary-dark">Security Dashboard</h1>
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="mr-2" size={16} />
            Current time: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Emergency Alert Banner */}
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg flex items-center">
          <Siren className="mr-3 animate-pulse" />
          <div>
            <p className="font-bold">Emergency Alert: Fire alarm triggered in East Wing</p>
            <p className="text-sm">2 minutes ago • Priority: High</p>
          </div>
          <button className="ml-auto bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
            Acknowledge
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-primary-dark mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
                <div className="p-3 bg-primary-light/10 rounded-lg">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visitors Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-primary-dark">Hourly Visitor Traffic</h2>
                <button className="text-xs text-secondary flex items-center">
                  View logs <ClipboardList size={14} className="ml-1" />
                </button>
              </div>
              <div className="h-64">
                <Bar data={visitorData} options={barOptions} />
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
              <h2 className="text-lg font-semibold text-primary-dark mb-4">Recent Security Events</h2>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start pb-3 border-b border-gray-100 last:border-0">
                    <div className={`p-2 rounded-full mr-3 ${
                      activity.action.includes("unauthorized") ? "bg-red-100 text-red-500" : "bg-primary-light/10 text-primary"
                    }`}>
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-dark">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.location} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
              <h2 className="text-lg font-semibold text-primary-dark mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`p-4 rounded-lg flex flex-col items-center text-center text-white ${action.color} transition-colors`}
                  >
                    <div className="p-2 bg-white/20 rounded-full mb-2">
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Alerts */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
              <h2 className="text-lg font-semibold text-primary-dark mb-4">Active Alerts (3)</h2>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-medium text-primary-dark">Fire Alarm - East Wing</p>
                  <p className="text-xs text-gray-500 mb-2">Triggered 2 mins ago • Priority: High</p>
                  <div className="flex space-x-2">
                    <button className="text-xs bg-secondary text-white px-3 py-1 rounded">Respond</button>
                    <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded">False Alarm</button>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-sm font-medium text-primary-dark">Unauthorized Entry Attempt</p>
                  <p className="text-xs text-gray-500 mb-2">North Gate • 15 mins ago</p>
                  <div className="flex space-x-2">
                    <button className="text-xs bg-secondary text-white px-3 py-1 rounded">Review</button>
                    <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded">Dismiss</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Shift Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
              <h2 className="text-lg font-semibold text-primary-dark mb-4">Current Shift</h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Duration:</span>
                <span className="text-sm font-medium">7:00 AM - 3:00 PM</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Team:</span>
                <span className="text-sm font-medium">Rajesh, Amit, Priya</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Zone:</span>
                <span className="text-sm font-medium">North Gate & East Wing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;