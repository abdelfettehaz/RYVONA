import { 
  User, 
  Order, 
  Payment, 
  Design, 
  Template, 
  ContactForm, 
  PaymentInfo,
  ApiResponse,
  OrdersApiResponse,
  PricingPlan,
  Notification,
  Category
} from '../types';

// Resolve API base URL for PHP backend. On GitHub Pages, this must point to a separate PHP host.
// Vite env var: VITE_API_BASE_URL (e.g., https://your-php-host.example.com/api)
const ENV_API_BASE = import.meta.env?.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = (ENV_API_BASE && ENV_API_BASE.trim() !== '')
  ? ENV_API_BASE.replace(/\/$/, '') // remove trailing slash
  : '/api';

// Helper to build absolute URLs to PHP endpoints (also used by modules that call fetch directly)
export function getApiUrl(endpoint: string): string {
  const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalized}`;
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');
    
    // Don't set Content-Type for FormData, let browser handle it
    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    };
    
    // Only set Content-Type if not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const config: RequestInit = {
      headers,
      credentials: 'include', // Always send cookies for PHP session
      ...options,
    };

    console.log(`API Request to ${endpoint}:`, {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(getApiUrl(endpoint), config);
      
      console.log(`API Response status: ${response.status} ${response.statusText}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`API Response from ${endpoint}:`, data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to server. Please check if the server is running.');
      }
      throw error;
    }
  }
  async getUserInfo(): Promise<ApiResponse<{ user: User }> & { user?: User }> {
    const result = await this.request<{ user: User }>('/user-info.php', {
      method: 'GET',
    });
    // Transform the response to include user at the top level
    if (result.success && result.data?.user) {
      return {
        ...result,
        user: result.data.user
      };
    }
    return result as ApiResponse<{ user: User }> & { user?: User };
  }
  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(userData: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/signup.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/logout.php', { method: 'POST' });
  }

  async checkAuth(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/check-auth-session.php');
  }

  // User Management
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/profile.php');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/update-profile.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Design Management
  async saveDesign(designData: {
    image: string;
    product: string;
    color: string;
    view: string;
  }): Promise<ApiResponse<Design>> {
    return this.request('/save-design.php', {
      method: 'POST',
      body: JSON.stringify(designData),
    });
  }

  async getDesigns(): Promise<ApiResponse<Design[]>> {
    return this.request('/get-designs.php');
  }

  async deleteDesign(designId: number): Promise<ApiResponse> {
    return this.request('/simple-delete-design.php', {
      method: 'POST',
      body: JSON.stringify({ design_id: designId }),
    });
  }

  // Order Management
  async createOrder(orderData: {
    design_data: string;
    source_designs?: string;
    product_type: string;
    color: string;
    view_angle: string;
    quantity: number;
    base_price: number;
    design_price: number;
    total_price: number;
  }): Promise<ApiResponse<Order>> {
    return this.request('/create-order.php', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<OrdersApiResponse> {
    return this.request('/orders.php');
  }

  async updateOrder(orderId: number, status: string): Promise<ApiResponse<Order>> {
    return this.request('/update-order.php', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, status }),
    });
  }

  async deleteOrder(orderId: number): Promise<ApiResponse> {
    return this.request('/simple-delete-order.php', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  }

  async getSimpleOrders(): Promise<ApiResponse<Order[]> & { orders?: Order[] }> {
    return this.request('/simple-get-orders.php');
  }

  // Payment Management
  async processPayment(paymentData: PaymentInfo): Promise<ApiResponse<Payment>> {
    return this.request('/process-payment.php', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPayments(): Promise<ApiResponse<Payment[]>> {
    return this.request('/payments.php');
  }

  async updatePaymentStatus(paymentId: number, status: string): Promise<ApiResponse<Payment>> {
    return this.request('/update-payment-status.php', {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId, status }),
    });
  }

  // Templates (tshirt_templates table)
  async getInStockTemplates(): Promise<ApiResponse<Template[]>> {
    return this.request('/tshirt_templates.php?status=in_stock');
  }

  async getTemplates(): Promise<ApiResponse<Template[]>> {
    return this.request('/tshirt_templates.php');
  }

  async getTemplate(templateId: number): Promise<ApiResponse<Template>> {
    return this.request(`/tshirt_templates.php?id=${templateId}`);
  }

  async uploadTemplate(formData: FormData): Promise<ApiResponse<Template>> {
    return this.request('/tshirt_templates.php', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async updateTemplateStatus(templateId: number, data: { status: string }): Promise<ApiResponse> {
    return this.request('/tshirt_templates.php', {
      method: 'POST',
      body: JSON.stringify({ id: templateId, ...data }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async deleteTemplate(templateId: number): Promise<ApiResponse> {
    return this.request('/tshirt_templates.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: templateId }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Gallery Templates (Gallery_template table)
  async getGalleryTemplates(): Promise<ApiResponse> {
    return this.request('/gallery_templates.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  }
  async getGalleryTemplate(templateId: number): Promise<ApiResponse<Template>> {
    return this.request(`/gallery_templates.php?id=${templateId}`);
  }

  async uploadGalleryTemplate(formData: FormData): Promise<ApiResponse<Template>> {
    return this.request('/gallery_templates.php', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async updateGalleryTemplateStatus(templateId: number, data: { status: string }): Promise<ApiResponse> {
    return this.request('/gallery_templates.php', {
      method: 'POST',
      body: JSON.stringify({ id: templateId, ...data }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Add this new method for updating template ratings
  async updateGalleryTemplateRating(
    templateId: number, 
    data: { rating: number }
  ): Promise<ApiResponse> {
    return this.request('/gallery_templates.php', {
      method: 'PUT',
      body: JSON.stringify({ 
        template_id: templateId, 
        rating: data.rating 
      }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async deleteGalleryTemplate(templateId: number): Promise<ApiResponse> {
    return this.request('/gallery_templates.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: templateId }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request('/categories.php');
  }

  // Contact
  async sendContactMessage(contactData: ContactForm): Promise<ApiResponse> {
    return this.request('/contact.php', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Gallery
  async getGallery(): Promise<ApiResponse<Design[]>> {
    return this.request('/gallery.php');
  }

  // Pricing
  async getPricingPlans(): Promise<ApiResponse<PricingPlan[]>> {
    return this.request('/pricing.php');
  }

  // Admin
  async getAdminStats(): Promise<ApiResponse<{
    total_users: number;
    total_orders: number;
    total_revenue: number;
    recent_orders: Order[];
    recent_payments: Payment[];
  }>> {
    return this.request('/admin/stats.php');
  }

  async getAdminUsers(): Promise<ApiResponse<User[]>> {
    return this.request('/admin/users.php');
  }

  async getAdminOrders(): Promise<ApiResponse<Order[]>> {
    return this.request('/admin/orders.php');
  }

  async getAdminPayments(): Promise<ApiResponse<Payment[]>> {
    return this.request('/admin/payments.php');
  }
  
  // Notifications
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request('/notifications.php');
  }

  async markNotificationRead(notificationId: number): Promise<ApiResponse> {
    return this.request('/mark-notification-read.php', {
      method: 'POST',
      body: JSON.stringify({ notification_id: notificationId }),
    });
  }

  // Chat
  async sendChatMessage(message: string): Promise<ApiResponse<{ response: string }>> {
    return this.request('/chatbot.php', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // File Upload
  async uploadFile(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload.php', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // AI Order Confirmation
  async confirmOrderWithAI(orderId: string, conversation: any[]): Promise<ApiResponse<{ confirmed: boolean }>> {
    return this.request('/confirm-order-ai.php', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, conversation }),
    });
  }

  // Combined Orders
  async createCombinedOrder(designIds: number[]): Promise<ApiResponse<{ order_id: number, images: string[], total_price: number }>> {
    return this.request('/combine-designs.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designIds }),
    });
  }

  async createCombinedDesign(designIds: Record<string, number>): Promise<ApiResponse<{ design: Design }>> {
    return this.request('/combine-designs.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designIds }),
    });
  }

  async deleteCombinedDesigns(ids: number[]): Promise<ApiResponse<{ deleted_ids: number[] }>> {
    return this.request('/delete-combined-design.php', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;

export async function getOrCreateConversation() {
  const res = await fetch('/api/chat/get_or_create_conversation.php', { credentials: 'include' });
  return res.json();
}

export async function listMessages(conversation_id: number) {
  const res = await fetch(`/api/chat/list_messages.php?conversation_id=${conversation_id}`, { credentials: 'include' });
  return res.json();
}

export async function sendMessage(conversation_id: number, content: string, image_url?: string) {
  const form = new FormData();
  form.append('conversation_id', String(conversation_id));
  form.append('content', content);
  if (image_url) {
    form.append('image_url', image_url);
  }
  const res = await fetch('/api/chat/send_message.php', {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  return res.json();
}

export async function markRead(conversation_id: number) {
  const form = new FormData();
  form.append('conversation_id', String(conversation_id));
  const res = await fetch('/api/chat/mark_read.php', {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  return res.json();
}

export async function listConversations() {
  const res = await fetch('/api/chat/list_conversations.php', { credentials: 'include' });
  return res.json();
}

export async function closeConversation(conversation_id: number) {
  const form = new FormData();
  form.append('conversation_id', String(conversation_id));
  const res = await fetch('/api/chat/close_conversation.php', {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  return res.json();
}

export async function getAdminStatus() {
  const res = await fetch('/api/chat/get_admin_status.php', { credentials: 'include' });
  return res.json();
}

export async function setAdminStatus(status: 'online' | 'offline') {
  const form = new FormData();
  form.append('status', status);
  const res = await fetch('/api/chat/set_admin_status.php', {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  return res.json();
}

export async function uploadChatImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch('/api/chat/upload_image.php', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to upload image');
  }
  
  return res.json();
}
