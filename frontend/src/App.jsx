import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import Stats from './components/Stats'
import AddItemForm from './components/AddItemForm'
import ItemsToBuy from './components/ItemsToBuy'
import ItemsBought from './components/ItemsBought'
import Footer from './components/Footer'
import Notification from './components/Notification'
import { LoadingProvider } from './LoadingContext'

// API base URL - update this to match your API endpoint
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Change this to your actual API URL

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', visible: false });

  // Fetch all items from API
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        showNotification('Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      showNotification('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Add new item
  const addItem = async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setItems(prev => [...prev, newItem]);
        showNotification('Item added successfully!');
        return true;
      } else {
        showNotification('Failed to add item');
        return false;
      }
    } catch (error) {
      console.error('Error adding item:', error);
      showNotification('Error connecting to server');
      return false;
    }
  };

  // Update item status (bought/not bought)
  const updateItemStatus = async (id, bought) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bought }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItems(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ));
        showNotification(`Item marked as ${bought ? 'bought' : 'not bought'}`);
      } else {
        showNotification('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('Error connecting to server');
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
        showNotification('Item deleted successfully!');
      } else {
        showNotification('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('Error connecting to server');
    }
  };

  // Show notification
  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 3000);
  };

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Calculate stats
  const totalItems = items.length;
  const activeItems = items.filter(item => !item.bought).length;
  const boughtItems = items.filter(item => item.bought).length;

  const itemsToBuy = items.filter(item => !item.bought);
  const itemsBought = items.filter(item => item.bought);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading your grocery list...</p>
      </div>
    );
  }

  return (
    <LoadingProvider>
      <div class="fruit-decoration apple"></div>
      <div class="fruit-decoration orange"></div>
      <Header/>
      <div className='app-container'>
        <Stats 
          totalItems={totalItems}
          activeItems={activeItems}
          boughtItems={boughtItems}
        />
        <AddItemForm onAddItem={addItem} />
        <ItemsToBuy 
          items={itemsToBuy}
          onUpdateItem={updateItemStatus}
          onDeleteItem={deleteItem}
        />
        <ItemsBought 
          items={itemsBought}
          onUpdateItem={updateItemStatus}
          onDeleteItem={deleteItem}
        />
        <Footer />
      </div>
      <Notification 
        message={notification.message}
        visible={notification.visible}
      />
    </LoadingProvider>
  )
}

export default App