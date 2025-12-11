import React, { useEffect, useRef, useState} from 'react';
import { BiBriefcase, BiFile, BiFileBlank, BiHome, BiSolidReport } from "react-icons/bi";


function Sidebar(){


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
                }}>
                    <button style={{
                        color: "gray",
                        marginBottom: "30px",
                        display:"flex",
                        gap: 8
                    }}>
                        <BiHome style={{
                            fontSize:"20px",
                            color: "gray",
                            marginTop: "2px",
                        }}/>
                        Dashboard
                    </button >

                    <button style={{
                        color: "gray",
                        marginBottom: "30px",
                        display:"flex",
                        gap: 8
                    }}>
                        <BiFile style={{
                            fontSize:"20px",
                            color: "gray",
                            marginTop: "2px",
                        }}/>
                        Reports
                    </button>

                    <button style={{
                        color: "gray",
                        marginBottom: "30px",
                        display:"flex",
                        gap: 8
                    }}>
                        <BiBriefcase style={{
                            fontSize:"20px",
                            color: "gray",
                            marginTop: "2px",
                        }}/>
                        Manage Business
                    </button>

                </div>
                
            </div>
        </>
    )

}
export default Sidebar;