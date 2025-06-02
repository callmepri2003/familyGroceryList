import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Stats from './components/Stats'
import AddItemForm from './components/AddItemForm'
import ItemsToBuy from './components/ItemsToBuy'
import ItemsBought from './components/ItemsBought'
import Footer from './components/Footer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header/>
      <div className='app-container'>
        <Stats/>
        <AddItemForm/>
        <ItemsToBuy/>
        <ItemsBought/>
        <Footer />
      </div>
    </>
  )
}

export default App
