import { useEffect, useState } from 'react'
import './App.css'

type Order = {
  orderId: number
  userId: number
  orderDate: string
}

type OrderForm = {
  userId: string
  orderDate: string
}

const API_URL = 'http://localhost:5045/api/Orders'

function App() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState<OrderForm>({
    userId: '',
    orderDate: ''
  })

  useEffect(() => {
    getOrders()
  }, [])

  async function getOrders() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const orderToSend = {
      userId: Number(formData.userId),
      orderDate: formData.orderDate
    }

    try {
      setError('')

      if (editingId === null) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderToSend)
        })

        if (!response.ok) {
          throw new Error('Failed to create order')
        }
      } else {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: editingId,
            ...orderToSend
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update order')
        }
      }

      setFormData({
        userId: '',
        orderDate: ''
      })
      setEditingId(null)
      getOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  function handleEdit(order: Order) {
    setEditingId(order.orderId)
    setFormData({
      userId: String(order.userId),
      orderDate: order.orderDate.slice(0, 10)
    })
  }

  async function handleDelete(id: number) {
    try {
      setError('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      getOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  function handleCancelEdit() {
    setEditingId(null)
    setFormData({
      userId: '',
      orderDate: ''
    })
  }

  return (
    <div>
      <h1>Orders</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>User ID: </label>
          <input
            type="number"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Order Date: </label>
          <input
            type="date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">
          {editingId === null ? 'Add Order' : 'Update Order'}
        </button>

        {editingId !== null && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {loading && <p>Loading orders...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.userId}</td>
                <td>{order.orderDate}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(order)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(order.orderId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App