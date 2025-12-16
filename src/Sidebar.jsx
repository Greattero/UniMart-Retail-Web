import React, { useEffect, useRef, useState} from 'react';
import { BiBriefcase, BiBriefcaseAlt, BiFile, BiFileBlank, BiHome, BiSolidBriefcase, BiSolidFile, BiSolidHome, BiSolidReport } from "react-icons/bi";


function Sidebar({sendTabSignal}){

    const [buttonClicked, setButtonClicked] = useState({dashboard:true,
                                                        reports: false,
                                                        manage: false,
    })


    return(
        <>
            <div style={{
                display: "flex",
                flexDirection:"column",
                backgroundColor: "white",
                minHeight: "100vh",
                width: "17vw",
                alignItems: "center",
                
                
            }}>
                <div style={{
                    marginTop: "30px",
                    paddingBottom: "13px",
                    borderBottomWidth: 1,
                    borderBottomColor:"rgba(220, 221, 226, 1)",
                    width: "32vw",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <h1 style={{
                        color: "gray",
                    }}>
                        UniMart Retail
                    </h1>
                </div>

                <div style={{
                    marginTop: "60px",
                    marginRight: "35px",
                }}>
                    <button 
                    onClick={()=>{
                        setButtonClicked(prev => ({
                            dashboard: true,
                            reports: false,
                            manage: false
                            }));
                        sendTabSignal?.("dashboard");
                        }}
                    style={{
                        color: buttonClicked.dashboard===true ? "rgba(34, 136, 87, 1)" :"gray",
                        marginBottom: "30px",
                        display:"flex",
                        gap: 8,
                        borderWidth: buttonClicked.dashboard===true ? 2 : null,
                        padding: buttonClicked.dashboard===true ? "5px" : "5px",
                        borderColor: buttonClicked.dashboard===true ? "rgba(34, 136, 87, 1)" : null,
                        borderRadius: "10px",
                        backgroundColor: buttonClicked.dashboard===true ? "rgba(34, 136, 87, 0.1)" : null
                    }}>
                        <>
                            { buttonClicked.dashboard=== true ?
                            <BiSolidHome style={{
                            fontSize:"20px",
                            color: buttonClicked.dashboard===true ? "rgba(34, 136, 87, 1)" : "gray",
                            marginTop: "2px",
                            }}/>
                            :
                            <BiHome style={{
                                fontSize:"20px",
                                color: "gray",
                                marginTop: "2px",
                            }}/>}
                        </>
                        Dashboard
                    </button >

                    <button 
                    onClick={()=>{
                        setButtonClicked(prev => ({
                            dashboard: false,
                            reports: true,
                            manage: false
                            }));
                        sendTabSignal?.("reports");
                        }}
                    style={{
                        color: buttonClicked.reports===true ? "rgba(34, 136, 87, 1)" :"gray",
                        marginBottom: "30px",
                        display:"flex",
                        gap: 8,
                        borderWidth: buttonClicked.reports===true ? 2 : null,
                        padding: buttonClicked.reports===true ? "5px" : "5px",
                        borderColor: buttonClicked.reports===true ? "rgba(34, 136, 87, 1)" : null,
                        borderRadius: "10px",
                        backgroundColor: buttonClicked.reports===true ? "rgba(34, 136, 87, 0.1)" : null
                    }}>
                            <>
                            
                        { buttonClicked.reports=== true ?
                            <BiSolidFile style={{
                            fontSize:"20px",
                            color: buttonClicked.reports===true ? "rgba(34, 136, 87, 1)" : "gray",
                            marginTop: "2px",
                        }}/>
                            :
                            <BiFile style={{
                                fontSize:"20px",
                                color: "gray",
                                marginTop: "2px",
                            }}/>}
                        </>
                        Reports
                    </button>

                    <button 
                    onClick={()=>{
                        setButtonClicked(prev => ({
                            dashboard: false,
                            reports: false,
                            manage: true
                            }));
                        sendTabSignal?.("manage");
                        }}
                    style={{
                        color: buttonClicked.manage===true ? "rgba(34, 136, 87, 1)" :"gray",
                        marginBottom: "30px",
                        display:"flex",
                        gap: 8,
                        borderWidth: buttonClicked.manage===true ? 2 : null,
                        padding: buttonClicked.manage===true ? "5px" : "5px",
                        borderColor: buttonClicked.manage===true ? "rgba(34, 136, 87, 1)" : null,
                        borderRadius: "10px",
                        backgroundColor: buttonClicked.manage===true ? "rgba(34, 136, 87, 0.1)" : null
                    }}>
                        
                            <>
                            
                            { buttonClicked.manage=== true ?
                            <BiSolidBriefcase style={{
                            fontSize:"20px",
                            color: buttonClicked.manage===true ? "rgba(34, 136, 87, 1)" : "gray",
                            marginTop: "2px",
                        }}/>
                        :
                        <BiBriefcase style={{
                            fontSize:"20px",
                            color: "gray",
                            marginTop: "2px",
                        }}/>}
                        </>
                        
                        Manage Business
                    </button>

                </div>
                
            </div>
        </>
    )

}
export default Sidebar;