import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { providerAPI } from '../../services/api';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  Briefcase
} from 'lucide-react';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchServices();
  }, [statusFilter, categoryFilter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      
      const response = await providerAPI.getMyServices(params);
      setServices(response.data.services);
    } catch (err) {
      setError('Failed to load services');
      console.error('Services error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await providerAPI.deleteService(serviceId);
      setServices(services.filter(service => service._id !== serviceId));
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await providerAPI.updateService(serviceId, { status: newStatus });
      setServices(services.map(service => 
        service._id === serviceId ? { ...service, status: newStatus } : service
      ));
    } catch (err) {
      setError('Failed to update service status');
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'cooking', label: 'Cooking' },
    { value: 'tailoring', label: 'Tailoring' },
    { value: 'tuition', label: 'Tuition' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'childcare', label: 'Childcare' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">My Services</h1>
            <p className="text-gray-400">Manage your service listings</p>
          </div>
          <Link
            to="/provider/services/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Services
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or description..."
                  className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center p-4 bg-red-900 border border-red-700 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Briefcase className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No services found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first service listing'
              }
            </p>
            <Link
              to="/provider/services/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Your First Service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service._id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {/* Service Image */}
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center';
                    }}
                  />

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      service.status === 'active' ? 'bg-green-600 text-green-100' :
                      service.status === 'inactive' ? 'bg-gray-600 text-gray-100' :
                      'bg-yellow-600 text-yellow-100'
                    }`}>
                      {service.status}
                    </span>
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-2 right-2">
                    <div className="relative group">
                      <button className="p-1 bg-gray-800 rounded-full shadow-sm border border-gray-600">
                        <MoreVertical className="h-4 w-4 text-gray-300" />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="py-1">
                          <Link
                            to={`/provider/services/${service._id}/edit`}
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                          <button
                            onClick={() => toggleServiceStatus(service._id, service.status)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                          >
                            {service.status === 'active' ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteService(service._id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-600 text-blue-100 rounded-full">
                      {service.category}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {service.pricing?.type === 'negotiable' ? 'Negotiable' :
                       service.pricing?.amount ? `₹${service.pricing.amount}${service.pricing.type === 'hourly' ? '/hr' : ''}` :
                       'Price not set'}
                    </span>
                  </div>

                  <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">
                    {service.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>
                      {service.duration?.estimated ? `${service.duration.estimated} min` : 'Duration varies'}
                    </span>
                    <span>
                      {service.availability?.days?.length || 0} days available
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default ProviderServices;
