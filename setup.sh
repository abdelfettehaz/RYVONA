#!/bin/bash

# T-Shirt Designer Setup Script
echo "🎨 Setting up T-Shirt Designer Full Stack Application..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p saved_designs
mkdir -p uploaded_templates
mkdir -p chat_images
mkdir -p database

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 saved_designs
chmod 755 uploaded_templates
chmod 755 chat_images
chmod 755 api
chmod 755 backend

# Create .htaccess for API directory if it doesn't exist
if [ ! -f "api/.htaccess" ]; then
    echo "📝 Creating API .htaccess..."
    cat > api/.htaccess << 'EOF'
# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
Header always set Access-Control-Allow-Credentials "true"

# Handle preflight requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# PHP settings
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value max_execution_time 300
php_value max_input_vars 3000
EOF
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "1. Install dependencies: npm install"
echo "2. Start with Docker: docker-compose up -d"
echo "3. Or start development server: npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8080/api"
echo "   Database: localhost:3306"
echo ""
echo "👤 Default admin credentials:"
echo "   Email: admin@ryvona.com"
echo "   Password: admin123"