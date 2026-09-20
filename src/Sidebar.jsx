import React, { useEffect, useRef, useState} from 'react';
import "./design-system.css";
import { BiFile, BiHome, BiSolidBriefcase, BiSolidFile, BiSolidHome, BiBriefcase } from "react-icons/bi";


function Sidebar({sendTabSignal}){

    const [buttonClicked, setButtonClicked] = useState({dashboard:true,
                                                        reports: false,
                                                        manage: false,
    })

    const navItems = [
        { key: "dashboard", label: "Dashboard", Icon: BiHome, SolidIcon: BiSolidHome },
        { key: "reports", label: "Reports", Icon: BiFile, SolidIcon: BiSolidFile },
        { key: "manage", label: "Manage Business", Icon: BiBriefcase, SolidIcon: BiSolidBriefcase },
    ];

    const selectTab = (key) => {
        setButtonClicked({
            dashboard: key === "dashboard",
            reports: key === "reports",
            manage: key === "manage",
        });
        sendTabSignal?.(key);
    };

    return(
        <div style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--um-pine-deep)",
            minHeight: "100vh",
            width: "260px",
            flexShrink: 0,
            padding: "28px 18px",
        }}>
            <div style={{
                paddingBottom: "22px",
                marginBottom: "24px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}>
                <span style={{
                    fontFamily: "var(--um-font-display)",
                    fontWeight: 700,
                    fontSize: "22px",
                    color: "white",
                    letterSpacing: "-0.01em",
                }}>
                    UniMart
                </span>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>Seller dashboard</div>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {navItems.map(({ key, label, Icon, SolidIcon }) => {
                    const active = buttonClicked[key];
                    const IconToRender = active ? SolidIcon : Icon;
                    return (
                        <button
                            key={key}
                            onClick={() => selectTab(key)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "11px 14px",
                                borderRadius: "10px",
                                fontSize: 14,
                                fontWeight: 600,
                                textAlign: "left",
                                color: active ? "white" : "rgba(255,255,255,0.62)",
                                backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                                transition: "background-color 0.15s ease, color 0.15s ease",
                            }}
                        >
                            <IconToRender style={{ fontSize: 18, flexShrink: 0 }} />
                            {label}
                        </button>
                    );
                })}
            </nav>
        </div>
    )

}
export default Sidebar;
