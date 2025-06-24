# 🚀 Complete Theme Implementation Steps

## Step 4: Update Customer Services Page

```javascript
// File: src/pages/customer/CustomerServices.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, FormInput, LoadingSpinner } from '../../components/shared';
import { Search, Filter, MapPin, Star } from 'lucide-react';

const CustomerServices = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  if (loading) {
    return <LoadingSpinner size="lg" theme="dark" text="Loading services..." fullScreen={true} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Search Header */}
      <Card theme="dark" className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <FormInput
            theme="dark"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button theme="dark" variant="primary" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
          <Button theme="dark" variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service._id} theme="dark" hover={true}>
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img 
                src={service.images?.[0] || '/placeholder-service.jpg'} 
                alt={service.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{service.title}</h3>
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{service.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-gray-300 text-sm">{service.rating || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{service.location?.city}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-coral-400 font-bold text-lg">₹{service.price}</span>
              <Button theme="dark" variant="primary" size="sm">
                Book Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerServices;
```

## Step 5: Update Customer Bookings Page

```javascript
// File: src/pages/customer/CustomerBookings.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner } from '../../components/shared';
import { Calendar, Clock, MapPin, User, MessageSquare } from 'lucide-react';

const CustomerBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'completed': return 'text-blue-400 bg-blue-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" theme="dark" text="Loading bookings..." fullScreen={true} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-gray-300">Track and manage your service bookings</p>
      </div>

      {/* Tabs */}
      <Card theme="dark" className="mb-6">
        <div className="flex space-x-1">
          {['all', 'pending', 'confirmed', 'completed'].map((tab) => (
            <Button
              key={tab}
              theme="dark"
              variant={activeTab === tab ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking._id} theme="dark" hover={true}>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{booking.service?.title}</h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                      <User className="w-4 h-4" />
                      <span>{booking.provider?.name}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{booking.scheduledTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.address?.city}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <span className="text-coral-400 font-bold text-lg">₹{booking.totalAmount}</span>
                <div className="flex gap-2">
                  <Button theme="dark" variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  {booking.status === 'completed' && (
                    <Button theme="dark" variant="primary" size="sm">
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerBookings;
```

## Step 6: Update Authentication Pages

```javascript
// File: src/pages/auth/LoginPage.jsx - Update form section
<Card theme="light" className="w-full max-w-md">
  <div className="text-center mb-8">
    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
    <p className="text-gray-600 mt-2">Sign in to your account</p>
  </div>

  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    <FormInput
      theme="light"
      label="Email Address"
      type="email"
      name="email"
      {...register('email')}
      error={errors.email?.message}
      required
    />

    <FormInput
      theme="light"
      label="Password"
      type={showPassword ? 'text' : 'password'}
      name="password"
      {...register('password')}
      error={errors.password?.message}
      required
    />

    <Button
      type="submit"
      theme="light"
      variant="primary"
      size="lg"
      loading={isLoading}
      className="w-full"
    >
      Sign In
    </Button>
  </form>
</Card>
```

## Step 7: Backend Integration Verification

```javascript
// Ensure all API calls remain functional
// File: src/services/api.js - No changes needed, just verify endpoints work

// Test these endpoints:
// - GET /api/customer/dashboard
// - GET /api/customer/services
// - GET /api/customer/bookings
// - POST /api/customer/bookings
// - GET /api/customer/profile
// - PUT /api/customer/profile
```

## Step 8: Routing and Context Updates

```javascript
// File: src/App.jsx - Verify customer routes use ProtectedRoute
<Route path="/customer/dashboard" element={
  <ProtectedRoute requiredRole="customer">
    <CustomerLayout>
      <CustomerDashboard />
    </CustomerLayout>
  </ProtectedRoute>
} />

<Route path="/customer/services" element={
  <ProtectedRoute requiredRole="customer">
    <CustomerLayout>
      <CustomerServices />
    </CustomerLayout>
  </ProtectedRoute>
} />

// Continue for all customer routes...
```

## Step 9: Testing Commands

```bash
# 1. Clear cache and storage
# In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();

# 2. Start backend
cd backend
npm start

# 3. Start frontend  
cd frontend
npm start

# 4. Test user flows
# - Customer signup/login
# - Browse services
# - Make booking
# - View dashboard
# - Logout
```

## Step 10: Verification Checklist

### UI/UX Verification:
- [ ] All modules use consistent dark theme
- [ ] Customer module uses coral accents
- [ ] Admin module uses red accents  
- [ ] Provider module uses blue accents
- [ ] All shared components render correctly
- [ ] Responsive design works on all screen sizes
- [ ] Loading states display properly
- [ ] Error states display properly

### Functionality Verification:
- [ ] Customer registration works
- [ ] Customer login/logout works
- [ ] Service browsing works
- [ ] Booking creation works
- [ ] Profile management works
- [ ] All API endpoints respond correctly
- [ ] Protected routes work correctly
- [ ] Navigation between pages works

### Regression Testing:
- [ ] Admin module still works
- [ ] Provider module still works  
- [ ] Authentication flow unchanged
- [ ] Database operations unchanged
- [ ] No console errors
- [ ] No broken functionality

## Deliverables Summary

1. ✅ **Shared Components Library** - Complete
2. ✅ **Unified Layout System** - Complete  
3. ✅ **Customer Dashboard Updated** - Complete
4. 🔄 **All Customer Pages** - In Progress
5. 🔄 **Authentication Pages** - In Progress
6. ⏳ **Backend Integration** - Pending
7. ⏳ **Testing & Verification** - Pending

The theme unification is well underway with a solid foundation of shared components and unified layouts!
