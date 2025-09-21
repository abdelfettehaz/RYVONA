-- Sample data for testing
USE tshirt_designer;

-- Insert sample categories if they don't exist
INSERT IGNORE INTO categories (name, description) VALUES
('Vintage', 'Retro and vintage style designs'),
('Modern', 'Contemporary and minimalist designs'),
('Abstract', 'Abstract art and geometric patterns'),
('Typography', 'Text-based and typography designs'),
('Nature', 'Nature and outdoor themed designs');

-- Insert sample gallery templates (only if admin user exists)
INSERT IGNORE INTO Gallery_template (user_id, name, description, category_id, image_url, price, size, status) VALUES
(3, 'Vintage Retro Wave', 'Classic retro design with modern twist', 1, '/uploaded_templates/vintage-retro.png', 29.99, 'M', 'in_stock'),
(3, 'Minimalist Geometry', 'Clean and simple design for everyday wear', 2, '/uploaded_templates/minimalist-geo.png', 24.99, 'L', 'in_stock'),
(3, 'Urban Street Art', 'Bold and edgy streetwear design', 3, '/uploaded_templates/urban-street.png', 34.99, 'XL', 'in_stock'),
(3, 'Nature Landscape', 'Beautiful nature-inspired design', 5, '/uploaded_templates/nature-landscape.png', 27.99, 'M', 'in_stock');