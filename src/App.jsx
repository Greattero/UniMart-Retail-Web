import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx';
import Orders from './Orders.jsx';
import './index.css';


function App() {

  return (
 <div style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "rgba(231, 232, 231, 1)",
        overflow: "hidden", // VERY IMPORTANT
      }}>
  <Sidebar/>

  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
    <Header style={{ height: "9vh" }} />
    <Orders style={{ flex: 1, marginTop: "15px", marginLeft:"52px", minWidth:"100vw"}} />
  </div>
</div>

  )
}

export default App
