import React, { useEffect, useRef, useState} from 'react';
import {BiCalendar, BiHome} from "react-icons/bi";
import { IoEyeSharp } from "react-icons/io5";



function Orders({style}){

    const [isAcceptOrder, setIsAcceptOrder] = useState({});


    const orders = [
    { orderId: "UM-001", food: "Fried Rice", buyer: "Jessica Mahunu", contact: "0540000001", date: "2025-02-01", status: "Pending" },
    { orderId: "UM-002", food: "Jollof Rice", buyer: "Foster Ametepey", contact: "0540000002", date: "2025-02-01", status: "Completed" },
    { orderId: "UM-003", food: "Chicken Burger", buyer: "Efia Sarpong", contact: "0540000003", date: "2025-02-02", status: "Pending" },
    { orderId: "UM-004", food: "Pizza", buyer: "Kojo Mensah", contact: "0540000004", date: "2025-02-02", status: "In Progress" },
    { orderId: "UM-005", food: "Shawarma", buyer: "Ama Boadu", contact: "0540000005", date: "2025-02-03", status: "Completed" },
    { orderId: "UM-006", food: "Banku & Tilapia", buyer: "Yaw Amankwah", contact: "0540000006", date: "2025-02-03", status: "Pending" },
    { orderId: "UM-007", food: "Wakye", buyer: "Abena Serwaa", contact: "0540000007", date: "2025-02-04", status: "Completed" },
    { orderId: "UM-008", food: "Sandwich", buyer: "Michael Ofori", contact: "0540000008", date: "2025-02-04", status: "Pending" },
    { orderId: "UM-009", food: "Kebab", buyer: "Nana Kyei", contact: "0540000009", date: "2025-02-05", status: "In Progress" },
    { orderId: "UM-010", food: "Yam Chips", buyer: "Linda Asare", contact: "0540000010", date: "2025-02-05", status: "Pending" },
    { orderId: "UM-011", food: "Noodles", buyer: "Peter Boateng", contact: "0540000011", date: "2025-02-06", status: "Completed" },
    { orderId: "UM-012", food: "Fufu", buyer: "Sarah Adjei", contact: "0540000012", date: "2025-02-06", status: "Pending" },
    { orderId: "UM-013", food: "Kelewele", buyer: "Kwesi Darko", contact: "0540000013", date: "2025-02-07", status: "Pending" },
    { orderId: "UM-014", food: "Salad", buyer: "Akua Badu", contact: "0540000014", date: "2025-02-07", status: "Completed" },
    { orderId: "UM-015", food: "Omelette", buyer: "Richmond Nartey", contact: "0540000015", date: "2025-02-08", status: "In Progress" },
    { orderId: "UM-016", food: "Boiled Yam", buyer: "Deborah Owusu", contact: "0540000016", date: "2025-02-08", status: "Pending" },
    { orderId: "UM-017", food: "Meat Pie", buyer: "Prince Tetteh", contact: "0540000017", date: "2025-02-09", status: "Completed" },
    { orderId: "UM-018", food: "Spring Rolls", buyer: "Rita Nyarko", contact: "0540000018", date: "2025-02-09", status: "Pending" },
    { orderId: "UM-019", food: "Hotdog", buyer: "Emmanuel Addo", contact: "0540000019", date: "2025-02-10", status: "In Progress" },
    { orderId: "UM-020", food: "Chicken Wrap", buyer: "Mabel Aryee", contact: "0540000020", date: "2025-02-10", status: "Pending" },
    { orderId: "UM-021", food: "Burger", buyer: "Kingsley Amuzu", contact: "0540000021", date: "2025-02-11", status: "Completed" },
    { orderId: "UM-022", food: "Tacos", buyer: "Hannah Yeboah", contact: "0540000022", date: "2025-02-11", status: "Pending" },
    { orderId: "UM-023", food: "Lasagna", buyer: "Samuel Owusu", contact: "0540000023", date: "2025-02-12", status: "In Progress" },
    { orderId: "UM-024", food: "Chicken Rice", buyer: "Doris Addai", contact: "0540000024", date: "2025-02-12", status: "Completed" },
    { orderId: "UM-025", food: "BBQ Wings", buyer: "Jonathan Mensah", contact: "0540000025", date: "2025-02-13", status: "Pending" },
    { orderId: "UM-026", food: "Ice Cream", buyer: "Angela Duah", contact: "0540000026", date: "2025-02-13", status: "Completed" },
    { orderId: "UM-027", food: "Steak", buyer: "Elvis Torgah", contact: "0540000027", date: "2025-02-14", status: "Pending" },
    { orderId: "UM-028", food: "Goat Meat", buyer: "Miriam Obeng", contact: "0540000028", date: "2025-02-14", status: "In Progress" },
    { orderId: "UM-029", food: "Pancakes", buyer: "Selina Twum", contact: "0540000029", date: "2025-02-15", status: "Completed" },
    { orderId: "UM-030", food: "Donuts", buyer: "Felix Dankwa", contact: "0540000030", date: "2025-02-15", status: "Pending" },
    { orderId: "UM-031", food: "Tuna Sandwich", buyer: "Rachel Osei", contact: "0540000031", date: "2025-02-16", status: "Completed" },
    { orderId: "UM-032", food: "Rice Balls", buyer: "Nana Boateng", contact: "0540000032", date: "2025-02-16", status: "Pending" },
    { orderId: "UM-033", food: "Gizzard Stew", buyer: "Esi Atta", contact: "0540000033", date: "2025-02-17", status: "In Progress" },
    { orderId: "UM-034", food: "Muffin", buyer: "Daniel Otoo", contact: "0540000034", date: "2025-02-17", status: "Pending" },
    { orderId: "UM-035", food: "Coconut Rice", buyer: "Abigail Ofori", contact: "0540000035", date: "2025-02-18", status: "Completed" },
    { orderId: "UM-036", food: "Tortilla", buyer: "Isaac Quaye", contact: "0540000036", date: "2025-02-18", status: "Pending" },
    { orderId: "UM-037", food: "Kofta", buyer: "Vivian Agyemang", contact: "0540000037", date: "2025-02-19", status: "In Progress" },
    { orderId: "UM-038", food: "Rice & Stew", buyer: "Joshua Armah", contact: "0540000038", date: "2025-02-19", status: "Pending" },
    { orderId: "UM-039", food: "Nuggets", buyer: "Millicent Kumi", contact: "0540000039", date: "2025-02-20", status: "Completed" },
    { orderId: "UM-040", food: "French Fries", buyer: "Yaw Ackah", contact: "0540000040", date: "2025-02-20", status: "Pending" },
    { orderId: "UM-041", food: "Stir Fry", buyer: "Martha Agyei", contact: "0540000041", date: "2025-02-21", status: "Completed" },
    { orderId: "UM-042", food: "Mashed Potatoes", buyer: "Shawn Koranteng", contact: "0540000042", date: "2025-02-21", status: "Pending" },
    { orderId: "UM-043", food: "Roasted Corn", buyer: "Kobby Saah", contact: "0540000043", date: "2025-02-22", status: "In Progress" },
    { orderId: "UM-044", food: "Milkshake", buyer: "Nana Ama", contact: "0540000044", date: "2025-02-22", status: "Completed" },
    { orderId: "UM-045", food: "Grilled Chicken", buyer: "Cynthia Owusu", contact: "0540000045", date: "2025-02-23", status: "Pending" },
    { orderId: "UM-046", food: "Spaghetti", buyer: "Henry Ofori", contact: "0540000046", date: "2025-02-23", status: "Completed" },
    { orderId: "UM-047", food: "Egg Fried Rice", buyer: "Mary Nti", contact: "0540000047", date: "2025-02-24", status: "Pending" },
    { orderId: "UM-048", food: "Turkey Wings", buyer: "Samuel Owusu", contact: "0540000048", date: "2025-02-24", status: "In Progress" },
    { orderId: "UM-049", food: "Meatballs", buyer: "Priscilla Boateng", contact: "0540000049", date: "2025-02-25", status: "Completed" },
    { orderId: "UM-050", food: "Plantain & Beans", buyer: "Kweku Oteng", contact: "0540000050", date: "2025-02-25", status: "Pending" },
    ];



    return(
        <>
            <div
            style={{
                ...style
            }}
            >
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
                borderRadius: "20px"
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
                        height: "5.5vh",
                        width: "73vw",
                        backgroundColor: "#ffc0cbff",
                        borderRadius: " 10px",
                        marginTop:"10px",
                        marginLeft:"7px",
                        display: "flex",
                        alignItems:"center",
                        flexDirection: "column",
                        position: "sticky",   // <-- make it sticky
                        top: 0,               // <-- stick to top
                        zIndex: 10,
                    }}>
                        <div style={{
                            display: "flex",
                            flexDirection:"row",
                            marginTop: "7px",
                            marginBottom:"20px",
                            marginRight:"40px",
                            gap: 130,
                        }}>
                        <p>Order Id</p>
                        <p>Food</p>
                        <p>Buyer</p>
                        <p>Contact</p>
                        <p>Date</p>
                        <div style={{
                            color: "black",
                            width: "10vw",
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
                    <p>{order.food.length > 15 ? order.food.slice(0,15) + "..." : order.food}</p>
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
                        { isAcceptOrder[order.orderId] ? (
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
                        onClick={()=>setIsAcceptOrder((prev)=>({...prev, [order.orderId]: true}))}
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