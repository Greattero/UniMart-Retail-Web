import React, {useState} from "react";


function Header({style}){


    return(
    <>
        <div style={{
            backgroundColor: "white",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            // padding: "0 20px",
            ...style
        }}>
            <div style={{
                borderLeftWidth: 1,
                borderLeftColor: "rgba(220, 221, 226, 1)",
                height: "4.5vh",
                display: "flex",
                flexDirection: "row",
                paddingBottom: "40px",
                // alignItems: "center",
                justifyContent: "center",
            }}
            
            >

                <p style={{
                    // position:"absolute",
                    // left: 20,
                    // marginTop: 15,
                    fontWeight:"bold",
                    fontSize:"25px",
                    marginLeft:"20px"
                   

                }}>Dashboard</p>

                <p style={{
                    // position:"absolute",
                    // right: 10,
                    // marginTop: 15,
                    marginTop: "6px",
                    paddingLeft: "65vw"
                    
                }}>Jessica Mahunu</p>

            </div>
            
        </div>
        
    </>
    )

}
export default Header;