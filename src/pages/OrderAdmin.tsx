import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: number;
  user_id: number;
  order_id: number;
  client_name: string;
  client_email: string;
  front_design?: string;
  back_design?: string;
  left_design?: string;
  right_design?: string;
  base_price: number | string;
  design_price: number | string;
  total_price: number | string;
  quantity: number;
  size: string;
  status: string;
  created_at: string;
  product_type?: string;
  color?: string;
  notes?: string;
  phone?: string;
  country?:string;
  city?:string;
  address?:string;
  postal?:string;
  cin?:number;
}

const OrderAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showPrintPanel, setShowPrintPanel] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printPreviewContent, setPrintPreviewContent] = useState<Order[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const navigate = useNavigate();

  const parsePrice = (price: number | string): number => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const parsed = parseFloat(price);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrders.length > 0) {
      setShowPrintPanel(true);
    } else {
      setShowPrintPanel(false);
    }
  }, [selectedOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/admin/orders.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.orders || !Array.isArray(data.orders)) {
        throw new Error('Invalid orders data format');
      }
      
      const processedOrders = data.orders.map((order: Order) => ({
        ...order,
        base_price: parsePrice(order.base_price),
        design_price: parsePrice(order.design_price),
        total_price: parsePrice(order.total_price),
        size: order.size || 'Not specified' // Ensure size has a default value
      }));
      
      console.log('Processed orders:', processedOrders); // Debug log
      setOrders(processedOrders);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/admin/update_order.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ order_id: orderId, status })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update order');
      }
      
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (err) {
      console.error('Update error:', err);
      alert(err instanceof Error ? err.message : 'Failed to update order');
    }
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const generatePrintPreview = () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order');
      return;
    }
    
    const selectedOrderDetails = orders.filter(order => selectedOrders.includes(order.id));
    if (selectedOrderDetails.length === 0) {
      alert('No orders found for selected items');
      return;
    }
    
    setPrintPreviewContent(selectedOrderDetails);
    setShowPrintPreview(true);
  };

  const downloadAsPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      if (printPreviewContent.length === 0) {
        alert('No orders selected for PDF');
        return;
      }

      const ordersByUser: Record<number, Order[]> = {};
      printPreviewContent.forEach(order => {
        if (!ordersByUser[order.user_id]) {
          ordersByUser[order.user_id] = [];
        }
        ordersByUser[order.user_id].push(order);
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const design = {
        colors: {
          primary: [0, 102, 178],
          secondary: [255, 204, 0],
          success: [0, 153, 0],
          danger: [204, 0, 0],
          lightGray: [245, 245, 245],
          darkGray: [51, 51, 51]
        },
        fonts: {
          header: { size: 18, style: 'bold' },
          subheader: { size: 14, style: 'bold' },
          body: { size: 10, style: 'normal' },
          small: { size: 8, style: 'normal' }
        },
        spacing: {
          margin: 15,
          lineHeight: 6,
          paragraph: 8
        }
      };

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const addHeader = (pdf: jsPDF, _yPos: number) => {
        pdf.setFillColor(design.colors.primary[0], design.colors.primary[1], design.colors.primary[2]);
        pdf.rect(0, 0, pageWidth, 20, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(design.fonts.header.size);
        pdf.setFont('helvetica', design.fonts.header.style);
        pdf.text('Ryvona', design.spacing.margin, 15);
        pdf.setFontSize(design.fonts.small.size);
        pdf.text('Custom Apparel Orders', pageWidth - design.spacing.margin, 15, { align: 'right' });
      };

      const addThankYouMessage = (pdf: jsPDF, yPos: number) => {
        pdf.setFontSize(design.fonts.subheader.size);
        pdf.setTextColor(design.colors.primary[0], design.colors.primary[1], design.colors.primary[2]);
        pdf.text('Thank You for Choosing Ryvona!', pageWidth/2, yPos + 15, { align: 'center' });
        pdf.setFontSize(design.fonts.body.size);
        pdf.setTextColor(design.colors.darkGray[0], design.colors.darkGray[1], design.colors.darkGray[2]);
        pdf.text(
          'We appreciate your business and look forward to serving you again soon.',
          pageWidth/2, yPos + 20, { align: 'center' }
        );
        pdf.setFontSize(design.fonts.small.size);
        pdf.text(
          'Contact us: hello@Ryvona.com | (+216) 21863580 | (+216) 57229597',
          pageWidth/2, yPos + 30, { align: 'center' }
        );
      };

      Object.entries(ordersByUser).forEach(([_userId, userOrders]) => {
        pdf.addPage();
        let yPos = design.spacing.margin;
        
        addHeader(pdf, yPos);
        yPos = 25;

        const user = userOrders[0];
        const userTotal = userOrders.reduce((sum, order) => sum + parsePrice(order.total_price), 0);

        pdf.setFillColor(design.colors.secondary[0], design.colors.secondary[1], design.colors.secondary[2]);
        pdf.rect(design.spacing.margin, yPos, pageWidth - design.spacing.margin * 2, design.spacing.lineHeight, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(design.fonts.subheader.size);
        pdf.text(`CUSTOMER: ${user.client_name.toUpperCase()}`, design.spacing.margin + 5, yPos + 4);
        yPos += design.spacing.lineHeight + 2;

        pdf.setFontSize(design.fonts.body.size);
        pdf.setTextColor(design.colors.darkGray[0], design.colors.darkGray[1], design.colors.darkGray[2]);
        
        const userDetails = [
          `Email: ${user.client_email || 'Not provided'}`,
          `phone: ${user.phone || 'Not provided'}`,
          `Order Date: ${new Date(user.created_at).toLocaleDateString()}`,
          `Total Orders: ${userOrders.length}`,
          `Country: ${user.country || 'Not provided'}`,
          `City: ${user.city || 'Not provided'}`,
          `Address: ${user.address || 'Not provided'}`,
          `CIN: ${user.cin || 'Not provided'}`,
        ];
        
        userDetails.forEach(detail => {
          pdf.text(detail, design.spacing.margin, yPos);
          yPos += design.spacing.lineHeight;
        });
        
        yPos += design.spacing.paragraph;

        pdf.setFillColor(design.colors.lightGray[0], design.colors.lightGray[1], design.colors.lightGray[2]);
        pdf.rect(design.spacing.margin, yPos, pageWidth - design.spacing.margin * 2, design.spacing.lineHeight, 'F');
        pdf.setFont('helvetica', 'bold');
        
        const columns = [
          { title: 'Order #', x: design.spacing.margin + 2, width: 15 },
          { title: 'Product', x: design.spacing.margin + 25, width: 40 },
          { title: 'Color', x: design.spacing.margin + 70, width: 20 },
          { title: 'Size', x: design.spacing.margin + 95, width: 15 },
          { title: 'Qty', x: design.spacing.margin + 115, width: 10 },
          { title: 'Price', x: design.spacing.margin + 130, width: 20 },
          { title: 'Total', x: design.spacing.margin + 155, width: 20 }
        ];

        columns.forEach(col => pdf.text(col.title, col.x, yPos + 4));
        yPos += design.spacing.lineHeight;

        pdf.setFont('helvetica', 'normal');
        userOrders.forEach(order => {
          if (yPos > pageHeight - 50) {
            pdf.addPage();
            yPos = design.spacing.margin;
            pdf.setFillColor(design.colors.lightGray[0], design.colors.lightGray[1], design.colors.lightGray[2]);
            pdf.rect(design.spacing.margin, yPos, pageWidth - design.spacing.margin * 2, design.spacing.lineHeight, 'F');
            pdf.setFont('helvetica', 'bold');
            columns.forEach(col => pdf.text(col.title, col.x, yPos + 4));
            yPos += design.spacing.lineHeight;
            pdf.setFont('helvetica', 'normal');
          }

          const totalPrice = parsePrice(order.total_price);
          const unitPrice = order.quantity > 0 ? totalPrice / order.quantity : totalPrice;

          pdf.text(`#${order.order_id}`, columns[0].x, yPos + 4);
          pdf.text(order.product_type || 'Custom Apparel', columns[1].x, yPos + 4);
          pdf.text(order.color || '-', columns[2].x, yPos + 4);
          pdf.text(order.size || '-', columns[3].x, yPos + 4);
          pdf.text(order.quantity.toString(), columns[4].x, yPos + 4);
          pdf.text(`€${unitPrice.toFixed(2)}`, columns[5].x, yPos + 4);
          pdf.text(`€${totalPrice.toFixed(2)}`, columns[6].x, yPos + 4);
          
          yPos += design.spacing.lineHeight;

          if (order.notes) {
            pdf.setFontSize(design.fonts.small.size);
            const notes = pdf.splitTextToSize(`Notes: ${order.notes}`, pageWidth - design.spacing.margin * 2 - 10);
            notes.forEach((line: string) => {
              pdf.text(line, design.spacing.margin + 5, yPos + 4);
              yPos += design.spacing.lineHeight * 0.8;
            });
            pdf.setFontSize(design.fonts.body.size);
          }

          pdf.setDrawColor(200, 200, 200);
          pdf.line(design.spacing.margin, yPos + 2, pageWidth - design.spacing.margin, yPos + 2);
          yPos += 4;
        });

        pdf.setFillColor(230, 230, 230);
        pdf.rect(design.spacing.margin, yPos, pageWidth - design.spacing.margin * 2, design.spacing.lineHeight, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.text('ORDER TOTAL:', columns[5].x, yPos + 4);
        pdf.text(`€${userTotal.toFixed(2)}`, columns[6].x, yPos + 4);
        yPos += design.spacing.lineHeight * 2;

        addThankYouMessage(pdf, yPos);
      });

      pdf.deletePage(1);
      pdf.save(`Ryvona_Orders_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    try {
      if (printPreviewContent.length === 0) {
        alert('No orders selected for printing');
        return;
      }

      const ordersByUser: Record<number, Order[]> = {};
      printPreviewContent.forEach(order => {
        if (!ordersByUser[order.user_id]) {
          ordersByUser[order.user_id] = [];
        }
        ordersByUser[order.user_id].push(order);
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for this site');
        return;
      }

      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ryvona Orders</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
              background-color: #fff;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              padding: 15mm;
              margin: 0 auto;
              box-sizing: border-box;
            }
            .header {
              border-bottom: 2px solid #0066b2;
              padding-bottom: 10px;
              margin-bottom: 15px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .logo { font-size: 24px; font-weight: bold; color: #0066b2; }
            .subtitle { font-size: 14px; color: #666; }
            .customer-section { margin-bottom: 25px; page-break-inside: avoid; }
            .customer-header {
              background: #ffcc00;
              color: #000;
              padding: 10px 15px;
              font-weight: bold;
              font-size: 16px;
              border-radius: 4px 4px 0 0;
            }
            .customer-details {
              background: #f5f5f5;
              padding: 10px 15px;
              font-size: 14px;
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
            }
            .order-table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 13px;
            }
            .order-table th {
              background: #e6f2ff;
              text-align: left;
              padding: 10px;
              font-weight: bold;
              color: #0066b2;
            }
            .order-table td {
              padding: 10px;
              border-bottom: 1px solid #eee;
            }
            .order-table tr:nth-child(even) { background-color: #fafafa; }
            .notes-cell {
              padding: 8px 10px;
              background-color: #f5f5f5;
              font-size: 12px;
              color: #555;
            }
            .customer-total {
              text-align: right;
              font-weight: bold;
              padding: 10px;
              background: #e6f2ff;
              color: #0066b2;
            }
            .thank-you {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            .thank-you h2 { color: #0066b2; margin-top: 0; }
            .thank-you p { margin-bottom: 5px; }
            .contact-info { font-size: 12px; color: #666; }
            @media print {
              body { background: white; }
              .page { width: auto; min-height: auto; padding: 0; margin: 0; }
              .customer-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${Object.entries(ordersByUser).map(([_userId, userOrders]) => {
              const user = userOrders[0];
              const userTotal = userOrders.reduce((sum, order) => sum + parsePrice(order.total_price), 0);
              
              return `
                <div class="customer-section">
                  <div class="header">
                    <div>
                      <div class="logo">Ryvona</div>
                      <div class="subtitle">Custom Apparel Orders</div>
                    </div>
                    <div>${new Date().toLocaleDateString()}</div>
                  </div>
                  
                  <div class="customer-header">
                    ${user.client_name}
                  </div>
                  <div class="customer-details">
                    <div><strong>Email:</strong> ${user.client_email}</div>
                    <div><strong>phone:</strong> ${user.phone || 'Not provided'}</div>
                    <div><strong>Order Date:</strong> ${new Date(user.created_at).toLocaleDateString()}</div>
                  </div>
                  <div class="customer-details">
                    <div><strong>Country:</strong> ${user.country || 'Not provided'}</div>
                    <div><strong>City:</strong> ${user.city || 'Not provided'}</div>
                    <div><strong>Address:</strong> ${user.address || 'Not provided'}</div>
                    <div><strong>Postal:</strong> ${user.postal || 'Not provided'}</div>
                    <div><strong>CIN:</strong> ${user.cin || 'Not provided'}</div>
                  </div>
                  <table class="order-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Product</th>
                        <th>Color</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${userOrders.map(order => {
                        const totalPrice = parsePrice(order.total_price);
                        const unitPrice = order.quantity > 0 ? totalPrice / order.quantity : totalPrice;
                        
                        return `
                          <tr>
                            <td>#${order.order_id}</td>
                            <td>${order.product_type || 'Custom Apparel'}</td>
                            <td>${order.color && order.color !== 'undefined' ? order.color : '-'}</td>
                            <td>${order.size || '-'}</td>
                            <td>${order.quantity}</td>
                            <td>€${unitPrice.toFixed(2)}</td>
                            <td>€${totalPrice.toFixed(2)}</td>
                          </tr>
                          ${order.notes ? `
                            <tr>
                              <td colspan="7" class="notes-cell">
                                <strong>Notes:</strong> ${order.notes}
                              </td>
                            </tr>
                          ` : ''}
                        `;
                      }).join('')}
                      <tr>
                        <td colspan="5"></td>
                        <td class="customer-total">Total:</td>
                        <td class="customer-total">€${userTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div class="thank-you">
                    <h2>Thank You for Choosing Ryvona!</h2>
                    <p>We appreciate you for choosing us and look forward to serving you again soon.</p>
                    <p class="contact-info">
                      Contact us: hello@Ryvona.com | (+216) 21863580 | (+216) 57229597
                    </p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 300);
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(content);
      printWindow.document.close();
    } catch (err) {
      console.error('Print error:', err);
      alert('Failed to generate print preview');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-medium mb-2">Error</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Print Preview ({printPreviewContent.length} orders)</h2>
              <button 
                onClick={() => setShowPrintPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              {printPreviewContent.map((order, index) => {
                const totalPrice = parsePrice(order.total_price);
                const unitPrice = order.quantity > 0 ? totalPrice / order.quantity : totalPrice;
                
                return (
                  <div key={order.id} className="mb-8">
                    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
                        <h1 className="text-2xl font-bold">Delivery Order</h1>
                        <div className="order-number bg-white bg-opacity-20 inline-block px-3 py-1 rounded-full mt-2">
                          Order #{order.order_id}
                        </div>
                      </div>
                      
                      <div className="order-info flex flex-wrap p-6 border-b">
                        <div className="info-block w-full md:w-1/2 p-2">
                          <h3 className="text-blue-600 font-medium mb-2">Customer Information</h3>
                          <p><strong>Name:</strong> {order.client_name}</p>
                          <p><strong>Email:</strong> {order.client_email}</p>
                        </div>
                        
                        <div className="info-block w-full md:w-1/2 p-2">
                          <h3 className="text-blue-600 font-medium mb-2">Order Details</h3>
                          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                          <p><strong>Status:</strong> {order.status}</p>
                          <p><strong>Product:</strong> {order.product_type || 'T-shirt'} {order.color && `(${order.color})`}</p>
                          <p><strong>Size:</strong> {order.size || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div className="order-items p-6">
                        <h2 className="text-blue-600 text-xl font-medium mb-4">Order Items</h2>
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">Item</th>
                              <th className="px-4 py-2 text-left">Description</th>
                              <th className="px-4 py-2 text-left">Size</th>
                              <th className="px-4 py-2 text-left">Qty</th>
                              <th className="px-4 py-2 text-left">Unit Price</th>
                              <th className="px-4 py-2 text-left">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-2 border-b">{order.product_type || 'Custom T-shirt'}</td>
                              <td className="px-4 py-2 border-b">Custom design</td>
                              <td className="px-4 py-2 border-b">{order.size || 'Not specified'}</td>
                              <td className="px-4 py-2 border-b">{order.quantity}</td>
                              <td className="px-4 py-2 border-b">€{unitPrice.toFixed(2)}</td>
                              <td className="px-4 py-2 border-b">€{totalPrice.toFixed(2)}</td>
                            </tr>
                            <tr className="bg-gray-50 font-bold">
                              <td colSpan={5} className="px-4 py-2">Total</td>
                              <td className="px-4 py-2">€{totalPrice.toFixed(2)}</td>
                            </tr>
                          </tbody>
                        </table>
                        {order.notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded">
                            <p className="font-medium text-gray-700">Notes:</p>
                            <p className="text-gray-600">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < printPreviewContent.length - 1 && (
                      <div className="page-break h-8"></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-3">
              <button
                onClick={downloadAsPDF}
                disabled={isGeneratingPDF}
                className={`px-4 py-2 text-white rounded hover:bg-green-700 ${
                  isGeneratingPDF ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600'
                }`}
              >
                {isGeneratingPDF ? 'Generating...' : 'Download as PDF'}
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Print
              </button>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrintPanel && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-40">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-gray-700">
              {selectedOrders.length} order(s) selected
            </div>
            <div className="flex space-x-4">
              <button
                onClick={generatePrintPreview}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Print Preview
              </button>
              <button
                onClick={() => {
                  setSelectedOrders([]);
                  setShowPrintPanel(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 mb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Order Management</h1>
          {selectedOrders.length > 0 && (
            <div className="text-sm text-gray-600">
              {selectedOrders.length} order(s) selected
            </div>
          )}
        </div>
        
        {showDesignModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowDesignModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">T-shirt Design Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {selectedOrder.front_design && selectedOrder.front_design !== 'undefined' && (
                  <div>
                    <div className="font-medium mb-1">Front</div>
                    <img 
                      src={selectedOrder.front_design} 
                      alt="Front Design" 
                      className="w-full h-32 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/path/to/default-image.png';
                      }}
                    />
                  </div>
                )}

                {selectedOrder.back_design && (
                  <div>
                    <div className="font-medium mb-1">Back</div>
                    <img 
                      src={selectedOrder.back_design} 
                      alt="Back Design" 
                      className="w-full h-32 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/path/to/default-image.png';
                      }}
                    />
                  </div>
                )}
                {selectedOrder.left_design && (
                  <div>
                    <div className="font-medium mb-1">Left</div>
                    <img 
                      src={selectedOrder.left_design} 
                      alt="Left Design" 
                      className="w-full h-32 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/path/to/default-image.png';
                      }}
                    />
                  </div>
                )}
                {selectedOrder.right_design && (
                  <div>
                    <div className="font-medium mb-1">Right</div>
                    <img 
                      src={selectedOrder.right_design} 
                      alt="Right Design" 
                      className="w-full h-32 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/path/to/default-image.png';
                      }}
                    />
                  </div>
                )}
                {!selectedOrder.front_design && !selectedOrder.back_design && 
                 !selectedOrder.left_design && !selectedOrder.right_design && (
                  <div className="col-span-2 text-center text-gray-500">
                    No design images available.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={() => {
                        if (selectedOrders.length === orders.length) {
                          setSelectedOrders([]);
                        } else {
                          setSelectedOrders(orders.map(order => order.id));
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => {
                  const totalPrice = parsePrice(order.total_price);
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{order.order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{order.client_name}</div>
                          <div className="text-gray-500 text-xs">{order.client_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.product_type || 'Custom T-shirt'} 
                        {order.color && order.color !== 'undefined' ? (
                          <span className="inline-block w-3 h-3 rounded-full ml-1" 
                                style={{ backgroundColor: order.color }} />
                        ) : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.size || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.quantity || 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          order.status === 'under review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'rejected')}
                          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => { setSelectedOrder(order); setShowDesignModal(true); }}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                        >
                          Design
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


export default OrderAdmin;