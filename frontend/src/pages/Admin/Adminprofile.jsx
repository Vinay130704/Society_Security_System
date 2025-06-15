import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Camera, Users, LogOut, Lock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminProfile = () => {
    const [profile, setProfile] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/profile/get-profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data.user);
                reset(response.data.user);
                if (response.data.user.familyMembers) {
                    setFamilyMembers(response.data.user.familyMembers);
                }
            } catch (error) {
                toast.error('Failed to load profile');
                console.error('Profile fetch error:', error);
            }
        };

        fetchProfile();
    }, [reset]);

    // Handle profile update
    const onSubmit = async (data) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/api/profile/update-profile', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.user);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
            console.error('Update error:', error);
        }
    };

    // Handle profile picture change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Upload profile picture
    const uploadProfilePicture = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('profilePicture', selectedFile);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/profile/picture', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Update profile picture in state without refreshing the page
            setProfile(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
            setSelectedFile(null);
            setPreviewImage(''); // Clear the preview after successful upload
            toast.success('Profile picture updated successfully');
        } catch (error) {
            console.error('Upload failed:', {
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(error.response?.data?.message || 'Upload failed');
        }
    };

    // Add family member
    const addFamilyMember = async (memberData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/profile/add-familymember', memberData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFamilyMembers([...familyMembers, response.data.familyMember]);
            toast.success('Family member added');
        } catch (error) {
            toast.error('Failed to add family member');
            console.error('Add family member error:', error);
        }
    };

    // Remove family member
    const removeFamilyMember = async (memberId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/profile/family/${memberId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFamilyMembers(prev => prev.filter(member => member._id !== memberId));
            toast.success('Family member removed');
        } catch (error) {
            toast.error('Failed to remove family member');
            console.error('Remove error:', error);
        }
    };

    // Fetch entry/exit logs
    const fetchLogs = async () => {
        try {
            if (!profile) return;
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/profile/logs/${profile._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data.logs);
        } catch (error) {
            toast.error('Failed to load logs');
            console.error('Logs fetch error:', error);
        }
    };

    useEffect(() => {
        if (profile) {
            fetchLogs();
        }
    }, [profile]);

    if (!profile) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Profile</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Profile Info */}
                <div className="lg:w-1/3 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col items-center">
                                {/* Profile Picture */}
                                <div className="relative mb-4">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                        ) : profile.profilePicture ? (
                                            <img
                                                src={`http://localhost:5000/${profile.profilePicture}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/default-profile.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                                <User size={48} className="text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="profilePicture"
                                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-md"
                                    >
                                        <Camera size={20} />
                                        <input
                                            id="profilePicture"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                {/* Save Picture Button */}
                                {selectedFile && (
                                    <button
                                        onClick={uploadProfilePicture}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-4 shadow-md"
                                    >
                                        Save Picture
                                    </button>
                                )}

                                {/* Profile Info */}
                                <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                                <p className="text-gray-600 capitalize">{profile.role}</p>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            {...register('name', { required: 'Name is required' })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            defaultValue={profile.name}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            {...register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: 'Invalid email address'
                                                }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            defaultValue={profile.email}
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            {...register('phone')}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            defaultValue={profile.phone}
                                        />
                                    </div>

                                    <div className="flex space-x-3 pt-2">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</h3>
                                        <p className="mt-1 text-gray-800">{profile.email}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</h3>
                                        <p className="mt-1 text-gray-800">{profile.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Type</h3>
                                        <p className="mt-1 text-gray-800 capitalize">{profile.role}</p>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                                        >
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={() => window.location.href = '/reset-password'}
                                            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            <Lock size={16} />
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Family Members Section */}
                    {profile.role === 'resident' && (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                        <Users className="mr-2" size={20} />
                                        Family Members
                                    </h3>
                                    <AddFamilyMemberForm onAdd={addFamilyMember} />
                                </div>

                                {familyMembers.length > 0 ? (
                                    <div className="space-y-3">
                                        {familyMembers.map(member => (
                                            <FamilyMemberCard
                                                key={member._id}
                                                member={member}
                                                onRemove={removeFamilyMember}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Users size={32} className="mx-auto text-gray-400" />
                                        <p className="mt-2 text-gray-500">No family members added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Activity Logs */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity Logs</h3>

                            {logs.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {logs.map(log => (
                                                <tr key={log._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${log.type === 'entry' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                        {log.method}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {log.verifiedBy?.name || 'System'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <LogOut size={32} className="mx-auto text-gray-400" />
                                    <p className="mt-2 text-gray-500">No activity logs found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Family Member Card Component
const FamilyMemberCard = ({ member, onRemove }) => {
    return (
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div>
                <h4 className="font-medium text-gray-800">{member.name}</h4>
                <div className="flex items-center mt-1 space-x-3">
                    <span className="text-sm text-gray-600 capitalize">{member.relation}</span>
                    {member.gender && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full capitalize">
                            {member.gender}
                        </span>
                    )}
                </div>
            </div>
            <button
                onClick={() => onRemove(member._id)}
                className="text-red-500 hover:text-red-700 transition"
                aria-label="Remove family member"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

// Add Family Member Form Component
const AddFamilyMemberForm = ({ onAdd }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        relation: '',
        gender: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.relation) return;
        onAdd(formData);
        setFormData({ name: '', relation: '', gender: '' });
        setIsAdding(false);
    };

    return (
        <div className="relative">
            {!isAdding ? (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition"
                    aria-label="Add family member"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1">Add</span>
                </button>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="absolute right-0 mt-2 w-72 bg-white p-4 shadow-xl rounded-lg border border-gray-200 z-10"
                >
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Add Family Member</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                                placeholder="Full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                            <input
                                type="text"
                                name="relation"
                                value={formData.relation}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                                placeholder="Relationship"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Add Member
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AdminProfile;