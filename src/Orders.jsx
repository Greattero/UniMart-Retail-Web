import React, { useEffect, useRef, useState} from 'react';
import "./design-system.css";
import {BiCalendar} from "react-icons/bi";
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
    const scrollContainerRef = useRef(null);

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
        const container = scrollContainerRef.current;
        if(!container) return;

        const handleScroll = ()=>{
            const {scrollTop, scrollHeight, clientHeight} = container;

            if(scrollTop + clientHeight >=  scrollHeight - 20){
                loadOrders(false);
            }
        };
        container.addEventListener("scroll", handleScroll);
        return()=> container.removeEventListener("scroll", handleScroll);

    },[hasMore, myProfile]);

    useEffect(()=>{
        if(myProfile) loadOrders(true);
    }, [myProfile]);

    const handleAccept = (id, buyerPath) => {
    update(ref(db, `buyer-profiles/${buyerPath}/purchases/${id}`), {
        status: "incomplete",
    });

    update(ref(db, `restaurants/${myProfile}/myOrders/${id}`), {
        status: "accepted",
    });
    };

    const handleCancel = (id, buyerPath) => {
    update(ref(db, `buyer-profiles/${buyerPath}/purchases/${id}`), {
        status: "cancelled",
    });

    update(ref(db, `restaurants/${myProfile}/myOrders/${id}`), {
        status: "cancelled",
    });
    };

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

    // ---- render helpers (no logic, layout only) ----

    const truncate = (text, len = 15) => text && text.length > len ? text.slice(0, len) + "..." : text;

    const statusCell = (order) => {
        if (order.status === "accepted") {
            return (
                <button
                    onClick={()=>handleViewDetails(order.buyer,order.contact,order.foodName,order.price,order.addOns)}
                    className="um-btn"
                    style={{ backgroundColor: "var(--um-ink)", color: "white", width: "100%" }}
                >
                    <IoEyeSharp /> View order
                </button>
            );
        }
        if (order.status === "cancelled") {
            return <span className="um-badge um-badge-clay" style={{ width: "100%", justifyContent: "center" }}>Cancelled</span>;
        }
        if (order.status === "complete") {
            return (
                <button
                    onClick={()=>handleViewDetails(order.buyer,order.contact,order.foodName,order.price,order.addOns)}
                    className="um-btn"
                    style={{ backgroundColor: "#4B2E8F", color: "white", width: "100%" }}
                >
                    Completed 💜
                </button>
            );
        }
        return (
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
                <button
                    onClick={()=>{ handleAccept(order.id,order.buyerProfile); console.log("deep",order.id,order.buyerProfile); }}
                    className="um-btn um-btn-primary"
                    style={{ flex: 1, padding: "8px 10px", fontSize: 13 }}
                >Accept</button>
                <button
                    onClick={()=>{ handleCancel(order.id,order.buyerProfile); console.log("deep",order.id,order.buyerProfile); }}
                    className="um-btn um-btn-danger"
                    style={{ flex: 1, padding: "8px 10px", fontSize: 13 }}
                >Cancel</button>
            </div>
        );
    };

    const detailRow = (label, value, accent) => (
        <div style={{ marginBottom: 16 }}>
            <div style={{
                background: "var(--um-line-soft)",
                borderRadius: "var(--um-radius-sm)",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--um-ink-soft)",
            }}>
                {label}
                {accent && <span style={{ color: "var(--um-clay)", fontWeight: 700 }}>{accent}</span>}
            </div>
            <div style={{ marginTop: 8, marginLeft: 4, fontSize: 15, color: "var(--um-ink)" }}>{value}</div>
        </div>
    );

    const columns = [
        { label: "Order ID", width: "13%" },
        { label: "Food", width: "17%" },
        { label: "Customer", width: "17%" },
        { label: "Contact", width: "14%" },
        { label: "Date", width: "13%" },
        { label: "Status", width: "26%" },
    ];

    return(
        <div style={{ ...style, padding: "0 32px 32px" }}>
            <p style={{ fontFamily: "var(--um-font-display)", fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Orders</p>

            {/* Stat cards */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                <div className="um-card" style={{ flex: 1, padding: "18px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                    <BiCalendar style={{ fontSize: 20, color: "var(--um-pine)" }} />
                    <span style={{ fontWeight: 600, fontSize: 15 }}>Today</span>
                </div>
                <div className="um-card" style={{ flex: 1, padding: "18px 20px" }}>
                    <p style={{ fontSize: 13, color: "var(--um-ink-soft)" }}>Total Revenue</p>
                    <p style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>$8000</p>
                </div>
                <div className="um-card" style={{ flex: 1, padding: "18px 20px" }}>
                    <p style={{ fontSize: 13, color: "var(--um-ink-soft)" }}>Total Orders</p>
                    <p style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>330</p>
                </div>
            </div>

            {/* Orders table */}
            <div ref={scrollContainerRef} className="um-card um-scroll" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                <div style={{
                    display: "flex",
                    padding: "14px 20px",
                    position: "sticky",
                    top: 0,
                    background: "var(--um-surface)",
                    borderBottom: "1px solid var(--um-line)",
                    zIndex: 5,
                }}>
                    {columns.map(col => (
                        <div key={col.label} style={{ width: col.width, fontSize: 12, fontWeight: 700, color: "var(--um-ink-faint)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {col.label}
                        </div>
                    ))}
                </div>

                {orders.map((order, i) => (
                    <div key={i} style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px 20px",
                        borderBottom: "1px solid var(--um-line-soft)",
                    }}>
                        <div style={{ width: columns[0].width, fontSize: 14 }}>{order.orderId}</div>
                        <div style={{ width: columns[1].width, fontSize: 14 }}>{truncate(order.foodName)}</div>
                        <div style={{ width: columns[2].width, fontSize: 14 }}>{truncate(order.buyer)}</div>
                        <div style={{ width: columns[3].width, fontSize: 14 }}>{order.contact}</div>
                        <div style={{ width: columns[4].width, fontSize: 14, color: "var(--um-ink-soft)" }}>{order.date}</div>
                        <div style={{ width: columns[5].width }}>{statusCell(order)}</div>
                    </div>
                ))}

                {orders.length === 0 && !isLoading && (
                    <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--um-ink-faint)", fontSize: 14 }}>
                        No orders yet — new orders will show up here.
                    </div>
                )}
                {isLoading && <p style={{ padding: "16px 20px", fontSize: 13, color: "var(--um-ink-faint)" }}>Loading…</p>}
            </div>

            {/* Order details modal */}
            {showViewDetails===true && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(18, 38, 26, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div className="um-card um-scroll" style={{
                        width: "min(480px, 92vw)",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        padding: 28,
                        boxShadow: "var(--um-shadow-lg)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h1 style={{ fontFamily: "var(--um-font-display)", fontSize: 22, fontWeight: 600 }}>Order details</h1>
                            <button onClick={()=>handleExitViewDetails()} className="um-btn-ghost" style={{ fontSize: 20 }}>
                                <IoMdClose />
                            </button>
                        </div>

                        {detailRow("Name", viewBuyer)}
                        {detailRow("Contact", viewContact)}
                        {detailRow("Food details", (
                            <>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{viewFoodName}</div>
                                {Object.keys(viewAddons).filter(key=>viewAddons[key]).map((viewAddon)=>(
                                    <div key={viewAddon} style={{ fontStyle: "italic", marginTop: 6, color: "var(--um-ink-soft)" }}>{viewAddon}</div>
                                ))}
                            </>
                        ), `GH₵${viewFoodPrice}`)}
                    </div>
                </div>
            )}
        </div>
    )

}
export default Orders;
