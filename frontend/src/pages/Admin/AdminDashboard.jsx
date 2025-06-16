import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Calendar, 
  Users, 
  Activity, 
  Shield, 
  UserCheck, 
  Car,
  Clock,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: "Total Alerts", value: "0", icon: <AlertCircle className="text-secondary" />, change: "+0 today" },
    { title: "Upcoming Events", value: "0", icon: <Calendar className="text-primary-light" />, change: "0 new" },
    { title: "Active Staff", value: "0", icon: <Users className="text-secondary-dark" />, change: "0 on leave" },
    { title: "Pending Approvals", value: "0", icon: <UserCheck className="text-primary" />, change: "0 new" }
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [visitorData, setVisitorData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Visitors',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#3498DB',
        borderRadius: 4,
      }
    ]
  });
  const [alertData, setAlertData] = useState({
    labels: ['Resolved', 'Pending', 'Critical'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
        borderWidth: 0,
      }
    ]
  });

  const quickLinks = [
    { title: "Manage Alerts", icon: <AlertCircle size={20} />, link: "/admin/alerts" },
    { title: "Create Event", icon: <Calendar size={20} />, link: "/admin/events" },
    { title: "Add Staff", icon: <Users size={20} />, link: "/admin/staff" },
    { title: "View Reports", icon: <Activity size={20} />, link: "/admin/reports" }
  ];

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

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const extractData = (response) => {
    if (!response || !response.data) return [];
    
    // Handle different possible response structures
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data.events && Array.isArray(response.data.events)) {
      return response.data.events;
    }
    if (response.data.users && Array.isArray(response.data.users)) {
      return response.data.users;
    }
    return [];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch all data in parallel
        const [
          alertsRes, 
          eventsRes, 
          usersRes, 
          approvalsRes,
          vehiclesRes
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/emergency/all-emergency-alerts', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('http://localhost:5000/api/event/view-event', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('http://localhost:5000/api/admin/users', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('http://localhost:5000/api/admin/users?status=pending', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('http://localhost:5000/api/vehicle/admin/all', { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);

        // Log responses for debugging
        console.log('API Responses:', {
          alerts: alertsRes.data,
          events: eventsRes.data,
          users: usersRes.data,
          approvals: approvalsRes.data,
          vehicles: vehiclesRes.data
        });

        // Extract data from responses
        const alerts = extractData(alertsRes);
        const events = extractData(eventsRes);
        const users = extractData(usersRes);
        const approvals = extractData(approvalsRes);
        const vehicles = extractData(vehiclesRes);

        // Process alerts data
        const totalAlerts = alerts.length;
        const resolvedAlerts = alerts.filter(a => a?.status === 'resolved').length;
        const pendingAlerts = alerts.filter(a => a?.status === 'pending').length;
        const criticalAlerts = alerts.filter(a => a?.priority === 'high').length;

        // Process events data
        const upcomingEvents = events.filter(
          e => e?.date && new Date(e.date) >= new Date()
        ).length;

        // Process users data
        const activeStaff = users.filter(
          u => u?.role === 'staff' && u?.status === 'active'
        ).length;
        const onLeaveStaff = users.filter(
          u => u?.role === 'staff' && u?.status === 'on_leave'
        ).length;

        // Process approval requests
        const pendingApprovals = approvals.length;

        // Process vehicle data for visitor chart
        const vehicleEntries = vehicles.reduce((acc, vehicle) => {
          if (vehicle?.createdAt) {
            const day = new Date(vehicle.createdAt).getDay();
            acc[day] = (acc[day] || 0) + 1;
          }
          return acc;
        }, {});

        const visitorChartData = [0, 0, 0, 0, 0, 0, 0];
        Object.entries(vehicleEntries).forEach(([day, count]) => {
          visitorChartData[parseInt(day)] = count;
        });

        // Update state
        setStats([
          { 
            title: "Total Alerts", 
            value: totalAlerts.toString(), 
            icon: <AlertCircle className="text-secondary" />, 
            change: `+${alerts.filter(a => 
              a?.createdAt && new Date(a.createdAt).toDateString() === new Date().toDateString()
            ).length} today` 
          },
          { 
            title: "Upcoming Events", 
            value: upcomingEvents.toString(), 
            icon: <Calendar className="text-primary-light" />, 
            change: `${events.filter(e => 
              e?.createdAt && new Date(e.createdAt).toDateString() === new Date().toDateString()
            ).length} new` 
          },
          { 
            title: "Active Staff", 
            value: activeStaff.toString(), 
            icon: <Users className="text-secondary-dark" />, 
            change: `${onLeaveStaff} on leave` 
          },
          { 
            title: "Pending Approvals", 
            value: pendingApprovals.toString(), 
            icon: <UserCheck className="text-primary" />, 
            change: `${approvals.filter(a => 
              a?.createdAt && new Date(a.createdAt).toDateString() === new Date().toDateString()
            ).length} new` 
          }
        ]);

        // Create recent activities from approvals and alerts
        const activityData = [
          ...approvals.slice(0, 2).map(approval => ({
            id: approval._id,
            action: `New ${approval.role} registration`,
            time: approval.createdAt ? new Date(approval.createdAt).toLocaleTimeString() : 'Recently',
            user: approval.name || 'New user'
          })),
          ...alerts.slice(0, 2).map(alert => ({
            id: alert._id,
            action: `Security alert: ${alert.type}`,
            time: alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'Recently',
            user: 'Security System'
          }))
        ];
        setRecentActivities(activityData.slice(0, 4));

        setApprovalRequests(approvals.slice(0, 2));
        setVisitorData({
          ...visitorData,
          datasets: [{
            ...visitorData.datasets[0],
            data: visitorChartData
          }]
        });
        setAlertData({
          ...alertData,
          datasets: [{
            ...alertData.datasets[0],
            data: [resolvedAlerts, pendingAlerts, criticalAlerts]
          }]
        });

      } catch (error) {
        console.error('Dashboard error:', {
          error: error,
          response: error.response?.data
        });
        toast.error('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApproval = async (userId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/${action === 'approve' ? 'approve' : 'reject'}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(`${action} response:`, response.data);
      
      setApprovalRequests(prev => prev.filter(req => req._id !== userId));
      toast.success(`User ${action}d successfully`);
    } catch (error) {
      console.error(`${action} error:`, error.response?.data || error.message);
      toast.error(`Failed to ${action} user. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-dark">Admin Dashboard</h1>
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="mr-2" size={16} />
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:-translate-y-1 hover:shadow-xl border-l-4 border-secondary"
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
              <h2 className="text-lg font-semibold text-primary-dark">Weekly Vehicle Entries</h2>
              <a href="/admin/vehicles" className="text-xs text-secondary flex items-center">
                View all <ArrowUpRight size={14} className="ml-1" />
              </a>
            </div>
            <div className="h-64">
              <Bar data={visitorData} options={barOptions} />
            </div>
          </div>

          {/* Security Alerts Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary-dark">Security Alerts</h2>
              <a href="/admin/alerts" className="text-xs text-secondary flex items-center">
                View all <ArrowUpRight size={14} className="ml-1" />
              </a>
            </div>
            <div className="h-64">
              <Pie data={alertData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
            <h2 className="text-lg font-semibold text-primary-dark mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start pb-3 border-b border-gray-100 last:border-0">
                  <div className="p-2 bg-primary-light/10 rounded-full mr-3">
                    <Activity size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-dark">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">No recent activities</p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
            <h2 className="text-lg font-semibold text-primary-dark mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.link}
                  className="p-3 bg-primary-light/5 rounded-lg flex flex-col items-center text-center hover:bg-primary-light/10 transition-colors"
                >
                  <div className="p-2 bg-primary-light/10 rounded-full mb-2">
                    {link.icon}
                  </div>
                  <span className="text-sm font-medium text-primary-dark">{link.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Approval Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
            <h2 className="text-lg font-semibold text-primary-dark mb-4">
              Approval Requests ({approvalRequests.length})
            </h2>
            <div className="space-y-3">
              {approvalRequests.map(request => (
                <div key={request._id} className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-primary-dark">
                    {request.role === 'resident' ? 'New Resident Registration' : 'New Staff Registration'}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {request.name || 'Unknown'} • {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Pending'}
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApproval(request._id, 'approve')}
                      className="text-xs bg-secondary text-white px-3 py-1 rounded hover:bg-secondary-dark transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleApproval(request._id, 'reject')}
                      className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {approvalRequests.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">No pending approvals</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;