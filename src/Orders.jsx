import React, { useEffect, useRef, useState} from 'react';
import {BiCalendar, BiHome} from "react-icons/bi";
import { IoEyeSharp } from "react-icons/io5";
import { app } from "./firebaseConfig.js"; // your firebaseConfig file
import { get, getDatabase, ref, update } from "firebase/database";



function Orders({style, getMyProfile}){

    const db = getDatabase(app);

    const [isAcceptOrder, setIsAcceptOrder] = useState({});
    const [myProfile, setMyProfile] = useState("");
    

    useEffect(()=>{
        setMyProfile(getMyProfile);
    },[getMyProfile])

    const [orders, setOrders] = useState([]);

    get(ref(db, `restaurants/${myProfile}/myOrders`)).then((snapshot)=>{
        const data = snapshot.val() || [];
        const ordersArray = Object.entries(data).map(([id, order]) => ({
            id,
            ...order,
        }));
        setOrders(ordersArray);
        // console.log(data);
    })

    const handleAccept = (id, buyerPath, confirmid) => {
    update(ref(db, `buyer-profiles/${buyerPath}/purchases/${id}`), {
        status: "incomplete",
    });

    update(ref(db, `restaurants/${myProfile}/myOrders/${id}`), {
        status: "accepted",
    });

    // setIsAcceptOrder(prev => ({
    //     ...prev,
    //     [confirmid]: true,
    // }));
    };

    // console.log(myOrder);

    



    return(
        <>
            <div
            style={{
                ...style
            }}
            >
                <div  style={{
                    position:"relative"
                }}>
                <p style={{
                    paddingBottom: "20px",
                    fontSize: "25px",
                    fontWeight:"bold"
                }}>Orders</p>
                <div style={{
                    height: "13vh",
                    width: "76vw",
                    backgroundColor: "white",
                    borderRadius: " 20px",
                    display: "flex",
                    alignItems: "center",
                }}>

                    <div style={{
                    marginLeft: "20px",
                    display: "flex",
                    borderRightWidth: 1,
                    height: "13vh",
                    width: "7vw",
                    alignItems: "center",
                    borderRightColor: "rgba(231, 232, 231, 1)",

                    }}>
                        <BiCalendar style={{
                            fontSize:"20px",
                            color: "black",
                            marginTop: "2px",
                        }}/>
                        <p>Today</p>
                    </div>


                    <div style={{
                    marginLeft: "20px",
                    display: "flex",
                    borderRightWidth: 1,
                    height: "13vh",
                    width: "15vw",
                    alignItems: "center",
                    borderRightColor: "rgba(231, 232, 231, 1)",
                    flexDirection: "column",
                    overflow: "hidden"

                    }}>
                        <p style={{
                            fontSize:13,
                            color: "gray",
                            marginRight:"140px",
                            marginTop:"15px",
                            display:"flex",


                        }}                        
                        >Total Revenue</p>

                        <p style={{
                            color: "black",
                            marginTop:"15px",
                            marginRight:"130px",
                            fontSize: "30px",
                            fontWeight:"bold"

                        }} >$8000</p>
                    </div>

                    <div style={{
                    marginLeft: "20px",
                    display: "flex",
                    borderRightWidth: 1,
                    height: "13vh",
                    width: "15vw",
                    alignItems: "center",
                    borderRightColor: "rgba(231, 232, 231, 1)",
                    flexDirection: "column",
                    overflow: "hidden"

                    }}>

                        <p style={{
                            fontSize:13,
                            color: "gray",
                            marginRight:"120px",
                            marginTop:"15px",
                            display:"flex",
                        }}
                        
                        >Total Orders</p>

                        <p style={{
                            color: "black",
                            marginTop:"15px",
                            marginRight:"135px",
                            fontSize: "30px",
                            fontWeight:"bold"

                        }} >330</p>
                    </div>

                    <div style={{
                    marginLeft: "20px",
                    display: "flex",
                    borderRightWidth: 1,
                    height: "13vh",
                    width: "15vw",
                    alignItems: "center",
                    borderRightColor: "rgba(231, 232, 231, 1)",

                    }}>
                        <BiCalendar style={{
                            fontSize:"20px",
                            color: "black",
                            marginTop: "2px",
                        }}/>
                        <p>Today</p>
                    </div>
                    </div>


                </div>
                
                <div style={{
                height: "62vh",
                width: "76vw",
                display: "flex", 
                // borderRadius:"5px",
                backgroundColor:"white",
                marginTop:"30px",
                paddingTop:"10px",
                alignItems:"center",
                justifyContent:"center",
                borderRadius: "20px",
                }}>
                <div style={{
                height: "57vh",
                width: "76vw",
                overflow: "scroll",
                backgroundColor: "white",
                // borderRadius: " 20px",
                display: "flex",
                alignItems: "center",
                marginTop: "3.5px",
                flex: 1,
                flexDirection:"column",                
                }}>

                    <div style={{
                        height: "50px",
                        width: "73vw",
                        backgroundColor: "#ffc0cbff",
                        borderRadius: " 10px",
                        marginTop:"0px",
                        // marginLeft:"7px",
                        display: "flex",
                        justifyContent:"center",
                        flexDirection: "column",
                        position: "sticky",   // <-- make it sticky
                        top: 0,               // <-- stick to top
                        zIndex: 10,
                    }}>

                        <div style={{
                            display: "flex",
                            flexDirection:"row",
                            marginTop: "20px",
                            marginBottom:"20px",
                            marginRight:"40px",
                            marginLeft:"-20px",
                            gap: 30,
                        }}>

                    <div style={{
                            color: "black",
                            width: "10vw",
                            display: "flex",
                            justifyContent: "center",
                    }}>
                        <p>Order Id</p>
                        </div>
                    <div style={{
                            color: "black",
                            width: "10vw",
                            display: "flex",
                            justifyContent: "center",
                    }}>
                        <p>Food</p>
                        </div>
                    <div style={{
                            color: "black",
                            width: "10vw",
                            display: "flex",
                            justifyContent: "center",
                    }}>
                        <p>Customer</p>
                        </div>
                    <div style={{
                             color: "black",
                            width: "8vw",
                            display: "flex",
                            justifyContent: "center",
                    }}>
                        <p>Contact</p>
                        </div>
                    <div style={{
                            color: "black",
                            width: "10vw",
                            display: "flex",
                            justifyContent: "center",
                    }}>
                        <p>Date</p>
                        </div>
                        <div style={{
                            color: "black",
                            width: "15vw",
                            display: "flex",
                            justifyContent: "center",
                        }}> 
                        <p>Status</p>
                        </div>
                        </div>

                    </div>
                       <div style={{
                        height: "6.5vh",
                        width: "75vw",
                        // backgroundColor: "#ffc0cb76",
                        borderRadius: " 10px",
                        marginTop:"5px",
                        display: "flex",
                        alignItems:"center",
                        flexDirection:"column",
                    }}>
                        
            {orders.map((order, i) => {
                return (
                <div
                    key={i}
                    style={{
                    display: "flex",
                    flexDirection:"row",
                    marginLeft:"20px",
                    marginBottom:"20px",
                    gap: 20,
                    }}
                >
                    <div style={{
                        width: "10vw",
                    }}>
                    <p>{order.orderId}</p>
                    </div>
                    <div style={{
                        width: "10vw",
                    }}>
                    <p>{order.foodName.length > 15 ? order.foodName.slice(0,15) + "..." : order.foodName}</p>
                    </div>
                    <div style={{
                        width: "10vw",
                    }}>
                    <p>{order.buyer.length > 15 ? order.buyer.slice(0,15) + "..." : order.buyer}</p>
                    </div>
                    <div style={{
                        width: "10vw",
                    }}>
                    <p>{order.contact}</p>
                    </div>
                    <div style={{
                        width: "10vw",
                    }}>
                    <p>{order.date}</p>
                    </div>
                    <div style={{
                        // width: "10vw",
                        display: "flex",
                        flexDirection: "row",
                        gap: 10,

                    }}>
                        { order.status === "accepted" ? (
                        <button style={{
                            backgroundColor: "rgba(167, 167, 167, 1)",
                            color: "white",
                            width: "14.7vw",
                            display: "flex",
                            justifyContent: "center",
                            borderRadius: "5px",
                            gap: 5,
                        }}
                        >
                            <IoEyeSharp style={{
                                marginTop: "4px"
                            }}/>
                            View Order</button>)
                        
                        :

                    <>
                        <button style={{
                            backgroundColor: "rgba(18, 125, 54, 1)",
                            color: "white",
                            width: "7vw",
                            display: "block",
                            justifyContent: "center",
                            borderRadius: "5px"
                        }}
                        onClick={()=>{
                                        handleAccept(order.id,order.buyerProfile,order.orderId);
                                        console.log("deep",order.id,order.buyerProfile,order.orderId)
                    }}
                        >Accept</button>

                        <button style={{
                            backgroundColor: "rgba(194, 44, 44, 1)",
                            color: "white",
                            width: "7vw",
                            display: "block",
                            justifyContent: "center",
                            borderRadius: "5px"
                        }}
                        >Cancel</button>
                    </>
            }
                    </div>
                </div>
                );
            })}
            </div>
                </div>
            </div>




                
            </div>        
        </>
    )

}
export default Orders;