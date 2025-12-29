import React, {useState, useEffect} from "react";


function Header({style, getProlifeName}){

    const [profile, setProfile] = useState("");

    useEffect(()=>{
        setProfile(getProlifeName);
    },[getProlifeName])

    return(
    <>
        <div style={{
            backgroundColor: "white",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            // position:"relative",

            // padding: "0 20px",
            ...style
        }}>
            <div  style={{
                    position:"relative"
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
                <div style={{
                    position:"relative"
                }}>

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
                    marginTop: "-30px",
                    paddingLeft: "70vw"
                    
                }}>{profile}</p>
                </div>

            </div>
            </div>
            
        </div>
        
    </>
    )

}
export default Header;