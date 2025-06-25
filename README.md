# HouseWife Services Platform

A comprehensive web application connecting skilled housewives with local customers for various home services. This platform empowers women entrepreneurs while providing trusted, affordable services to communities.

## 🌟 Features

### For Customers
- **Browse Services**: Discover various services like cooking, tailoring, tuition, beauty, cleaning, and childcare
- **Advanced Search**: Filter by location, category, price range, and ratings
- **Easy Booking**: Schedule services with flexible timing options
- **Secure Payments**: Multiple payment methods with transparent pricing
- **Reviews & Ratings**: Read and write reviews for service providers
- **Real-time Tracking**: Track booking status and communicate with providers

### For Service Providers (Housewives)
- **Profile Management**: Create detailed profiles showcasing skills and experience
- **Service Listings**: Add multiple services with descriptions, pricing, and availability
- **Booking Management**: Accept, manage, and track service requests
- **Earnings Dashboard**: Monitor income and completed services
- **Customer Communication**: Direct messaging with customers
- **Rating System**: Build reputation through customer reviews

### For Administrators
- **User Management**: Oversee all users and their activities
- **Service Approval**: Review and approve new service listings
- **Analytics Dashboard**: Monitor platform performance and usage
- **Content Moderation**: Manage reviews and reported content
- **Financial Oversight**: Track transactions and platform revenue

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **cors** for cross-origin requests
- **dotenv** for environment configuration

### Frontend
- **React.js** with modern hooks
- **Vite** for fast development and building
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Database Schema
- **Users**: Customer and provider profiles with authentication
- **Services**: Service listings with categories and pricing
- **Bookings**: Appointment management with status tracking
- **Reviews**: Rating and feedback system
- **Categories**: Service categorization with metadata

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd housewife-services-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI
   JWT_SECRET
   JWT_EXPIRE
   NODE_ENV
   ```

   Create `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Database Seeding**
   ```bash
   cd backend
   npm run seed
   ```

6. **Start the Application**
   
   Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

   Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 👥 Demo Accounts

After running the seeder, you can use these demo accounts:

- **Admin**: admin@housewife-services.com / admin123456
- **Service Provider**: priya.sharma@example.com / password123
- **Customer**: customer@example.com / password123

## 📁 Project Structure

```
housewife-services-app/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Utility functions
│   ├── public/          # Static assets
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/housewives` - Get all service providers

## 🎨 Design Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean and intuitive interface with Tailwind CSS
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Performance**: Optimized loading with lazy loading and code splitting
- **SEO Friendly**: Proper meta tags and structured data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation on both client and server
- **CORS Protection**: Configured for secure cross-origin requests
- **Rate Limiting**: Protection against API abuse
- **Data Sanitization**: XSS and injection attack prevention

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred database
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Set up SSL certificates for HTTPS

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3
3. Configure environment variables for production API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Icons by Lucide React
- UI inspiration from modern design systems
- Community feedback and contributions

## 📞 Support

For support, email support@housewife-services.com or create an issue in the repository.

---

**Made with ❤️ for empowering women entrepreneurs**
