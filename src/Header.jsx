import React, {useState, useEffect} from "react";
import "./design-system.css";
import { FaUserCircle } from "react-icons/fa";


function Header({style, getProlifeName}){

    const [profile, setProfile] = useState("");

    useEffect(()=>{
        setProfile(getProlifeName);
    },[getProlifeName])

    return(
        <div style={{
            backgroundColor: "white",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--um-line)",
            padding: "0 28px",
            ...style
        }}>
            <p style={{
                fontFamily: "var(--um-font-display)",
                fontWeight: 600,
                fontSize: "22px",
                color: "var(--um-ink)",
            }}>
                Dashboard
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaUserCircle style={{ fontSize: 22, color: "var(--um-ink-faint)" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--um-ink-soft)" }}>
                    {profile}
                </span>
            </div>
        </div>
    )

}
export default Header;
