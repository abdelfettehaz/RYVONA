<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required.']);
    exit;
}

$uploadDir = __DIR__ . '/../uploaded_templates/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // If requesting a specific template
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare('
                SELECT t.*,
                       AVG(r.rating) as average_rating,
                       COUNT(r.id) as rating_count
                FROM Gallery_template t
                LEFT JOIN gallery_ratings r ON t.id = r.gallery_template_id
                WHERE t.id = ?
                GROUP BY t.id
            ');
            $stmt->execute([$_GET['id']]);
            $template = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$template) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Template not found']);
                exit;
            }
            
            // Get user's rating if available
            $userRating = null;
            if (isset($_SESSION['user_id'])) {
                $stmt = $pdo->prepare('
                    SELECT rating 
                    FROM gallery_ratings 
                    WHERE user_id = ? AND gallery_template_id = ?
                ');
                $stmt->execute([$_SESSION['user_id'], $_GET['id']]);
                $userRating = $stmt->fetchColumn();
            }
            
            echo json_encode([
                'success' => true, 
                'data' => $template,
                'user_rating' => $userRating
            ]);
        } else {
            // Get all templates with average ratings
            $stmt = $pdo->query('
                SELECT t.*,
                       AVG(r.rating) as average_rating,
                       COUNT(r.id) as rating_count
                FROM Gallery_template t
                LEFT JOIN gallery_ratings r ON t.id = r.gallery_template_id
                GROUP BY t.id
                ORDER BY t.created_at DESC
            ');
            $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get user's ratings if available
            $userRatings = [];
            if (isset($_SESSION['user_id'])) {
                $stmt = $pdo->prepare('
                    SELECT gallery_template_id, rating 
                    FROM gallery_ratings 
                    WHERE user_id = ?
                ');
                $stmt->execute([$_SESSION['user_id']]);
                $userRatings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            }
            
            echo json_encode([
                'success' => true, 
                'data' => $templates,
                'user_ratings' => $userRatings
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
    }
    exit;
}

// Handle rating submission
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['template_id'], $input['rating'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Template ID and rating are required']);
        exit;
    }
    
    // Only regular users can rate
    if ($_SESSION['user_role'] !== 'user') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Only regular users can rate templates']);
        exit;
    }
    
    try {
        $rating = (int)$input['rating'];
        if ($rating < 1 || $rating > 5) {
            throw new Exception('Rating must be between 1 and 5');
        }
        
        // Upsert rating
        $stmt = $pdo->prepare('
            INSERT INTO gallery_ratings (user_id, gallery_template_id, rating) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE rating = VALUES(rating)
        ');
        $stmt->execute([$_SESSION['user_id'], $input['template_id'], $rating]);
        
        echo json_encode(['success' => true, 'message' => 'Rating submitted']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}
                                                                        

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if user is admin for POST operations (upload/update)
    if ($_SESSION['user_role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
        exit;
    }
    
    // Handle status update (JSON body)
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['id'], $input['status'])) {
            try {
                $stmt = $pdo->prepare('UPDATE Gallery_template SET status = ? WHERE id = ?');
                $stmt->execute([$input['status'], $input['id']]);
                echo json_encode(['success' => true, 'message' => 'Status updated']);
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
    }
    
    // Handle template update (multipart/form-data with ID)
    if (isset($_POST['id'])) {
        try {
            $template_id = $_POST['id'];
            $name = $_POST['name'] ?? '';
            $description = $_POST['description'] ?? '';
            $status = $_POST['status'] ?? 'in_stock';
            $category_id = $_POST['category_id'] ?? null;
            $design_border_color = $_POST['design_border_color'] ?? '#FF5722';
            $design_border_width = $_POST['design_border_width'] ?? 5;
            $design_border_style = $_POST['design_border_style'] ?? 'solid';
            $price = $_POST['price'] ?? null;
            $tags = $_POST['tags'] ?? null;
            $is_featured = $_POST['is_featured'] ?? 0;
            $size = $_POST['size'] ?? 'M'; // Get size from form data
            
            // Handle optional image update
            $imageUrl = null;
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $image = $_FILES['image'];
                $ext = pathinfo($image['name'], PATHINFO_EXTENSION);
                $filename = uniqid('tpl_') . '.' . $ext;
                $targetPath = $uploadDir . $filename;
                if (move_uploaded_file($image['tmp_name'], $targetPath)) {
                    $imageUrl = '/uploaded_templates/' . $filename;
                }
            }
            
            // Build update query
            $updateFields = [
                'name = ?',
                'description = ?',
                'status = ?',
                'category_id = ?',
                'design_border_color = ?',
                'design_border_width = ?',
                'design_border_style = ?',
                'price = ?',
                'size = ?', // Add size field
                'tags = ?',
                'is_featured = ?'
                
            ];
            $params = [
                $name,
                $description,
                $status,
                $category_id,
                $design_border_color,
                $design_border_width,
                $design_border_style,
                $price,
                $size, // Add size parameter
                $tags,
                $is_featured
                
            ];
            
            // Add image update if new image was uploaded
            if ($imageUrl) {
                $updateFields[] = 'image_url = ?';
                $params[] = $imageUrl;
            }
            
            $updateFields[] = 'updated_at = NOW()';
            $params[] = $template_id;
            
            $sql = 'UPDATE Gallery_template SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Template updated successfully']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }
    
    // Handle image upload (multipart/form-data) - for new templates
    try {
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Image upload failed: ' . ($_FILES['image']['error'] ?? 'no file'));
        }
        $image = $_FILES['image'];
        $ext = pathinfo($image['name'], PATHINFO_EXTENSION);
        $filename = uniqid('tpl_') . '.' . $ext;
        $targetPath = $uploadDir . $filename;
        if (!move_uploaded_file($image['tmp_name'], $targetPath)) {
            throw new Exception('Failed to save image');
        }
        $imageUrl = '/uploaded_templates/' . $filename;
        $name = $_POST['name'] ?? '';
        $description = $_POST['description'] ?? '';
        $status = $_POST['status'] ?? 'in_stock';
        $user_id = $_SESSION['user_id'];
        $category_id = $_POST['category_id'] ?? null;
        $thumbnail_url = null;
        $design_border_color = $_POST['design_border_color'] ?? '#FF5722';
        $design_border_width = $_POST['design_border_width'] ?? 5;
        $design_border_style = $_POST['design_border_style'] ?? 'solid';
        $price = $_POST['price'] ?? null;
        $tags = $_POST['tags'] ?? null;
        $is_featured = $_POST['is_featured'] ?? 0;
        $size = $_POST['size'] ?? 'M'; // Get size from form data
        $views = 0;
        $downloads = 0;
        
        $stmt = $pdo->prepare('INSERT INTO Gallery_template (user_id, name, description, category_id, image_url, thumbnail_url, status, design_border_color, design_border_width, design_border_style, price, size, tags, is_featured, views, downloads) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $user_id,
            $name,
            $description,
            $category_id,
            $imageUrl,
            $thumbnail_url,
            $status,
            $design_border_color,
            $design_border_width,
            $design_border_style,
            $price,
            $size,
            $tags,
            $is_featured,
            $views,
            $downloads,
        ]);
        echo json_encode(['success' => true, 'message' => 'Template uploaded to gallery']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Check if user is admin for DELETE operations
    if ($_SESSION['user_role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
        exit;
    }
    
    // Handle template deletion (JSON body)
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['id'])) {
        try {
            // Get template info to delete the image file
            $stmt = $pdo->prepare('SELECT image_url FROM Gallery_template WHERE id = ?');
            $stmt->execute([$input['id']]);
            $template = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($template) {
                // Delete the image file
                $imagePath = __DIR__ . '/..' . $template['image_url'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
                
                // Delete from database
                $stmt = $pdo->prepare('DELETE FROM Gallery_template WHERE id = ?');
                $stmt->execute([$input['id']]);
                
                echo json_encode(['success' => true, 'message' => 'Template deleted successfully from gallery']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Template not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error deleting template: ' . $e->getMessage()]);
        }
        exit;
    }
    
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Template ID required']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);