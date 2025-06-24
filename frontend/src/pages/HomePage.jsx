import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Users,
  CheckCircle,
  ArrowRight,
  Heart,
  Shield,
  Clock,
  Award,
  ChefHat,
  Scissors,
  BookOpen,
  Sparkles,
  Home,
  Baby,
  Phone,
  Mail,
  Instagram,
  Linkedin,
  MessageCircle,

  Play,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Zap,
  Globe,
  Camera,
  Video,
  Gift,
  Target,
  Headphones,
  Bell,
  Eye,
  ThumbsUp,
  Calendar,
  Filter,
  ChevronRight,
  Loader2,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';
import { servicesAPI } from '../services/api';

const HomePage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);

  // New state for enhanced features
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [liveActivity, setLiveActivity] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    servicesCompleted: 0,
    verifiedProviders: 0,
    citiesCovered: 0
  });
  const [animatedStats, setAnimatedStats] = useState({
    totalUsers: 0,
    servicesCompleted: 0,
    verifiedProviders: 0,
    citiesCovered: 0
  });
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [recentBookings, setRecentBookings] = useState([]);
  const navigate = useNavigate();



  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 4); // Fixed to use hardcoded length
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize platform stats and animations
  useEffect(() => {
    // Simulate fetching real stats
    const stats = {
      totalUsers: 15420,
      servicesCompleted: 8750,
      verifiedProviders: 2340,
      citiesCovered: 45
    };
    setPlatformStats(stats);

    // Animate counters
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    Object.keys(stats).forEach(key => {
      let current = 0;
      const target = stats[key];
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedStats(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }));
      }, stepDuration);
    });
  }, []);

  // Typing animation for hero text
  useEffect(() => {
    const texts = ['Home Expertise', 'Local Talent', 'Trusted Services', 'Community Skills'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeText = () => {
      const currentText = texts[textIndex];

      if (isDeleting) {
        setTypedText(currentText.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypedText(currentText.substring(0, charIndex + 1));
        charIndex++;
      }

      if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => isDeleting = true, 1500);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }

      setTimeout(typeText, isDeleting ? 50 : 100);
    };

    typeText();
  }, []);

  // Floating CTA visibility - always show
  useEffect(() => {
    setShowFloatingCTA(true);
  }, []);

  // Simulate live activity
  useEffect(() => {
    const activities = [
      { user: 'Priya S.', action: 'booked cooking service', time: '2 min ago', location: 'Bangalore' },
      { user: 'Raj K.', action: 'hired tutor', time: '5 min ago', location: 'Mumbai' },
      { user: 'Meera P.', action: 'completed tailoring order', time: '8 min ago', location: 'Delhi' },
      { user: 'Amit R.', action: 'booked cleaning service', time: '12 min ago', location: 'Pune' },
      { user: 'Sita M.', action: 'hired beauty expert', time: '15 min ago', location: 'Chennai' }
    ];

    setLiveActivity(activities);
    setRecentBookings(activities.slice(0, 3));

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity = {
        user: `User ${Math.floor(Math.random() * 100)}`,
        action: 'booked a service',
        time: 'just now',
        location: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Chennai'][Math.floor(Math.random() * 5)]
      };

      setLiveActivity(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate service showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % 6); // Fixed to use hardcoded length
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simulate reverse geocoding
          setUserLocation('Bangalore, Karnataka');
        },
        () => {
          setUserLocation('India');
        }
      );
    }
  }, []);



  // Search suggestions
  const searchSuggestions = [
    'Cooking services near me',
    'Home tutoring',
    'Tailoring and alterations',
    'Beauty and wellness',
    'House cleaning',
    'Childcare services',
    'Elderly care',
    'Pet care',
    'Gardening services',
    'Event planning'
  ];

  // Trust indicators
  const trustBadges = [
    { icon: Shield, label: 'Verified Providers', count: '2,340+' },
    { icon: Star, label: 'Average Rating', count: '4.8/5' },
    { icon: CheckCircle, label: 'Background Checked', count: '100%' },
    { icon: Award, label: 'Service Guarantee', count: '24/7' }
  ];

  // Success metrics
  const successMetrics = [
    {
      icon: Users,
      label: 'Happy Customers',
      value: animatedStats.totalUsers,
      suffix: '+',
      color: 'text-blue-500'
    },
    {
      icon: CheckCircle,
      label: 'Services Completed',
      value: animatedStats.servicesCompleted,
      suffix: '+',
      color: 'text-green-500'
    },
    {
      icon: Shield,
      label: 'Verified Providers',
      value: animatedStats.verifiedProviders,
      suffix: '+',
      color: 'text-purple-500'
    },
    {
      icon: Globe,
      label: 'Cities Covered',
      value: animatedStats.citiesCovered,
      suffix: '+',
      color: 'text-coral-500'
    }
  ];

  // Features data
  const features = [
    {
      icon: Shield,
      title: 'Verified Providers',
      description: 'All service providers are thoroughly verified and background checked for your safety and peace of mind.'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'Read authentic reviews and ratings from real customers to make informed decisions.'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book services at your convenience with flexible timing options that fit your schedule.'
    },
    {
      icon: Award,
      title: 'Affordable Pricing',
      description: 'Get premium quality services at competitive prices that fit your budget perfectly.'
    },
  ];

  // Enhanced services data
  const services = [
    {
      icon: ChefHat,
      title: 'Cooking',
      description: 'Home-cooked meals, catering, and culinary expertise',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      providers: 450,
      avgPrice: '₹300/meal',
      rating: 4.8,
      popular: true,
      features: ['Traditional recipes', 'Dietary customization', 'Bulk orders'],
      gradient: 'from-orange-400 to-red-500'
    },
    {
      icon: BookOpen,
      title: 'Tutoring',
      description: 'Academic support and skill development for all ages',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      providers: 320,
      avgPrice: '₹500/hour',
      rating: 4.9,
      popular: false,
      features: ['All subjects', 'Exam preparation', 'Online/offline'],
      gradient: 'from-blue-400 to-indigo-500'
    },
    {
      icon: Scissors,
      title: 'Tailoring',
      description: 'Custom clothing, alterations, and fashion design',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      providers: 280,
      avgPrice: '₹200/piece',
      rating: 4.7,
      popular: true,
      features: ['Custom fitting', 'Designer wear', 'Quick alterations'],
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      icon: Sparkles,
      title: 'Beauty',
      description: 'Skincare, makeup, and wellness treatments',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      providers: 190,
      avgPrice: '₹800/session',
      rating: 4.8,
      popular: false,
      features: ['Bridal makeup', 'Skincare', 'Hair styling'],
      gradient: 'from-pink-400 to-rose-500'
    },
    {
      icon: Home,
      title: 'Cleaning',
      description: 'House cleaning and organization services',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      providers: 380,
      avgPrice: '₹400/visit',
      rating: 4.6,
      popular: true,
      features: ['Deep cleaning', 'Regular maintenance', 'Eco-friendly'],
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      icon: Baby,
      title: 'Childcare',
      description: 'Babysitting and child supervision services',
      image: 'https://images.unsplash.com/photo-1544776527-6ca5ac832fb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      providers: 150,
      avgPrice: '₹300/hour',
      rating: 4.9,
      popular: false,
      features: ['Experienced caregivers', 'Educational activities', 'Flexible hours'],
      gradient: 'from-yellow-400 to-orange-500'
    },
  ];

  // How it works steps
  const steps = [
    {
      number: 1,
      title: 'Sign Up',
      description: 'Create your account as a customer or service provider'
    },
    {
      number: 2,
      title: 'Browse or Offer Services',
      description: 'Find services you need or list your own expertise'
    },
    {
      number: 3,
      title: 'Book or Receive Bookings',
      description: 'Schedule appointments or accept service requests'
    },
    {
      number: 4,
      title: 'Get Notified & Review',
      description: 'Stay updated and share your experience'
    },
  ];

  // Pricing plans
  const pricingPlans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Browse all services',
        'Basic customer support',
        'Standard booking features',
        'Mobile app access'
      ],
      highlighted: true
    },
    {
      name: 'Basic',
      price: '₹99',
      period: 'month',
      description: 'For regular service users',
      features: [
        'Everything in Free',
        'Priority booking',
        'Advanced filters',
        'Booking history',
        'Email notifications'
      ]
    },
    {
      name: 'Premium',
      price: '₹199',
      period: 'month',
      description: 'For power users and providers',
      features: [
        'Everything in Basic',
        'Featured listings',
        'Analytics dashboard',
        'Premium support',
        'Custom branding',
        'API access'
      ]
    },
  ];

  // Enhanced testimonials with success stories
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Happy Customer',
      avatar: 'PS',
      rating: 5,
      quote: 'HouseWise connected me with amazing local talent. The cooking service I booked was exceptional! My family loves the traditional recipes.',
      service: 'Cooking Services',
      location: 'Bangalore',
      image: '/api/placeholder/80/80',
      verified: true,
      beforeAfter: {
        before: 'Struggled with daily cooking',
        after: 'Enjoying homemade meals daily'
      }
    },
    {
      name: 'Meera Patel',
      role: 'Successful Provider',
      avatar: 'MP',
      rating: 5,
      quote: 'This platform helped me turn my tailoring skills into a thriving business. I now earn ₹25,000+ monthly and have 50+ regular customers!',
      service: 'Tailoring Services',
      location: 'Mumbai',
      image: '/api/placeholder/80/80',
      verified: true,
      beforeAfter: {
        before: 'Unemployed housewife',
        after: 'Successful entrepreneur'
      }
    },
    {
      name: 'Rajesh Kumar',
      role: 'Satisfied Parent',
      avatar: 'RK',
      rating: 5,
      quote: 'Found the perfect tutor for my daughter through HouseWise. Her grades improved from C to A+ in just 3 months!',
      service: 'Tutoring Services',
      location: 'Delhi',
      image: '/api/placeholder/80/80',
      verified: true,
      beforeAfter: {
        before: 'Daughter struggling in studies',
        after: 'Top performer in class'
      }
    },
    {
      name: 'Anita Singh',
      role: 'Working Mother',
      avatar: 'AS',
      rating: 5,
      quote: 'The childcare service is a lifesaver! Professional, caring, and my kids absolutely love their caregiver.',
      service: 'Childcare Services',
      location: 'Pune',
      image: '/api/placeholder/80/80',
      verified: true,
      beforeAfter: {
        before: 'Worried about leaving kids',
        after: 'Peace of mind at work'
      }
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: 'How do I get started on HouseWise?',
      answer: 'Simply sign up for a free account, complete your profile, and start browsing services or listing your own expertise.'
    },
    {
      question: 'Are all service providers verified?',
      answer: 'Yes, we thoroughly verify all service providers through background checks and skill assessments to ensure quality and safety.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including credit/debit cards, UPI, net banking, and digital wallets.'
    },
    {
      question: 'Can I cancel or reschedule a booking?',
      answer: 'Yes, you can cancel or reschedule bookings up to 2 hours before the scheduled time without any charges.'
    },
    {
      question: 'How do you ensure service quality?',
      answer: 'We maintain quality through our rating system, customer reviews, and regular feedback collection from both customers and providers.'
    },
  ];

  // Team members
  const teamMembers = [
    {
      name: 'Appaji B',
      role: 'Founder',
      avatar: 'AB',
      image: '/AppajiB.jpg',
      description: 'Visionary behind HouseWise, passionate about empowering home-based entrepreneurs.',
      isFounder: true
    },
    {
      name: 'Varun A S',
      role: 'Co-Founder',
      avatar: 'VA',
      image: '/Varun.jpg',
      description: 'Technical lead driving the platform\'s seamless UX and innovative features.',
      isFounder: true
    },
  ];

  // Utility functions and handlers
  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/customer/services?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation('Bangalore, Karnataka');
          // Could integrate with actual geocoding service
        },
        () => {
          alert('Please enable location access for better service recommendations');
        }
      );
    }
  };

  const handleServiceClick = (service) => {
    navigate(`/customer/services?category=${service.title.toLowerCase()}`);
  };

  const handleQuickBook = () => {
    navigate('/register');
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };




  // Enhanced Hero Section Component
  const HeroSection = () => {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Professional home services"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold font-heading text-white mb-6">
              Empower{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 to-coral-500">
                Home Expertise
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect with skilled housewives in your community for authentic home services.
              From cooking to tutoring, discover trusted expertise right at your doorstep.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/register"
                className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get Started as Customer
              </Link>

              <Link
                to="/register"
                className="border-2 border-white text-white hover:bg-white hover:text-coral-500 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Statistics Section Component
  const StatisticsSection = () => {
    return (
      <section className="py-16 bg-gradient-to-r from-coral-500 to-coral-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Trusted by Thousands Across India
            </h2>
            <p className="text-xl text-coral-100 max-w-2xl mx-auto">
              Join our growing community of satisfied customers and successful service providers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {successMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <metric.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {formatNumber(metric.value)}{metric.suffix}
                </div>
                <div className="text-coral-100 font-medium">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Enhanced Features Section Component
  const FeaturesSection = () => {
    return (
      <section id="features" className="py-20 bg-white dark:bg-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-4">
              Why Choose HouseWise?
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300 max-w-3xl mx-auto">
              We're committed to connecting you with the best local service providers with cutting-edge features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-ivory dark:bg-charcoal-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-coral-100 dark:border-charcoal-700 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-coral-500/5 to-coral-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-coral-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold font-heading text-charcoal-900 dark:text-ivory mb-4 group-hover:text-coral-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-coral-500 text-sm font-medium">
                      Learn more <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional trust indicators */}
          <div className="mt-16 text-center">
            <div className="flex flex-wrap justify-center items-center gap-8 text-charcoal-600 dark:text-charcoal-300">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>ISO Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span>Award Winning</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Enhanced Services Section Component
  const ServicesSection = () => {
    return (
      <section id="services" className="py-20 bg-coral-50 dark:bg-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-4">
              Popular Services
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300 max-w-3xl mx-auto">
              Discover trending home services with verified providers and transparent pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-charcoal-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-coral-100 dark:border-charcoal-700 relative cursor-pointer"
                onClick={() => handleServiceClick(service)}
              >
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Popular
                    </div>
                  </div>
                )}

                {/* Service image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

                  {/* Service icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Floating stats */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-center text-white text-sm">
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Users className="w-3 h-3" />
                        {service.providers}+ providers
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        {service.rating}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold font-heading text-charcoal-900 dark:text-ivory group-hover:text-coral-500 transition-colors">
                      {service.title}
                    </h3>
                    <div className="text-coral-500 font-bold text-lg">
                      {service.avgPrice}
                    </div>
                  </div>

                  <p className="text-charcoal-600 dark:text-charcoal-300 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Service features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {service.features.slice(0, 2).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {service.features.length > 2 && (
                        <span className="text-xs text-charcoal-400">
                          +{service.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className="w-full bg-coral-500 hover:bg-coral-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceClick(service);
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    Book {service.title}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Services CTA */}
          <div className="text-center mt-12">
            <button
              onClick={() => {
                const element = document.getElementById('services');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="inline-flex items-center gap-2 bg-charcoal-900 dark:bg-ivory text-ivory dark:text-charcoal-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-charcoal-800 dark:hover:bg-coral-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              Explore Our Services
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    );
  };

  // How It Works Section Component
  const HowItWorksSection = () => {
    return (
      <section id="how-it-works" className="py-20 bg-white dark:bg-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-4">
              How It Works
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300 max-w-3xl mx-auto">
              Getting started with HouseWise is simple and straightforward
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-coral-200 via-coral-500 to-coral-200 transform -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative text-center">
                  {/* Step number */}
                  <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white font-heading">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold font-heading text-charcoal-900 dark:text-ivory mb-4">
                    {step.title}
                  </h3>
                  <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Pricing Section Component
  const PricingSection = () => {
    return (
      <section id="pricing" className="py-20 bg-coral-50 dark:bg-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-4">
              Simple Pricing
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300 max-w-3xl mx-auto">
              Choose the plan that works best for you. Start free and upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-charcoal-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.highlighted
                    ? 'ring-2 ring-coral-500 scale-105 bg-gradient-to-br from-white to-coral-50 dark:from-charcoal-800 dark:to-charcoal-700'
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-coral-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-coral-500">{plan.price}</span>
                    <span className="text-charcoal-600 dark:text-charcoal-300">/{plan.period}</span>
                  </div>
                  <p className="text-charcoal-600 dark:text-charcoal-300">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-coral-500 mr-3 flex-shrink-0" />
                      <span className="text-charcoal-700 dark:text-charcoal-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-coral-500 hover:bg-coral-600 text-white'
                      : 'border-2 border-coral-500 text-coral-500 hover:bg-coral-500 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Testimonials Section Component
  const TestimonialsSection = () => {
    return (
      <section id="testimonials" className="py-20 bg-white dark:bg-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300 max-w-3xl mx-auto">
              Real feedback from our community of customers and service providers
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <motion.div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-ivory dark:bg-charcoal-900 rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">

                      <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-white font-bold text-lg font-heading">
                          {testimonial.avatar}
                        </span>
                      </div>

                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>

                      <blockquote className="text-lg text-charcoal-700 dark:text-charcoal-300 mb-6 italic">
                        "{testimonial.quote}"
                      </blockquote>

                      <div>
                        <h4 className="font-semibold font-heading text-charcoal-900 dark:text-ivory">
                          {testimonial.name}
                        </h4>
                        <p className="text-coral-500 font-medium">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-coral-500' : 'bg-charcoal-300 dark:bg-charcoal-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // FAQ Section Component
  const FAQSection = () => {
    return (
      <section id="faq" className="py-20 bg-coral-50 dark:bg-charcoal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300">
              Everything you need to know about HouseWise
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-charcoal-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-coral-50 dark:hover:bg-charcoal-700 transition-colors"
                >
                  <span className="font-semibold text-charcoal-900 dark:text-ivory">
                    {faq.question}
                  </span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-coral-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-coral-500" />
                  )}
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === index ? 'auto' : 0,
                    opacity: openFAQ === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-charcoal-600 dark:text-charcoal-300">
                    {faq.answer}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // About Us Section Component
  const AboutUsSection = () => {
    return (
      <section id="about-us" className="py-20 bg-white dark:bg-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-4">
              Meet the Team Behind HouseWise
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300 max-w-3xl mx-auto">
              Passionate individuals working to empower home-based entrepreneurs and connect communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`relative bg-ivory dark:bg-charcoal-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center hover:-translate-y-2 ${
                  member.isFounder
                    ? 'ring-2 ring-yellow-400 scale-105 bg-gradient-to-br from-ivory to-yellow-50 dark:from-charcoal-900 dark:to-yellow-900/20'
                    : 'ring-2 ring-gray-300 dark:ring-charcoal-600'
                }`}
              >
                {member.isFounder && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-charcoal-900 px-4 py-2 rounded-full text-sm font-bold">
                      {member.role}
                    </span>
                  </div>
                )}

                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover shadow-lg"
                    onError={(e) => {
                      // Fallback to avatar if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className={`w-24 h-24 ${
                    member.isFounder
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                      : 'bg-gradient-to-br from-coral-500 to-coral-600'
                  } rounded-full flex items-center justify-center absolute top-0 left-0 hidden`}>
                    <span className="text-white font-bold text-2xl font-heading">
                      {member.avatar}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-2">
                  {member.name}
                </h3>
                <p className="text-coral-500 font-medium mb-4">{member.role}</p>
                <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Contact Section Component
  const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission
      console.log('Form submitted:', formData);
      setFormData({ name: '', email: '', message: '' });
    };

    return (
      <section id="contact" className="py-20 bg-coral-50 dark:bg-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-300 max-w-3xl mx-auto">
              Have questions or suggestions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-charcoal-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-ivory focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-charcoal-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-ivory focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-charcoal-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-ivory focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white py-3 rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 text-coral-500 mr-4" />
                    <span className="text-charcoal-700 dark:text-charcoal-300">
                      hello@housewise.com
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 text-coral-500 mr-4" />
                    <span className="text-charcoal-700 dark:text-charcoal-300">
                      +91 98765 43210
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold font-heading text-charcoal-900 dark:text-ivory mb-6">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  {[
                    { icon: Linkedin, href: '#', label: 'LinkedIn' },
                    { icon: Instagram, href: '#', label: 'Instagram' },
                    { icon: MessageCircle, href: '#', label: 'WhatsApp' },
                  ].map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 bg-coral-500 hover:bg-coral-600 text-white rounded-lg flex items-center justify-center transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={social.label}
                    >
                      <social.icon className="w-6 h-6" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Footer Component
  const Footer = () => {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e) => {
      e.preventDefault();
      console.log('Newsletter signup:', email);
      setEmail('');
    };

    return (
      <footer className="bg-charcoal-900 text-ivory">
        {/* Wave separator */}
        <div className="relative">
          <svg
            className="w-full h-12 text-coral-50 dark:text-charcoal-900"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-coral-500 to-coral-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg font-heading">H</span>
                </div>
                <span className="text-2xl font-bold font-heading">HouseWise</span>
              </div>
              <p className="text-charcoal-300 mb-6 leading-relaxed">
                Empowering home-based entrepreneurs and connecting communities through trusted local services.
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Quick Links</h4>
                <div className="space-y-2">
                  {['Terms of Service', 'Privacy Policy', 'Careers', 'Support'].map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="block text-charcoal-300 hover:text-coral-400 transition-colors"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Connect With Us</h4>
              <div className="flex space-x-4 mb-8">
                {[
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                  { icon: MessageCircle, href: '#', label: 'WhatsApp' },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="w-12 h-12 bg-charcoal-800 hover:bg-coral-500 text-charcoal-300 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.label}
                  >
                    <social.icon className="w-6 h-6" />
                  </motion.a>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Contact</h4>
                <div className="space-y-2 text-charcoal-300">
                  <p>hello@housewise.com</p>
                  <p>+91 98765 43210</p>
                  <p>Bangalore, Karnataka, India</p>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Stay Updated</h4>
              <p className="text-charcoal-300 mb-6">
                Subscribe to our newsletter for the latest updates and features.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-ivory placeholder-charcoal-400 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                  required
                />
                <motion.button
                  type="submit"
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white py-3 rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-charcoal-800 mt-12 pt-8 text-center">
            <p className="text-charcoal-400">
              © 2024 HouseWise. All rights reserved. Made with ❤️ for empowering women entrepreneurs.
            </p>
          </div>
        </div>
      </footer>
    );
  };

  // Floating CTA Component
  const FloatingCTA = () => (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleQuickBook}
        className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-semibold transition-colors duration-300"
      >
        <Zap className="w-5 h-5" />
        Quick Book
      </button>
    </div>
  );

  // Chat Widget Component
  const ChatWidget = () => (
    <div className="fixed bottom-6 left-6 z-50">
      {showChatWidget && (
        <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl border border-charcoal-200 dark:border-charcoal-600 w-80 h-96 mb-4">

            <div className="p-4 border-b border-charcoal-200 dark:border-charcoal-600 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-charcoal-900 dark:text-ivory">Support</div>
                  <div className="text-xs text-green-500 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Online
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowChatWidget(false)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 h-64 overflow-y-auto">
              <div className="space-y-3">
                <div className="bg-coral-100 dark:bg-coral-900/30 p-3 rounded-lg">
                  <p className="text-sm text-charcoal-700 dark:text-charcoal-300">
                    Hi! How can I help you today?
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-coral-500 text-white px-3 py-1 rounded-full text-xs">
                    Book a service
                  </button>
                  <button className="bg-charcoal-200 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 px-3 py-1 rounded-full text-xs">
                    Pricing info
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-charcoal-200 dark:border-charcoal-600">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-charcoal-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-ivory text-sm"
                />
                <button className="bg-coral-500 text-white p-2 rounded-lg">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      <button
        onClick={() => setShowChatWidget(!showChatWidget)}
        className="bg-coral-500 hover:bg-coral-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors duration-300"
      >
        {showChatWidget ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory dark:bg-charcoal-900 transition-colors duration-300">
      <HeroSection />
      <StatisticsSection />
      <FeaturesSection />
      <ServicesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <AboutUsSection />
      <ContactSection />
      <Footer />

      {/* Floating Elements */}
      <FloatingCTA />
      <ChatWidget />
    </div>
  );
};

export default HomePage;
