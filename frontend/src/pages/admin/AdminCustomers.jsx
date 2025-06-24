import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  UserX, 
  UserCheck,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { adminAPIService } from '../../services/adminAPI';
// AdminLayout wrapper removed - handled in App.jsx

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
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
    fetchCustomers();
  }, [filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminAPIService.getCustomers(filters);
      if (response.success) {
        setCustomers(response.data.customers);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch customers');
      }
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Fetch customers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handleToggleStatus = async (customerId) => {
    try {
      const response = await adminAPIService.toggleCustomerStatus(customerId);
      if (response.success) {
        // Update the customer in the list
        setCustomers(prev => prev.map(customer => 
          customer._id === customerId 
            ? { ...customer, isActive: !customer.isActive }
            : customer
        ));
        
        // Update selected customer if it's the same one
        if (selectedCustomer && selectedCustomer._id === customerId) {
          setSelectedCustomer(prev => ({ ...prev, isActive: !prev.isActive }));
        }
      }
    } catch (err) {
      console.error('Toggle customer status error:', err);
      setError('Failed to update customer status');
    }
  };

  const handleViewProfile = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Customer Management</h1>
            <p className="text-gray-400">Manage and monitor customer accounts</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span>{pagination.total} total customers</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Status Filter */}
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
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-white font-medium">{customer.name}</p>
                          <p className="text-gray-400 text-sm">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="text-gray-300">{customer.phone || 'Not provided'}</p>
                          {customer.address?.city && (
                            <p className="text-gray-400">{customer.address.city}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.isActive 
                            ? 'bg-green-900 text-green-200' 
                            : 'bg-red-900 text-red-200'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProfile(customer)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(customer._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              customer.isActive
                                ? 'text-red-400 hover:text-red-300 hover:bg-gray-700'
                                : 'text-green-400 hover:text-green-300 hover:bg-gray-700'
                            }`}
                            title={customer.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {customer.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
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
              Showing {((pagination.current - 1) * filters.limit) + 1} to {Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} customers
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

        {/* Customer Profile Modal */}
        {showModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Customer Profile</h2>
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
                      <p className="text-white">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                      <p className="text-white">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                      <p className="text-white">{selectedCustomer.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCustomer.isActive 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {selectedCustomer.address && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Address</h3>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-white">
                        {selectedCustomer.address.street && `${selectedCustomer.address.street}, `}
                        {selectedCustomer.address.city && `${selectedCustomer.address.city}, `}
                        {selectedCustomer.address.state && `${selectedCustomer.address.state} `}
                        {selectedCustomer.address.pincode && selectedCustomer.address.pincode}
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
                      <p className="text-white">{formatDate(selectedCustomer.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Last Updated</label>
                      <p className="text-white">{formatDate(selectedCustomer.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleToggleStatus(selectedCustomer._id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCustomer.isActive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {selectedCustomer.isActive ? 'Deactivate Account' : 'Activate Account'}
                  </button>
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

export default AdminCustomers;
