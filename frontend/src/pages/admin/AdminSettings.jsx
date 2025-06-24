import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Shield,
  User,
  Mail
} from 'lucide-react';

const AdminSettings = () => {
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    role: 'admin'
  });
  
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    emailPassword: false
  });
  
  const [loading, setLoading] = useState({
    email: false,
    password: false
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAdminData({
        name: user.name || 'System Administrator',
        email: user.email || 'admin@example.com',
        role: user.role || 'admin'
      });
      setEmailData(prev => ({ ...prev, newEmail: user.email || 'admin@example.com' }));
    }
  }, []);

  const handleEmailChange = (field, value) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    
    if (!emailData.newEmail || !emailData.password) {
      setMessage({ type: 'error', text: 'Please fill in all email update fields' });
      return;
    }

    if (emailData.newEmail === adminData.email) {
      setMessage({ type: 'error', text: 'New email must be different from current email' });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, email: true }));
      setMessage({ type: '', text: '' });

      setTimeout(() => {
        setMessage({ type: 'success', text: 'Email updated successfully' });
        setAdminData(prev => ({ ...prev, email: emailData.newEmail }));
        
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.email = emailData.newEmail;
        localStorage.setItem('user', JSON.stringify(storedUser));
        
        setEmailData({ newEmail: emailData.newEmail, password: '' });
        setLoading(prev => ({ ...prev, email: false }));
      }, 1000);

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update email' });
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, password: true }));
      setMessage({ type: '', text: '' });

      setTimeout(() => {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setLoading(prev => ({ ...prev, password: false }));
      }, 1000);

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' });
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Settings</h1>
        <p className="text-gray-400">Manage your admin account settings and preferences</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-900/50 border-green-500 text-green-200' 
            : 'bg-red-900/50 border-red-500 text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Admin Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <p className="text-white font-medium">{adminData.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Current Email</label>
              <p className="text-white font-medium">{adminData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-200 flex items-center gap-1 w-fit">
                <Shield className="w-3 h-3" />
                Administrator
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Update Email</h2>
          </div>
          
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">New Email</label>
              <input
                type="email"
                value={emailData.newEmail}
                onChange={(e) => handleEmailChange('newEmail', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter new email address"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.emailPassword ? 'text' : 'password'}
                  value={emailData.password}
                  onChange={(e) => handleEmailChange('password', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('emailPassword')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showPasswords.emailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading.email}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading.email ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading.email ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-semibold text-white">Change Password</h2>
        </div>
        
        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading.password}
              className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading.password ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {loading.password ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">System Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Environment</label>
            <p className="text-white">Development</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Database</label>
            <p className="text-white">MongoDB</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Server Status</label>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200">
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
