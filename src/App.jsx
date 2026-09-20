import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx';
import Orders from './Orders.jsx';
import ManageBusiness from './ManageBusiness.jsx';
import LoginSignup from './LoginSignup.jsx';
import CardScanner from './CardScanner.jsx';
import './index.css';


function App() {

  const [tab,setTab] = useState("dashboard");
  const [seller, setSeller] = useState("");
  const [business, setBusiness] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState("");
  const [typeOfBusiness, setTypeOfBusiness] = useState("");

  console.log("Seller: ", seller);
  console.log("Business: ", business);


  return (
 <div style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "var(--um-canvas)",
        overflow: "hidden", // VERY IMPORTANT
      }}>
{  isLoggedIn === true ?
  <>
  <Sidebar
    sendTabSignal={setTab}
    />

    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <Header style={{ height: "64px" }}
      getProlifeName={business}
      />
      <div style={{ flex: 1, overflowY: "auto", paddingTop: "24px" }}>
      {tab === "dashboard" && <Orders
      getMyProfile={seller}
      />}
      {tab === "manage" && <ManageBusiness
      style={{ flex: 1, marginTop: "20px", marginLeft:"40px", minWidth:"100vw"}}
      getSeller={seller}
      getBusinessType={typeOfBusiness}
      getNameofBusiness={business}
      />}
      </div>
    </div>
  </>
:
  <LoginSignup
  sendProfile={setSeller}
  sendBusinessName={setBusiness}
  setLogger={setIsLoggedIn}
  sendBusinessType={setTypeOfBusiness}
  />}
  {/* <CardScanner/> */}

</div>

  )
}

export default App
