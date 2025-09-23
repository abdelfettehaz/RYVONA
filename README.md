# T-Shirt Designer - React Application

A modern, full-featured T-Shirt design platform built with React, TypeScript, Tailwind CSS, and PHP backend with MySQL database.

## 🚀 Features

- **🎨 Design Studio**: Advanced canvas editor with text, images, and shapes
- **📋 Templates**: Extensive library of pre-designed templates
- **🖼️ Gallery**: Browse and showcase user designs
- **💰 Pricing**: Multiple pricing plans and packages
- **👤 User Management**: Registration, login, and profile management
- **📦 Order Management**: Track and manage orders
- **💳 Payment Processing**: Secure payment integration
- **⚙️ Admin Dashboard**: Complete admin panel for managing users and orders
- **💬 Live Chat**: Customer support chat widget
- **📱 Responsive Design**: Works perfectly on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Framer Motion** for animations
- **React Icons** and **Lucide React** for icons
- **Fabric.js** for canvas manipulation

### Backend
- **PHP** with MySQL database
- **PHPMailer** for email functionality
- **RESTful API** endpoints

## 📦 Installation

### Option 1: Docker (Recommended)

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd tshirt-designer
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api
   - Database: localhost:3306

### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tshirt-designer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Install MySQL/MariaDB
   - Create database: `CREATE DATABASE tshirt_designer;`
   - Import schema: `mysql -u root -p tshirt_designer < database/schema.sql`
   - Import sample data: `mysql -u root -p tshirt_designer < database/seed.sql`

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🏗️ Project Structure

```
tshirt-designer/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main App component
│   └── main.tsx            # Application entry point
├── api/                    # PHP backend files
├── public/                 # Static assets
├── images/                 # Image assets
├── saved_designs/          # User saved designs
├── uploaded_templates/     # Template uploads
├── chat_images/           # Chat image uploads
├── database/              # Database schema and seeds
├── config.php             # Database configuration
└── docker-compose.yml     # Docker configuration
```

## 🎯 Available Pages

- **Home** (`/`) - Landing page with hero section and features
- **Design Studio** (`/design-studio`) - Main design tool (requires login)
- **Templates** (`/templates`) - Browse design templates
- **Gallery** (`/gallery`) - View user designs and examples
- **Pricing** (`/pricing`) - Pricing plans and packages
- **Contact** (`/contact`) - Contact form and information
- **Login** (`/login`) - User authentication
- **Signup** (`/signup`) - User registration
- **Profile** (`/profile`) - User profile management
- **Orders** (`/orders`) - Order history and tracking
- **Admin** (`/admin`) - Admin dashboard (admin only)

## 🔧 Configuration

### Environment Variables
The `.env` file contains:
```env
# Database
DB_HOST=localhost
DB_NAME=tshirt_designer
DB_USER=root
DB_PASS=

# API
VITE_API_BASE_URL=http://localhost:8080/api

# AI Services
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_TOGETHER_API_KEY=your_together_key
```

### Database Configuration
The database is automatically configured through environment variables and Docker.

### Default Admin Account
- Email: admin@ryvona.com
- Password: admin123

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d --build
```

### Build for Production
```bash
npm run build
```

## 🛠️ Development

### Database Management
```bash
# Reset database
docker-compose exec mysql mysql -u root -p tshirt_designer < /docker-entrypoint-initdb.d/01-schema.sql

# Access database
docker-compose exec mysql mysql -u root -p tshirt_designer

# View logs
docker-compose logs mysql
docker-compose logs php-apache
```

### API Testing
The API endpoints are available at `http://localhost:8080/api/`:
- `/login.php` - User authentication
- `/signup.php` - User registration
- `/orders.php` - Order management
- `/save-design.php` - Design saving
- `/gallery_templates.php` - Template management

## 🔍 Troubleshooting

### Common Issues
1. **Database connection failed**
   - Check if MySQL container is running: `docker-compose ps`
   - Verify database credentials in `.env`

2. **API endpoints not working**
   - Check PHP container logs: `docker-compose logs php-apache`
   - Ensure proper file permissions

3. **Frontend not loading**
   - Check if all dependencies are installed: `npm install`
   - Verify Vite configuration

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Contact us through the website's contact form
- Use the live chat widget on the website

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Vite for the fast build tool
- All contributors and users of this project

---

**Made with ❤️ for the T-Shirt design community** # ryvona-shop
