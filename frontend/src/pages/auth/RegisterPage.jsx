import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('customer');
  const { register: registerUser, isLoading, error, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('RegisterPage: User already authenticated, redirecting...');
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'housewife') {
        navigate('/provider/dashboard', { replace: true });
      } else if (user.role === 'customer') {
        navigate('/customer/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'customer'
    }
  });

  const watchedRole = watch('role');

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result.success) {
      // Show role-specific success message
      const userRole = result.user?.role;
      let roleDisplayName = userRole;
      if (userRole === 'housewife' || userRole === 'provider') {
        roleDisplayName = 'provider';
      }
      toast.success(`${roleDisplayName} registered successfully`);

      // Navigate to role-specific dashboard
      if (result.user?.role === 'housewife' || result.user?.role === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      } else if (result.user?.role === 'customer') {
        navigate('/customer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  const roleOptions = [
    {
      value: 'customer',
      title: 'Customer',
      description: 'I want to book services from housewives',
      icon: '👤'
    },
    {
      value: 'housewife',
      title: 'Service Provider',
      description: 'I want to offer my services to customers',
      icon: '👩‍🍳'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-400 hover:text-coral-500 mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Home
        </Link>

        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-coral-500 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Join Our Community
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Create your account to get started
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-xl border border-gray-700 sm:rounded-lg sm:px-10">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                I want to join as:
              </label>
              <div className="space-y-3">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                      watchedRole === option.value
                        ? 'border-coral-500 ring-2 ring-coral-500 bg-coral-900/20'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="sr-only"
                      {...register('role', { required: 'Please select a role' })}
                    />
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{option.icon}</div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          watchedRole === option.value ? 'text-coral-300' : 'text-gray-300'
                        }`}>{option.title}</div>
                        <div className={`text-sm ${
                          watchedRole === option.value ? 'text-coral-400' : 'text-gray-500'
                        }`}>{option.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your full name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your phone number"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number',
                    },
                  })}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2 border rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Create a password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* City Field */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300">
                City
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="city"
                  type="text"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 ${
                    errors['address.city'] ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your city"
                  {...register('address.city', {
                    required: 'City is required',
                  })}
                />
              </div>
              {errors['address.city'] && (
                <p className="mt-1 text-sm text-red-400">{errors['address.city'].message}</p>
              )}
            </div>

            {/* Housewife specific fields */}
            {watchedRole === 'housewife' && (
              <>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
                    Bio (Optional)
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 border-gray-600"
                    placeholder="Tell us about yourself and your skills..."
                    {...register('bio')}
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-300">
                    Years of Experience (Optional)
                  </label>
                  <input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 border-gray-600"
                    placeholder="Enter years of experience"
                    {...register('experience', {
                      min: {
                        value: 0,
                        message: 'Experience cannot be negative',
                      },
                    })}
                  />
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-400">{errors.experience.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-coral-600 focus:ring-coral-500 border-gray-600 bg-gray-700 rounded"
                {...register('terms', {
                  required: 'You must accept the terms and conditions',
                })}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-coral-400 hover:text-coral-300 transition-colors">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-coral-400 hover:text-coral-300 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-400">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-coral-600 hover:bg-coral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500 transition-colors"
              >
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
