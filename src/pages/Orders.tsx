import React, { useEffect, useState } from 'react';
import apiService from '../services/api';

declare const paypal: any;

interface Order {
  [key: string]: any;
}

interface UserInfo {
  role: string;
  country: string;
}

// Conversion rate (consider fetching this dynamically)
const EUR_TO_TND_RATE = 3.3;

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [_payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [payPalAmount, setPayPalAmount] = useState(0);
  const [payPalOrderIds, setPayPalOrderIds] = useState<number[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Price conversion helper
  const convertPrice = (amount: number) => {
    if (userInfo?.country?.toLowerCase() === 'tunisia') {
      return {
        currency: 'TND',
        amount: (amount * EUR_TO_TND_RATE).toFixed(2)
      };
    }
    return {
      currency: '€',
      amount: amount.toFixed(2)
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info first
        const userResult = await apiService.getUserInfo();
        if (userResult.success && userResult.user) {
          setUserInfo({
            role: userResult.user.role,
            country: userResult.user.country || ''
          });
        }

        // Then fetch orders
        const ordersResult = await apiService.getSimpleOrders();
        if (ordersResult.success && Array.isArray(ordersResult.orders)) {
          setOrders(ordersResult.orders);
        } else if (ordersResult.success && ordersResult.orders) {
          setOrders([ordersResult.orders]);
        } else {
          setOrders([]);
          setError('No orders found or invalid response from server.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data: ' + (err as Error).message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (showPayPal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AZYRUzqIo26XWsnKyIiGhoBv9HNoboFyyO2cxAIHZQZm41deFfzlFQ7t47GLA1GE679MYiZwii4rH3BW&currency=EUR`;
      script.addEventListener('load', () => {
        initializePayPalButtons();
      });
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showPayPal, payPalAmount]);

  const initializePayPalButtons = () => {
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: payPalAmount.toFixed(2),
                currency_code: 'EUR'
              }
            }]
          });
        },
        onApprove: async (_data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            console.log('Payment completed:', details);
            await submitOrdersToAdmin(payPalOrderIds);
            setShowPayPal(false);
            setPayingOrderId(null);
          } catch (error) {
            console.error('Payment error:', error);
            alert('Payment processing failed. Please try again.');
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          alert('Payment processing failed. Please try again.');
          setShowPayPal(false);
          setPayingOrderId(null);
        },
        onCancel: (_data: any) => {
          console.log('Payment cancelled');
          setShowPayPal(false);
          setPayingOrderId(null);
        }
      }).render('#paypal-button-container');
    }
  };

  const submitOrdersToAdmin = async (orderIds: number[]) => {
    try {
      const token = localStorage.getItem('token');
      let successCount = 0;
      
      for (const orderId of orderIds) {
        const order = orders.find(o => o.id === orderId);
        if (!order) continue;

        // Convert price to TND if user is Tunisian
        const isTunisian = userInfo?.country?.toLowerCase() === 'tunisia';
        const quantity = order.quantity || 1;
        let totalPrice = (parseFloat(order.total_price || '0') || 0) * quantity;
        
        if (isTunisian) {
          totalPrice = totalPrice * EUR_TO_TND_RATE;
        }

        const response = await fetch('/api/submit-order-for-admin.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ 
            order_id: orderId,
            quantity: quantity,
            total_price: totalPrice,
            currency: isTunisian ? 'TND' : 'EUR' // Send currency info
          })
        });
        
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Failed to submit order');
        }
        
        if (result.success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        alert(`${successCount} order(s) submitted for admin review! You will be notified when they are approved.`);
        setOrders(prev => prev.map(o => 
          orderIds.includes(o.id) ? { ...o, status: 'submitted_for_review' } : o
        ));
        setSelectedOrders([]);
        return true;
      } else {
        throw new Error('No orders were successfully submitted');
      }
    } catch (error) {
      console.error('Error submitting orders:', error);
      alert(`Failed to submit orders for review: ${(error as Error).message}`);
      return false;
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setDeletingOrderId(orderId);
    try {
      const result = await apiService.deleteOrder(orderId);
      if (result.success) {
        setOrders(prev => prev.filter(order => order.id !== orderId));
        setSelectedOrders(prev => prev.filter(id => id !== orderId));
        alert('Order deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const calculateTotalPrice = () => {
    return selectedOrders.reduce((total, orderId) => {
      const order = orders.find(o => o.id === orderId);
      const quantity = order?.quantity || 1;
      return total + ((parseFloat(order?.total_price || '0') || 0) * quantity);
    }, 0);
  };

  const handlePaySelected = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order to pay for.');
      return;
    }
    
    if (userInfo?.role === 'user' && userInfo?.country?.toLowerCase() === 'tunisia') {
      // Directly submit to admin for Tunisian users
      const success = await submitOrdersToAdmin(selectedOrders);
      if (success) {
        setOrders(prev => prev.map(o => 
          selectedOrders.includes(o.id) ? { ...o, status: 'submitted_for_review' } : o
        ));
        setSelectedOrders([]);
      }
    } else {
      // Regular PayPal flow for others
      const totalAmount = calculateTotalPrice();
      setPayPalAmount(totalAmount);
      setPayPalOrderIds([...selectedOrders]);
      setShowPayPal(true);
    }
  };

  const handleIndividualPay = async (orderId: number) => {
    if (userInfo?.role === 'user' && userInfo?.country?.toLowerCase() === 'tunisia') {
      // Directly submit to admin for Tunisian users
      const success = await submitOrdersToAdmin([orderId]);
      if (success) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: 'submitted_for_review' } : o
        ));
      }
    } else {
      // Regular PayPal flow for others
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const amount = (parseFloat(order.total_price || '0') || 0) * (order.quantity || 1);
      setPayPalAmount(amount);
      setPayPalOrderIds([orderId]);
      setPayingOrderId(orderId);
      setShowPayPal(true);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading orders...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No Orders Found</h2>
        <p>The orders table is empty or no orders were found.</p>
      </div>
    );
  }

  const totalPrice = convertPrice(calculateTotalPrice());

  return (
    <div style={{ padding: '20px', width: '100%' }}>
      <h1>My Orders ({orders.length} orders found)</h1>
      
      {orders.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onChange={toggleSelectAll}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 'bold' }}>
                {selectedOrders.length === orders.length ? 'Deselect All' : 'Select All'}
              </span>
            </label>
            <span style={{ color: '#666' }}>
              ({selectedOrders.length} of {orders.length} selected)
            </span>
          </div>
          
          {selectedOrders.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Total Price:</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {totalPrice.currency}{totalPrice.amount}
                </div>
              </div>
              <button
                onClick={handlePaySelected}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
              >
                {userInfo?.role === 'user' && userInfo?.country?.toLowerCase() === 'tunisia' ? 
                  '📩 Submit Selected' : 
                  '💳 Pay Selected'} ({selectedOrders.length})
              </button>
            </div>
          )}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {orders.map((order, idx) => {
          const orderPrice = convertPrice(
            (parseFloat(order.total_price || '0') || 0) * (order.quantity || 1)
          );
          
          return (
            <div 
              key={idx} 
              style={{ 
                border: selectedOrders.includes(order.id) ? '2px solid #28a745' : '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px', 
                backgroundColor: selectedOrders.includes(order.id) ? '#f8fff8' : 'white', 
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {order.source_designs && (
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#e3d5ff',
                  color: '#5a3d8a',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  zIndex: 20
                }}>
                  Combined
                </span>
              )}
              <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => toggleOrderSelection(order.id)}
                  style={{ 
                    width: '20px', 
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
              </div>
              
              <button
                onClick={() => handleDeleteOrder(order.id)}
                disabled={deletingOrderId === order.id}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: deletingOrderId === order.id ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: deletingOrderId === order.id ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  zIndex: 10
                }}
                title="Delete this order"
              >
                {deletingOrderId === order.id ? '⏳' : '×'}
              </button>
              
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  {order.order_type === 'combined' ? 'Combined Design' : 'Order'} #{order.id}
                </h3>
                
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor={`quantity-${order.id}`} style={{ fontWeight: 'bold', fontSize: '14px' }}>Quantity:</label>
                  <input
                    id={`quantity-${order.id}`}
                    type="number"
                    min={1}
                    value={order.quantity || 1}
                    onChange={e => {
                      const value = Math.max(1, parseInt(e.target.value) || 1);
                      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, quantity: value } : o));
                    }}
                    style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: order.status === 'pending' || order.status === 'under review' ? '#fff3cd' : '#d4edda',
                      color: order.status === 'pending' || order.status === 'under review' ? '#856404' : '#155724'
                    }}>
                      {order.status}
                    </span>
                    {order.order_type === 'combined' && (
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        backgroundColor: '#e3d5ff',
                        color: '#5a3d8a'
                      }}>
                        Combined
                      </span>
                    )}
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  {order.order_type === 'combined' ? (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '8px' 
                    }}>
                      {order.front_design && (
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={order.front_design} 
                            alt="Front design" 
                            style={{ 
                              width: '100%', 
                              height: 'auto', 
                              borderRadius: '6px',
                              border: '1px solid #eee'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: 'rgba(255,255,255,0.9)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#333'
                          }}>
                            Front
                          </span>
                        </div>
                      )}
                      {order.back_design && (
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={order.back_design} 
                            alt="Back design" 
                            style={{ 
                              width: '100%', 
                              height: 'auto', 
                              borderRadius: '6px',
                              border: '1px solid #eee'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: 'rgba(255,255,255,0.9)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#333'
                          }}>
                            Back
                          </span>
                        </div>
                      )}
                      {order.left_design && (
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={order.left_design} 
                            alt="Left design" 
                            style={{ 
                              width: '100%', 
                              height: 'auto', 
                              borderRadius: '6px',
                              border: '1px solid #eee'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: 'rgba(255,255,255,0.9)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#333'
                          }}>
                            Left
                          </span>
                        </div>
                      )}
                      {order.right_design && (
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={order.right_design} 
                            alt="Right design" 
                            style={{ 
                              width: '100%', 
                              height: 'auto', 
                              borderRadius: '6px',
                              border: '1px solid #eee'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: 'rgba(255,255,255,0.9)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#333'
                          }}>
                            Right
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    order.front_design && (
                      <img 
                        src={order.front_design} 
                        alt="Design" 
                        style={{ 
                          maxWidth: '100%', 
                          height: 'auto', 
                          borderRadius: '6px',
                          border: '1px solid #eee'
                        }}
                      />
                    )
                  )}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Product:</div>
                    <div style={{ fontWeight: 'bold' }}>{order.product_type || 'T-Shirt'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>Price:</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                      {orderPrice.currency}{orderPrice.amount}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleIndividualPay(order.id)}
                  style={{
                    width: '100%',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '10px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                  {userInfo?.role === 'user' && userInfo?.country?.toLowerCase() === 'tunisia' ? 
                    '📩 Submit Order' : 
                    '💳 Pay'} {orderPrice.currency}{orderPrice.amount}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {showPayPal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '400px',
            maxWidth: '90%',
            textAlign: 'center'
          }}>
            <h3>Complete Payment</h3>
            <p>Total Amount: €{payPalAmount.toFixed(2)}</p>
            <div id="paypal-button-container" style={{ margin: '20px 0' }}></div>
            <button 
              onClick={() => setShowPayPal(false)}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;