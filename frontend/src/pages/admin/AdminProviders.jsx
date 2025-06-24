import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  UserX,
  Star,
  MapPin
} from 'lucide-react';
import { adminAPIService } from '../../services/adminAPI';
// AdminLayout wrapper removed - handled in App.jsx

const AdminProviders = () => {
  const [pendingProviders, setPendingProviders] = useState([]);
  const [approvedProviders, setApprovedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    limit: 20
  });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchProviders();
  }, [activeTab, filters]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'pending') {
        response = await adminAPIService.getPendingProviders(filters);
        if (response.success) {
          setPendingProviders(response.data.providers);
          setPagination(response.data.pagination);
        }
      } else {
        response = await adminAPIService.getApprovedProviders(filters);
        if (response.success) {
          setApprovedProviders(response.data.providers);
          setPagination(response.data.pagination);
        }
      }
      
      if (!response.success) {
        setError('Failed to fetch providers');
      }
    } catch (err) {
      setError('Failed to fetch providers');
      console.error('Fetch providers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleApproveProvider = async (providerId) => {
    try {
      const response = await adminAPIService.approveProvider(providerId);
      if (response.success) {
        // Remove from pending list
        setPendingProviders(prev => prev.filter(p => p._id !== providerId));
        // Refresh data
        fetchProviders();
      }
    } catch (err) {
      console.error('Approve provider error:', err);
      setError('Failed to approve provider');
    }
  };

  const handleRejectProvider = async (providerId) => {
    try {
      const response = await adminAPIService.rejectProvider(providerId);
      if (response.success) {
        // Remove from pending list
        setPendingProviders(prev => prev.filter(p => p._id !== providerId));
        // Refresh data
        fetchProviders();
      }
    } catch (err) {
      console.error('Reject provider error:', err);
      setError('Failed to reject provider');
    }
  };

  const handleToggleStatus = async (providerId) => {
    try {
      const response = await adminAPIService.toggleProviderStatus(providerId);
      if (response.success) {
        // Update the provider in the list
        setApprovedProviders(prev => prev.map(provider => 
          provider._id === providerId 
            ? { ...provider, isActive: !provider.isActive }
            : provider
        ));
        
        // Update selected provider if it's the same one
        if (selectedProvider && selectedProvider._id === providerId) {
          setSelectedProvider(prev => ({ ...prev, isActive: !prev.isActive }));
        }
      }
    } catch (err) {
      console.error('Toggle provider status error:', err);
      setError('Failed to update provider status');
    }
  };

  const handleViewProfile = (provider) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const currentProviders = activeTab === 'pending' ? pendingProviders : approvedProviders;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Service Provider Management</h1>
            <p className="text-gray-400">Approve new providers and manage existing ones</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-5 h-5" />
              <span>{pendingProviders.length} pending approvals</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <UserCheck className="w-5 h-5" />
              <span>{approvedProviders.length} approved providers</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pending Approvals ({pendingProviders.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'approved'
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Approved Providers ({approvedProviders.length})
            </button>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers by name or email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Status Filter (only for approved tab) */}
              {activeTab === 'approved' && (
                <div className="min-w-[150px]">
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {/* Providers Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : currentProviders.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {activeTab === 'pending' ? 'No pending providers' : 'No approved providers found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Contact & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Joined Date
                    </th>
                    {activeTab === 'approved' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentProviders.map((provider) => (
                    <tr key={provider._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-white font-medium">{provider.name}</p>
                          <p className="text-gray-400 text-sm">{provider.email}</p>
                          {provider.rating?.average && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-yellow-400 text-sm">{provider.rating.average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="text-gray-300">{provider.phone || 'Not provided'}</p>
                          {provider.address?.city && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span>{provider.address.city}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {provider.experience || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(provider.createdAt)}
                      </td>
                      {activeTab === 'approved' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            provider.isActive 
                              ? 'bg-green-900 text-green-200' 
                              : 'bg-red-900 text-red-200'
                          }`}>
                            {provider.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProfile(provider)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {activeTab === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveProvider(provider._id)}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Approve Provider"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectProvider(provider._id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Reject Provider"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(provider._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                provider.isActive
                                  ? 'text-red-400 hover:text-red-300 hover:bg-gray-700'
                                  : 'text-green-400 hover:text-green-300 hover:bg-gray-700'
                              }`}
                              title={provider.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {provider.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {((pagination.current - 1) * filters.limit) + 1} to {Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} providers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('page', pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {pagination.current} of {pagination.pages}
              </span>
              <button
                onClick={() => handleFilterChange('page', pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Provider Profile Modal */}
        {showModal && selectedProvider && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-gray-800 rounded-lg max-w-4xl w-full p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Provider Profile</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                      <p className="text-white">{selectedProvider.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                      <p className="text-white">{selectedProvider.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                      <p className="text-white">{selectedProvider.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Experience</label>
                      <p className="text-white">{selectedProvider.experience || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedProvider.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Bio</h3>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-white">{selectedProvider.bio}</p>
                    </div>
                  </div>
                )}

                {/* Address */}
                {selectedProvider.address && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Address</h3>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-white">
                        {selectedProvider.address.street && `${selectedProvider.address.street}, `}
                        {selectedProvider.address.city && `${selectedProvider.address.city}, `}
                        {selectedProvider.address.state && `${selectedProvider.address.state} `}
                        {selectedProvider.address.pincode && selectedProvider.address.pincode}
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Details */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Joined Date</label>
                      <p className="text-white">{formatDate(selectedProvider.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedProvider.isActive 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {selectedProvider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {selectedProvider.rating?.average && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400">{selectedProvider.rating.average.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-400 text-sm">({selectedProvider.rating.count} reviews)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                  {activeTab === 'pending' ? (
                    <>
                      <button
                        onClick={() => {
                          handleApproveProvider(selectedProvider._id);
                          setShowModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Approve Provider
                      </button>
                      <button
                        onClick={() => {
                          handleRejectProvider(selectedProvider._id);
                          setShowModal(false);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Reject Provider
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(selectedProvider._id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedProvider.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {selectedProvider.isActive ? 'Deactivate Provider' : 'Activate Provider'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    );
};

export default AdminProviders;
