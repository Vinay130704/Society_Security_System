import { 
  Calendar, 
  Bell, 
  AlertTriangle,
  Shield,
  User,
  Package,
  Clock,
  ArrowUpRight,
  Home,
  PhoneCall,
  Car,
  MessageCircle
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const ResidentDashboard = () => {
  const stats = [
    { title: "Upcoming Events", value: "3", icon: <Calendar className="text-indigo-500" />, change: "1 tomorrow" },
    { title: "Active Notices", value: "5", icon: <Bell className="text-amber-500" />, change: "2 new" },
    { title: "Pending Deliveries", value: "2", icon: <Package className="text-blue-500" />, change: "1 arrived" },
    { title: "Maintenance Tickets", value: "1", icon: <Home className="text-green-500" />, change: "In progress" }
  ];

  const recentNotices = [
    { id: 1, title: "Water supply interruption", time: "Today", content: "Water supply will be interrupted from 10am to 2pm due to maintenance work." },
    { id: 2, title: "Annual maintenance fees due", time: "2 days ago", content: "Please clear your annual maintenance fees by the end of this month." },
    { id: 3, title: "Elevator maintenance", time: "3 days ago", content: "The main elevator will undergo maintenance on Saturday from 2pm to 5pm." }
  ];

  const upcomingEvents = [
    { id: 1, title: "Annual General Meeting", date: "Tomorrow", time: "6:00 PM", location: "Community Hall" },
    { id: 2, title: "Yoga in the Park", date: "Saturday", time: "7:00 AM", location: "Central Park" }
  ];

  const quickLinks = [
    { title: "Panic Button", icon: <AlertTriangle size={20} />, link: "#", color: "bg-red-500 hover:bg-red-600 text-white" },
    { title: "Register Guest", icon: <User size={20} />, link: "/resident/visitor-pass", color: "bg-blue-500 hover:bg-blue-600 text-white" },
    { title: "Request Service", icon: <MessageCircle size={20} />, link: "/resident/service", color: "bg-indigo-500 hover:bg-indigo-600 text-white" },
    { title: "View Calendar", icon: <Calendar size={20} />, link: "/resident/calendar", color: "bg-green-500 hover:bg-green-600 text-white" }
  ];

  const participationData = {
    labels: ['Attended', 'Not Attended', 'Pending'],
    datasets: [{
      data: [5, 3, 2],
      backgroundColor: ['#3498DB', '#e74c3c', '#f39c12'],
      borderWidth: 0,
    }]
  };

  const utilityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Water (kL)',
        data: [12, 10, 11, 9, 10, 8],
        backgroundColor: '#3498DB',
        borderRadius: 4,
      },
      {
        label: 'Electricity (kWh/10)',
        data: [24, 22, 23, 25, 21, 20],
        backgroundColor: '#f1c40f',
        borderRadius: 4,
      }
    ]
  };

  const triggerEmergency = () => {
    alert("Emergency alert triggered! Security has been notified!");
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Resident Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back to your community portal</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="mr-2" size={16} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="mb-8">
        <button 
          onClick={triggerEmergency}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center space-x-3 transition-all hover:-translate-y-1"
        >
          <Shield size={24} />
          <span className="text-xl font-bold">EMERGENCY PANIC BUTTON</span>
          <PhoneCall size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 transform transition-all hover:-translate-y-1 hover:shadow-xl border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Notices</h2>
              <button className="text-xs text-blue-600 flex items-center">
                View all <ArrowUpRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {recentNotices.map(notice => (
                <div key={notice.id} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">{notice.title}</h3>
                    <span className="text-xs text-gray-500">{notice.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Community Participation</h2>
              <div className="h-64">
                <Pie data={participationData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Utility Usage</h2>
              <div className="h-64">
                <Bar data={utilityData} options={{ 
                  responsive: true, 
                  plugins: { legend: { position: 'bottom' } },
                  scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                  }
                }} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.link}
                  className={`p-4 rounded-lg flex flex-col items-center text-center ${link.color} transition-colors`}
                >
                  <div className="p-2 bg-white/20 rounded-full mb-2">{link.icon}</div>
                  <span className="text-sm font-medium">{link.title}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start pb-3 border-b border-gray-100 last:border-0">
                  <div className="p-2 bg-indigo-100 rounded-full mr-3">
                    <Calendar size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Important Contacts</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Security Emergency:</span>
                <span className="text-sm font-medium">+91 98765 43210</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Maintenance:</span>
                <span className="text-sm font-medium">+91 98765 43211</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;