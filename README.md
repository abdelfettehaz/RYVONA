# T-Shirt Designer - React Application

A modern, full-featured T-Shirt design platform built with React, TypeScript, and Tailwind CSS, integrated with a PHP backend.

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

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tshirt-designer.git
   cd tshirt-designer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the backend**
   - Ensure you have XAMPP or similar local server
   - Place the project in your `htdocs` folder
   - Import the database schema (if provided)
   - Configure database connection in `config.php`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
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
└── config.php              # Database configuration
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
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost/your-project-folder/api
```

### Database Configuration
Update `config.php` with your database credentials:
```php
<?php
$host = 'localhost';
$dbname = 'tshirt_designer';
$username = 'your_username';
$password = 'your_password';
?>
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Hosting
1. Build the project: `npm run build`
2. Upload the `dist` folder to your web server
3. Upload the `api` folder to your server
4. Configure your server to handle the API routes

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

**Made with ❤️ for the T-Shirt design community** 