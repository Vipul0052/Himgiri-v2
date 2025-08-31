import React from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

export function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = React.useState<any[]>([])
  const [testResult, setTestResult] = React.useState<string>('')
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = React.useState(false)

  function goBack() { navigate('/') }

  async function load() {
    const r = await fetch('/api/admin?action=orders.list', { credentials: 'include' })
    if (!r.ok) return setOrders([])
    const j = await r.json()
    setOrders(j.orders || [])
  }

  React.useEffect(() => { load() }, [])

  async function testEmail() {
    try {
      const r = await fetch('/api/admin?action=test-email', { credentials: 'include' })
      const j = await r.json()
      if (r.ok) {
        setTestResult(`✅ ${j.message}`)
      } else {
        setTestResult(`❌ ${j.message}`)
      }
    } catch (e) {
      setTestResult(`❌ Test failed: ${e.message}`)
    }
  }

  async function updateStatus(id: number, status: string) {
    const r = await fetch('/api/admin?action=orders.update-status', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      credentials: 'include',
      body: JSON.stringify({ id, status })
    })
    if (r.ok) load()
  }

  async function generateInvoice(orderId: number) {
    try {
      console.log('🔍 Frontend: Generating invoice for order:', orderId, 'Type:', typeof orderId);
      
      const r = await fetch('/api/admin?action=orders.generate-invoice', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',
        body: JSON.stringify({ order_id: orderId })
      })
      
      console.log('📡 Frontend: Response status:', r.status);
      console.log('📡 Frontend: Response headers:', r.headers);
      
      if (r.ok) {
        const blob = await r.blob()
        console.log('📄 Frontend: Blob received:', blob);
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${orderId}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        console.log('✅ Frontend: Invoice download initiated');
      } else {
        const errorText = await r.text();
        console.error('❌ Frontend: Failed to generate invoice:', r.status, errorText);
        alert(`Failed to generate invoice: ${errorText}`);
      }
    } catch (e) {
      console.error('❌ Frontend: Failed to generate invoice:', e)
      alert(`Error generating invoice: ${e.message}`);
    }
  }

  async function openOrderDetails(order: any) {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function calculateGST(amount: number) {
    return (amount * 0.18).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="px-3 h-9 inline-flex items-center rounded-md border hover:bg-gray-50">Back</button>
        <h2 className="text-xl font-semibold">Orders</h2>
        <button onClick={testEmail} className="px-3 h-9 inline-flex items-center rounded-md border bg-blue-100">Test Email</button>
        {testResult && <span className="text-sm">{testResult}</span>}
      </div>

      <ul className="space-y-3">
        {orders.map(o => (
          <li key={o.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-semibold text-lg">Order #{o.id}</div>
                  <div className="text-lg font-bold text-green-600">₹{o.amount}</div>
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {formatDate(o.created_at)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div><strong>Customer:</strong> {o.name || '—'} ({o.email})</div>
                  <div><strong>Payment:</strong> {o.payment_method || 'Online'} • {o.provider || '—'}</div>
                  {o.tracking_number && <div><strong>Tracking:</strong> {o.tracking_number}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="rounded-md border px-3 h-9">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button 
                  onClick={() => openOrderDetails(o)}
                  className="px-3 h-9 rounded-md border hover:bg-gray-50"
                >
                  View Details
                </button>
                <button 
                  onClick={() => generateInvoice(o.id)}
                  className="px-3 h-9 rounded-md border bg-green-100 hover:bg-green-200"
                >
                  📄 Invoice
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id} Details</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.name || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.email}</span>
                    </div>
                    {selectedOrder.shipping?.phone && (
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="ml-2 text-gray-900">{selectedOrder.shipping.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Order Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Order Date:</span>
                      <span className="ml-2 text-gray-900">
                        {formatDate(selectedOrder.created_at)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Payment Method:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.payment_method || 'Online Payment'}</span>
                    </div>
                    {selectedOrder.provider && (
                      <div>
                        <span className="font-medium text-gray-700">Provider:</span>
                        <span className="ml-2 text-gray-900">{selectedOrder.provider}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">
                        {selectedOrder.shipping.fullName || selectedOrder.shipping.full_name || selectedOrder.name}
                      </div>
                      <div className="text-gray-700">{selectedOrder.shipping.address}</div>
                      <div className="text-gray-700">
                        {selectedOrder.shipping.city}, {selectedOrder.shipping.state}
                      </div>
                      <div className="text-gray-700">{selectedOrder.shipping.pincode}</div>
                      {selectedOrder.shipping.phone && (
                        <div className="text-gray-700">{selectedOrder.shipping.phone}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">Product</th>
                        <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">Price</th>
                        <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">Qty</th>
                        <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                        selectedOrder.items.map((item: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-200 px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">ID: {item.id}</div>
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-gray-900">₹{item.price}</td>
                            <td className="border border-gray-200 px-4 py-3 text-gray-900">{item.quantity}</td>
                            <td className="border border-gray-200 px-4 py-3 text-gray-900">₹{item.price * item.quantity}</td>
                          </tr>
                        ))
                      ) : (
                        // If no items array, show the order as a single item
                        <tr className="bg-white">
                          <td className="border border-gray-200 px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">Product</div>
                              <div className="text-sm text-gray-500">Order #{selectedOrder.id}</div>
                            </div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-gray-900">₹{selectedOrder.amount}</td>
                          <td className="border border-gray-200 px-4 py-3 text-gray-900">1</td>
                          <td className="border border-gray-200 px-4 py-3 text-gray-900">₹{selectedOrder.amount}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Order Totals */}
                <div className="mt-6 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span className="text-gray-900">Total Amount:</span>
                      <span className="text-gray-900">₹{selectedOrder.amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => generateInvoice(selectedOrder.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  📄 Generate Invoice
                </button>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}