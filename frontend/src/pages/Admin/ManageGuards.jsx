import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserMinus, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const ManageGuardsPage = () => {
  const [guards, setGuards] = useState([]);
  const [availableGuards, setAvailableGuards] = useState([]);
  const [searchAssigned, setSearchAssigned] = useState('');
  const [searchAvailable, setSearchAvailable] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      // This would be replaced with actual API calls
      setTimeout(() => {
        setGuards([
          { id: 1, name: 'John Smith', badge: 'G-1001', shift: 'Morning', status: 'Active', lastActive: '2025-04-02' },
          { id: 2, name: 'Sarah Johnson', badge: 'G-1002', shift: 'Night', status: 'Active', lastActive: '2025-04-03' },
          { id: 3, name: 'Michael Chen', badge: 'G-1003', shift: 'Evening', status: 'Active', lastActive: '2025-04-01' },
          { id: 4, name: 'Emma Williams', badge: 'G-1004', shift: 'Morning', status: 'On Leave', lastActive: '2025-03-28' },
        ]);
        
        setAvailableGuards([
          { id: 5, name: 'Robert Brown', badge: 'G-1005', shift: 'Flexible', status: 'Available' },
          { id: 6, name: 'Lisa Garcia', badge: 'G-1006', shift: 'Morning', status: 'Available' },
          { id: 7, name: 'David Wilson', badge: 'G-1007', shift: 'Night', status: 'Available' },
        ]);
        
        setIsLoading(false);
      }, 800);
    };

    fetchData();
  }, []);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedGuards = [...guards].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredAssignedGuards = sortedGuards.filter(guard => 
    guard.name.toLowerCase().includes(searchAssigned.toLowerCase()) ||
    guard.badge.toLowerCase().includes(searchAssigned.toLowerCase())
  );

  const filteredAvailableGuards = availableGuards.filter(guard => 
    guard.name.toLowerCase().includes(searchAvailable.toLowerCase()) ||
    guard.badge.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const handleAssignGuard = (guard) => {
    // This would be replaced with an API call
    setGuards([...guards, {...guard, status: 'Active', lastActive: new Date().toISOString().split('T')[0]}]);
    setAvailableGuards(availableGuards.filter(g => g.id !== guard.id));
    setShowAssignModal(false);
  };

  const handleRemoveGuard = (id) => {
    // This would be replaced with an API call
    const guardToRemove = guards.find(g => g.id === id);
    setAvailableGuards([...availableGuards, {...guardToRemove, status: 'Available'}]);
    setGuards(guards.filter(g => g.id !== id));
    setShowRemoveConfirm(null);
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Manage Guards</h1>
          <p className="text-sm opacity-80">Assign or remove guards from duty roster</p>
        </div>
      </header>

      <div className="container mx-auto py-6 px-4">
        {/* Currently Assigned Guards */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold text-primary mb-2 sm:mb-0">Currently Assigned Guards</h2>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search guards..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchAssigned}
                onChange={(e) => setSearchAssigned(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-left">
                  <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Name <SortIcon column="name" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('badge')}>
                    <div className="flex items-center">
                      Badge <SortIcon column="badge" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('shift')}>
                    <div className="flex items-center">
                      Shift <SortIcon column="shift" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center">
                      Status <SortIcon column="status" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('lastActive')}>
                    <div className="flex items-center">
                      Last Active <SortIcon column="lastActive" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignedGuards.length > 0 ? (
                  filteredAssignedGuards.map((guard) => (
                    <tr key={guard.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">{guard.name}</td>
                      <td className="py-3 px-4">{guard.badge}</td>
                      <td className="py-3 px-4">{guard.shift}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          guard.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {guard.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{guard.lastActive}</td>
                      <td className="py-3 px-4 text-right">
                        {showRemoveConfirm === guard.id ? (
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleRemoveGuard(guard.id)}
                              className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => setShowRemoveConfirm(null)}
                              className="p-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowRemoveConfirm(guard.id)}
                            className="text-red-500 hover:text-red-700 flex items-center justify-center space-x-1"
                          >
                            <UserMinus size={16} />
                            <span>Remove</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                      {searchAssigned ? "No guards match your search" : "No guards currently assigned"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setShowAssignModal(true)}
              className="flex items-center space-x-2 bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-md transition duration-200"
            >
              <UserPlus size={18} />
              <span>Assign New Guard</span>
            </button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-primary mb-2">Total Guards</h3>
            <p className="text-3xl font-bold text-secondary">{guards.length}</p>
            <p className="text-sm text-gray-500">Currently assigned</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-primary mb-2">Active Status</h3>
            <p className="text-3xl font-bold text-green-600">
              {guards.filter(g => g.status === 'Active').length}
            </p>
            <p className="text-sm text-gray-500">Guards on duty</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-primary mb-2">Available Guards</h3>
            <p className="text-3xl font-bold text-yellow-600">{availableGuards.length}</p>
            <p className="text-sm text-gray-500">Ready for assignment</p>
          </div>
        </div>
      </div>

      {/* Assign Guard Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-screen overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary">Assign New Guard</h3>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search available guards..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {filteredAvailableGuards.length > 0 ? (
                  filteredAvailableGuards.map((guard) => (
                    <div 
                      key={guard.id}
                      className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                        selectedGuard?.id === guard.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedGuard(guard)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-md font-medium">{guard.name}</h4>
                          <p className="text-sm text-gray-500">Badge: {guard.badge}</p>
                        </div>
                        <div>
                          <span className="text-sm mr-2">{guard.shift} Shift</span>
                          {selectedGuard?.id === guard.id && (
                            <span className="text-secondary">
                              <Check size={18} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    No available guards found
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button 
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => selectedGuard && handleAssignGuard(selectedGuard)}
                className={`px-4 py-2 bg-secondary text-white rounded-md transition duration-200 ${
                  selectedGuard ? 'hover:bg-secondary-dark' : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!selectedGuard}
              >
                Assign Guard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGuardsPage;