import React, { useEffect, useRef, useState} from 'react';
import {BiCalendar, BiHome} from "react-icons/bi";
import { IoEyeSharp } from "react-icons/io5";
import { app } from "./firebaseConfig.js"; // your firebaseConfig file
import { get, getDatabase, limitToFirst, orderByKey, query, ref, startAt, update } from "firebase/database";
import { IoMdClose } from "react-icons/io";



function Orders({style, getMyProfile}){

    const db = getDatabase(app);

    const [isAcceptOrder, setIsAcceptOrder] = useState({});
    const [myProfile, setMyProfile] = useState("");
    const [viewBuyer, setViewBuyer] = useState("");
    const [viewContact, setViewContact] = useState("");
    const [viewFoodName, setViewFoodName] = useState("");
    const [viewFoodPrice, setViewFoodPrice] = useState("");
    const [viewAddons, setViewAddons] = useState({});
    const [showViewDetails, setShowViewDetails] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    
    const loadingRef = useRef(false);
    const lastKeyRef = useRef(null);

    const PAGE_SIZE = 10;


    useEffect(()=>{
        setMyProfile(getMyProfile);
    },[getMyProfile])

    const [orders, setOrders] = useState([]);


    const loadOrders = async (isInitial = true) =>{
        if (loadingRef.current || (!isInitial && ! hasMore)) return;

        loadingRef.current = true;
        setIsLoading(true);
        const orderRef = ref(db, `restaurants/${myProfile}/myOrders`);

        const orderQuery = isInitial
        ? query(orderRef,orderByKey(), limitToFirst(PAGE_SIZE))
        : query(orderRef, orderByKey(), startAt(lastKeyRef.current), limitToFirst(PAGE_SIZE + 1));

        const snapshot = await get(orderQuery);

        if(snapshot.exists()){
            const entries = Object.entries(snapshot.val());

            if(!isInitial) entries.shift();

            if(entries.length === 0){
                setHasMore(false);
                setIsLoading(false);
            } else{
                lastKeyRef.current = entries[entries.length - 1][0];
                const newOrders = entries.map(([id, order])=>({id, ...order}));
                setOrders(prev=>isInitial ? newOrders : [...prev, ...newOrders]);
            }
        } else{
            setHasMore(false);
        }

        loadingRef.current = false;
        // setIsLoading(false);

    }

    useEffect(()=>{
        const handleScroll = ()=>{
            const {scrollTop, scrollHeight, clientHeight} = document.documentElement;

            if(scrollTop + clientHeight >=  scrollHeight - 20){
                loadOrders(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return()=> window.removeEventListener("scroll", handleScroll);

    },[hasMore, myProfile]);

    useEffect(()=>{
        if(myProfile) loadOrders(true);
    }, [myProfile]);

    // get(ref(db, `restaurants/${myProfile}/myOrders`)).then((snapshot)=>{
    //     const data = snapshot.val() || [];
    //     const ordersArray = Object.entries(data).map(([id, order]) => ({
    //         id,
    //         ...order,
    //     }));
    //     setOrders(ordersArray);
    //     // console.log(data);
    // })

    const handleAccept = (id, buyerPath) => {
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

    const handleCancel = (id, buyerPath) => {
    update(ref(db, `buyer-profiles/${buyerPath}/purchases/${id}`), {
        status: "cancelled",
    });

    update(ref(db, `restaurants/${myProfile}/myOrders/${id}`), {
        status: "cancelled",
    });

    // setIsAcceptOrder(prev => ({
    //     ...prev,
    //     [confirmid]: true,
    // }));
    };

    // console.log(myOrder);

    const handleViewDetails = (buyer, contact, foodName, price, addOns)=>{
        setShowViewDetails(true);
        setViewBuyer(buyer);
        setViewContact(contact);
        setViewFoodName(foodName);
        setViewFoodPrice(price)
        setViewAddons(addOns);
            console.log("Viewers: ",viewBuyer,viewContact,viewFoodName,viewAddons)

    }

    const handleExitViewDetails = ()=>{
        setShowViewDetails(false);
        setViewBuyer("");
        setViewContact("");
        setViewFoodName("");
        setViewFoodPrice("");
        setViewAddons("");

    }


    



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
                            
                        <button 
                        onClick={()=>handleViewDetails(order.buyer,order.contact,order.foodName,order.price,order.addOns)}
                        style={{
                            backgroundColor: "rgba(0, 0, 0, 1)",
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
                        
                        : order.status === "cancelled" ?
                        <button style={{
                            backgroundColor: "rgba(110, 110, 110, 1)",
                            color: "white",
                            width: "14.7vw",
                            display: "flex",
                            justifyContent: "center",
                            borderRadius: "5px",
                            gap: 5,
                        }}
                        >

                            Order Cancelled</button>

                        : order.status === "complete" ?
                        <button 
                        onClick={()=>handleViewDetails(order.buyer,order.contact,order.foodName,order.price,order.addOns)}
                        style={{
                            backgroundColor: "rgba(63, 3, 124, 1)",
                            color: "white",
                            width: "14.7vw",
                            display: "flex",
                            justifyContent: "center",
                            borderRadius: "5px",
                            gap: 5,
                        }}
                        >

                            Order Completed 💜</button>
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
                                        handleAccept(order.id,order.buyerProfile);
                                        console.log("deep",order.id,order.buyerProfile)
                    }}
                        >Accept</button>

                        <button 
                        onClick={()=>{
                                        handleCancel(order.id,order.buyerProfile);
                                        console.log("deep",order.id,order.buyerProfile)
                    }}
                        style={{
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
            {/* {console.log(order.addOns)} */}
                    </div>
                </div>
                );
            })}
            {isLoading && <p>Loading...</p>}
            </div>
                </div>
            </div>

                {showViewDetails===true && <div style={{
                    position: "fixed",
                    top: 0,
                    left:0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000

                }}>
                    <div style={{
                        width: "36vw",
                        height: "62vh",
                        backgroundColor: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "20px",

                    }}>
                    <div style={{
                        width: "35vw",
                        height: "60vh",
                        backgroundColor: "white",
                        overflowY: "scroll"

                        // position: "fixed",
                        // left: 450,
                        // top: 100,
                    }}>
                        <h1 style={{
                            margin: "20px",
                            fontSize: "35px",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>Full Order Details
                        
                        <button
                            onClick={()=>handleExitViewDetails()}
                            style={{
                                color: "#554f4fff"                                
                            }}
                        >
                            <IoMdClose />
                        </button>
                        
                        </h1>

                        <div style={{
                            display: "flex",
                            flexDirection: "column"
                        }}>

                            <label style={{
                                marginLeft:"20px",
                                // marginTop: "5px",
                                backgroundColor: "#eee",
                                width: "32.5vw",
                                height: "5vh",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "5px",
                                paddingLeft: "15px",
                                fontWeight:"bold"
                                }}>Name </label>
                                <label style={{
                                marginLeft:"30px",
                                marginTop: "15px"

                                }}>{viewBuyer}</label>
                            <label style={{
                                marginLeft:"20px",
                                marginTop: "15px",
                                backgroundColor: "#eee",
                                width: "32.5vw",
                                height: "5vh",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "5px",
                                paddingLeft: "15px",
                                fontWeight:"bold",
                                }}>Contact </label>
                                <label style={{
                                marginLeft:"30px",
                                marginTop: "15px"

                                }}>{viewContact}</label>

                            <label style={{
                                marginLeft:"20px",
                                marginTop: "15px",
                                backgroundColor: "#eee",
                                width: "32.5vw",
                                height: "5vh",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "5px",
                                paddingLeft: "15px",
                                fontWeight:"bold",
                            }}>{`Food Details`}                                
                            <span
                                style={{
                                    color: "red",
                                    marginLeft: "auto",
                                    fontWeight:"bold"
                                }}
                                >{`GH₵${viewFoodPrice}`}</span> 
                                </label>

                                <label style={{
                                marginLeft:"30px",
                                marginTop: "15px",
                                fontWeight:"bold",
                                fontSize: 18

                                }}>{`${viewFoodName} `}
                                
                                </label>

                                {Object.keys(viewAddons).filter(key=>viewAddons[key]).map((viewAddon)=>{

                                    return(
                                <label 
                                key={viewAddon}
                                style={{
                                marginLeft:"30px",
                                marginTop: "15px",
                                fontStyle:"italic"

                                }}>{viewAddon}</label>

                                    )
                                })}
                        </div>

                    </div>
                    </div>


                </div>}




                
            </div>        
        </>
    )

}
export default Orders;