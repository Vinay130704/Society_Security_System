import { useState, useEffect } from 'react';
import { User, Camera, X, Edit2, Save, Plus, Trash2, Badge } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProfileEdit = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [familyEditId, setFamilyEditId] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [previewPic, setPreviewPic] = useState('');
  const [familyMemberPic, setFamilyMemberPic] = useState(null);
  const [familyMemberPreview, setFamilyMemberPreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    flat_no: ''
  });

  const [newFamilyMember, setNewFamilyMember] = useState({
    name: '',
    relation: '',
    gender: '',
    profilePicture: null
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const getAuthHeaders = (contentType = 'application/json') => {
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };

    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    return { headers };
  };

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/profile/get-profile`,
        getAuthHeaders()
      );

      if (!response.data || !response.data.user) {
        throw new Error('Invalid profile data structure');
      }

      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        flat_no: userData.flat_no || ''
      });

      if (userData.profilePicture) {
        setPreviewPic(getImageUrl(userData.profilePicture));
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to construct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL.replace('/api', '')}/${imagePath.replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill all required fields');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (!/^\d{10,15}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
        toast.error('Please enter a valid phone number (10-15 digits)');
        return;
      }

      // Update profile
      const response = await axios.put(
        `${API_BASE_URL}/profile/update-profile`,
        formData,
        getAuthHeaders()
      );

      if (!response.data || !response.data.user) {
        throw new Error('Invalid update response');
      }

      setUser(prevUser => ({
        ...prevUser,
        ...response.data.user
      }));

      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    setProfilePic(file);
    setPreviewPic(URL.createObjectURL(file));
  };

  const uploadProfilePicture = async () => {
    if (!profilePic) return;

    const formData = new FormData();
    formData.append('profilePicture', profilePic);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/profile/picture`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (!response.data || !response.data.profilePicture) {
        throw new Error('Invalid image upload response');
      }

      setUser(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));

      setProfilePic(null);
      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload picture');
    }
  };

  const handleFamilyMemberFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    setFamilyMemberPic(file);
    setFamilyMemberPreview(URL.createObjectURL(file));
    setNewFamilyMember(prev => ({
      ...prev,
      profilePicture: file
    }));
  };

  const handleAddFamilyMember = async () => {
    // Enhanced validation
    if (!newFamilyMember.name.trim() || newFamilyMember.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (!newFamilyMember.relation.trim() || newFamilyMember.relation.trim().length < 2) {
      toast.error('Relation must be at least 2 characters');
      return;
    }
    if (!newFamilyMember.gender) {
      toast.error('Please select gender');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newFamilyMember.name.trim());
      formData.append('relation', newFamilyMember.relation.trim());
      formData.append('gender', newFamilyMember.gender.toLowerCase());

      // Only append profilePicture if it exists and is valid
      if (newFamilyMember.profilePicture instanceof File) {
        if (newFamilyMember.profilePicture.size > 5 * 1024 * 1024) {
          toast.error('Profile picture must be less than 5MB');
          return;
        }
        formData.append('profilePicture', newFamilyMember.profilePicture);
      }

      const response = await axios.post(
        `${API_BASE_URL}/profile/add-familymember`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (!response.data?.familyMember) {
        throw new Error('Invalid response format from server');
      }

      setUser(prev => ({
        ...prev,
        familyMembers: [...(prev.familyMembers || []), response.data.familyMember]
      }));

      // Reset form
      setNewFamilyMember({
        name: '',
        relation: '',
        gender: '',
        profilePicture: null
      });
      setFamilyMemberPic(null);
      setFamilyMemberPreview('');

      toast.success('Family member added successfully');
    } catch (error) {
      console.error('Add family error:', error);
      
      let errorMessage = 'Failed to add family member';
      if (error.response) {
        // Try to get detailed error message from server
        console.log('Error response data:', error.response.data);
        
        errorMessage = error.response.data?.message || 
                      error.response.data?.error?.message || 
                      error.response.data?.error ||
                      errorMessage;
        
        // Handle specific validation errors
        if (error.response.data?.errors) {
          errorMessage = Object.values(error.response.data.errors)
                            .map(err => err.message || err)
                            .join(', ');
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleUpdateFamilyMember = async (memberId) => {
    try {
      const memberToUpdate = user.familyMembers.find(m => m._id === memberId);
      if (!memberToUpdate) {
        toast.error('Family member not found');
        return;
      }

      const formData = new FormData();
      formData.append('memberId', memberId);
      formData.append('name', memberToUpdate.name);
      formData.append('relation', memberToUpdate.relation);
      formData.append('gender', memberToUpdate.gender);

      if (familyMemberPic) {
        formData.append('profilePicture', familyMemberPic);
      }

      const response = await axios.put(
        `${API_BASE_URL}/profile/edit-family`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.data || !response.data.familyMember) {
        throw new Error('Failed to update family member');
      }

      // Update the specific family member in state
      setUser(prev => ({
        ...prev,
        familyMembers: prev.familyMembers.map(member =>
          member._id === memberId ? response.data.familyMember : member
        )
      }));

      setFamilyEditId(null);
      setFamilyMemberPic(null);
      setFamilyMemberPreview('');
      toast.success('Family member updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update family member');
    }
  };

  const handleRemoveFamilyMember = async (memberId) => {
    try {
      if (!window.confirm('Are you sure you want to remove this family member?')) {
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/profile/family/${memberId}`,
        getAuthHeaders()
      );

      setUser(prev => ({
        ...prev,
        familyMembers: prev.familyMembers.filter(m => m._id !== memberId)
      }));

      toast.success('Family member removed successfully');
    } catch (error) {
      console.error('Remove family error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove family member');
    }
  };

  const displayGender = (genderValue) => {
    if (!genderValue) return '-';
    return genderValue.charAt(0).toUpperCase() + genderValue.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <div className="text-xl font-semibold text-red-600">Failed to load profile data</div>
        <button
          onClick={fetchProfile}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your personal information and family members</p>
              </div>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out transform hover:-translate-y-0.5"
                >
                  <Edit2 size={18} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      fetchProfile(); // Reset form with original data
                    }}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out transform hover:-translate-y-0.5"
                  >
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4 group">
                  {previewPic ? (
                    <img
                      src={previewPic}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-md transition duration-300 group-hover:opacity-90"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-blue-100 shadow-md">
                      <User size={60} className="text-gray-400" />
                    </div>
                  )}
                  <label
                    htmlFor="profilePicture"
                    className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg transform transition duration-200 hover:scale-110"
                  >
                    <Camera size={20} />
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {profilePic && (
                  <button
                    onClick={uploadProfilePicture}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                  >
                    <Save size={16} /> Upload Photo
                  </button>
                )}

                {/* Permanent ID Badge */}
                <div className="mt-6 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-100 w-full max-w-xs">
                  <Badge className="text-blue-600" size={20} />
                  <div>
                    <p className="text-xs text-blue-500">Permanent ID</p>
                    <p className="font-medium text-blue-800">
                      {user.permanentId || 'Pending Approval'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    {editMode ? (
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">{user.name || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    {editMode ? (
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">{user.email || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                    {editMode ? (
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">{user.phone || 'Not provided'}</div>
                    )}
                  </div>

                  {user.role === 'resident' && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Flat Number *</label>
                      {editMode ? (
                        <input
                          name="flat_no"
                          value={formData.flat_no}
                          onChange={handleInputChange}
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                        />
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">{user.flat_no || 'Not provided'}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Family Members Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Family Members</h2>

            {/* Add Family Member */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-8 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Family Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newFamilyMember.name}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Full Name"
                    minLength={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relation *</label>
                  <select
                    value={newFamilyMember.relation}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select Relation</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    value={newFamilyMember.gender}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-blue-500 transition">
                        {familyMemberPreview ? (
                          <img
                            src={familyMemberPreview}
                            alt="Preview"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Camera size={18} className="text-gray-400 group-hover:text-blue-500 transition" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        onChange={handleFamilyMemberFileChange}
                      />
                    </label>
                    <button
                      onClick={handleAddFamilyMember}
                      disabled={!newFamilyMember.name || !newFamilyMember.relation || !newFamilyMember.gender}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} /> Add Member
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Members List */}
            {user.familyMembers?.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relation</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permanent ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.familyMembers.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {familyEditId === member._id ? (
                                <label className="cursor-pointer">
                                  <div className="relative h-10 w-10 rounded-full bg-gray-100 overflow-hidden">
                                    {familyMemberPreview ? (
                                      <img
                                        src={familyMemberPreview}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                      />
                                    ) : member.profilePicture ? (
                                      <img
                                        src={getImageUrl(member.profilePicture)}
                                        alt="Member"
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                        <User size={16} className="text-gray-500" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                      <Camera size={16} className="text-white" />
                                    </div>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    className="hidden"
                                    onChange={handleFamilyMemberFileChange}
                                  />
                                </label>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden">
                                  {member.profilePicture ? (
                                    <img
                                      src={getImageUrl(member.profilePicture)}
                                      alt="Member"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                      <User size={16} className="text-gray-500" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {familyEditId === member._id ? (
                            <input
                              type="text"
                              value={member.name || ''}
                              onChange={(e) => {
                                const updatedMembers = user.familyMembers.map(m =>
                                  m._id === member._id ? { ...m, name: e.target.value } : m
                                );
                                setUser({ ...user, familyMembers: updatedMembers });
                              }}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                              minLength={2}
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{member.name || '-'}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {familyEditId === member._id ? (
                            <select
                              value={member.relation || ''}
                              onChange={(e) => {
                                const updatedMembers = user.familyMembers.map(m =>
                                  m._id === member._id ? { ...m, relation: e.target.value } : m
                                );
                                setUser({ ...user, familyMembers: updatedMembers });
                              }}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            >
                              <option value="spouse">Spouse</option>
                              <option value="child">Child</option>
                              <option value="parent">Parent</option>
                              <option value="sibling">Sibling</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <div className="text-sm text-gray-500">{member.relation || '-'}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {familyEditId === member._id ? (
                            <select
                              value={member.gender || ''}
                              onChange={(e) => {
                                const updatedMembers = user.familyMembers.map(m =>
                                  m._id === member._id ? { ...m, gender: e.target.value } : m
                                );
                                setUser({ ...user, familyMembers: updatedMembers });
                              }}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${member.gender === 'male' ? 'bg-blue-100 text-blue-800' :
                                member.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                                  'bg-purple-100 text-purple-800'}`}>
                              {displayGender(member.gender) || '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Badge size={16} className="text-blue-600" />
                            <span className="text-sm font-mono text-gray-600">
                              {member.permanentId || `${user.permanentId}-${member.relation?.toLowerCase() || 'member'}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-3">
                            {familyEditId === member._id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateFamilyMember(member._id)}
                                  className="text-green-600 hover:text-green-900 transition"
                                  title="Save changes"
                                >
                                  <Save size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    setFamilyEditId(null);
                                    setFamilyMemberPic(null);
                                    setFamilyMemberPreview('');
                                  }}
                                  className="text-gray-600 hover:text-gray-900 transition"
                                  title="Cancel"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setFamilyEditId(member._id);
                                    setFamilyMemberPreview(
                                      member.profilePicture ? getImageUrl(member.profilePicture) : ''
                                    );
                                  }}
                                  className="text-blue-600 hover:text-blue-900 transition"
                                  title="Edit member"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleRemoveFamilyMember(member._id)}
                                  className="text-red-600 hover:text-red-900 transition"
                                  title="Remove member"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-dashed border-blue-200 text-center">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No family members added</h3>
                <p className="text-gray-500 mb-4">Add your family members to manage them together</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;