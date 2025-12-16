import React, {useState, useRef} from "react";
import { IoAddCircle } from "react-icons/io5";
import jollof from "./assets/jollofFood.jpg";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { app } from "./firebaseConfig.js"; // your firebaseConfig file
import { getDatabase, onValue, ref, set } from "firebase/database";
// import { getDatabase, onValue, ref, set } from "firebase/database";
import "./inputStyle.css"
import supabase from "./supabaseClient";


function ManageBusiness({style}){

    const db = getDatabase(app);

    const fileInputRef = useRef(null);

    const inputFields=[{name: "Food name", type:"text", key: "name"},
                       {name: "Price", type:"number", key: "price"},
                    ]

    const [addOns, setAddOns]= useState([{id: 0, field1: "Item", field2:"Price"}]);

    const [foodData, setFoodData] = useState({});
    const [inputAddOns, setInputAddOns] = useState([]);
    // const [file, setFile] = useState(null);
    const [fileURL, setFileURL] = useState(null);


    const handleFoodName = (field, value) => {
    setFoodData(prev => ({ 
        ...prev,      // keep existing fields
        [field]: value  // update the specific field dynamically
    }));
    };

    const handleFoodPrice = (field, value)=>{
        setFoodData((prev)=>({
            ...prev,
            [field] : value
        }))
    }
    
    const handleDialogue = ()=>{
        if(fileInputRef.current){
        fileInputRef.current.click();
        // console.log("ihahjhkahkjs")
        }
    }

    const handleFoodImage = (e)=>{
        const file = e.target.files[0];
        if(file){
        setFoodData((prev)=>({
            ...prev,  
            ["image"]: file
        }))}
    }

    const handleAddOnsChange = (id, field, value) => {
    setInputAddOns(prev => {
        // if id exists, update it
        if (prev.some(a => a.id === id)) {
        return prev.map(a => (a.id === id ? { ...a, [field]: value } : a));
        }
        // if id doesn't exist, add it
        return [...prev, { id, [field]: value }];
    });
    };

    const handleUpload = async (e) => {

        const file = e.target.files[0]; // 👈 use this

        const businessId = "umr123"

        if (!file) return;

        const nameOnly = file?.name.split(".")?.slice(0,-1).join("");
        const fileExt = file?.name?.split(".")?.pop();
        {console.log(`aaaa ${file}`)}
        const fileName = `${businessId}${nameOnly}.${fileExt}`;
        const filePath = `${fileName}`;


        const { data, error } = await supabase.storage
            .from("unimart-images")
            .upload(filePath, file, {
                    upsert: true
                });

        if (error) return console.error(error);

        const { data: url } = await supabase
            .storage
            .from("unimart-images")
            .getPublicUrl(filePath);

        console.log(url.publicUrl); // store this URL in your DB

        setFileURL(url.publicUrl)

        // setFoodData((prev)=>({
        //     ...prev,  
        //     ["image"]: publicUrl
        // }))
        
    };



    const [addOnLimit, setAddOnLimit] = useState(0);
    
    const [checked, setChecked] = useState(false);
    const [openPopUp, setOpenPopUp] = useState(false);
    
    const removeAddOn = (id) =>{
        setAddOns((prev) => prev.filter(addOns => addOns.id !== id))
    }


    const handleSubmit = ()=>{
        set(ref(db, `restaurants/Fosphag`), {
            foods: foodData,
            [foodData.name]: inputAddOns,
        })
    }

    return(
    <>
            <div
            style={{
                ...style
            }}
            >
                <div style={{
                    backgroundColor: "white",
                    width: "78vw",
                    height:"80vh",
                    borderRadius: "10px",
                }}>
                    <button 
                    onClick={()=>setOpenPopUp(true)}
                    style={{
                        margin: "20px",
                        borderColor: "rgba(219, 217, 217, 1)",
                        borderWidth: 2,
                        height: "22vh",
                        width: "10vw",
                        borderRadius: "10px",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",                    
                    }}>
                        <IoAddCircle style={{fontSize:"90px", color:"rgba(17, 153, 114, 1)"}}/>
                    </div>
                    </button>
                {openPopUp === true &&
                <div style={{
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
                        width: "46vw",
                        height: "72vh",
                        backgroundColor: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "20px",

                    }}>
                    <div style={{
                        width: "45vw",
                        height: "70vh",
                        backgroundColor: "white",
                        overflow: "scroll"

                        // position: "fixed",
                        // left: 450,
                        // top: 100,
                    }}>
                        <h1 style={{
                            margin: "20px",
                            fontSize: "30px",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>Add Item
                        <button
                            style={{
                                color: "#554f4fff"                                
                            }}
                            onClick={()=>setOpenPopUp(false)}
                        >
                            <IoMdClose />
                        </button>
                        
                        </h1>

                        
                        <button style={{
                            height: "15vh",
                            borderRadius:10 ,
                            marginLeft: "20px",
                            width: "42.5vw",
                            overflow:"hidden",
                            display: "flex",
                            alignItems:"center"

                        }}
                        onClick={()=>handleDialogue()}
                        >
                            <img src={foodData.image ? URL.createObjectURL(foodData.image) : null} alt="Cover Picture" style={{height:"50vh", width: "50vw"}}/>
                            {/* {handleFoodImage("image", jollof)} */}

                        </button>
                        <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleUpload}
                    />
                            <div style={{
                                display:"flex",
                                flexDirection: "row",
                                gap: 30,
                            }}>
                            {inputFields.map((input, i)=>{
                            return (<div key={i} className="input-group"> 
                            <input 
                            placeholder=" " 
                            name={input.name}
                            value={foodData[input.key] || ""}
                            onChange={(e)=>{input.key === "name" ?
                                handleFoodName(input.key,e.target.value) : 
                                input.key === "price" ?
                                handleFoodPrice(input.key,e.target.value) :
                                ""                           
                            }}
                            style={{
                                borderWidth: 1
                            }}
                            type={input.type}
                            />
                            {console.log(foodData)}
                            <label>{input.name}:</label>
                        </div>) 
                            })}

                            </div>


                            <div style={{
                                marginLeft:"20px",
                                marginTop: "15px",
                                backgroundColor: "#eee",
                                width: "42.5vw",
                                height: "5vh",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "5px",
                              
                            }}>
                                <label style={{
                                    display:"flex",
                                    gap: 10
                                }}>
                                    <input type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                        setChecked(e.target.checked);
                                        // console.log("Checked on:", e.target.checked);
                                    }}
                                    style={{marginLeft: "10px", transform: "scale(1.4)"}}
                                    />
                                    Add-Ons
                                </label>

                            </div>

                                {checked === true && <div>
                                    {/* {console.log("Add-Ons section is rendered, checked is:", checked)} */}
                                    {addOns.map((addOn)=>{
                                        return(
                                        <div
                                        key={addOn.id} 
                                        style={{
                                            display:"flex",
                                            flexDirection: "row",
                                            gap: 30,
                                        }}>
                                        <div className="input-group">
                                            <input placeholder=" "
                                            value={inputAddOns.find(item => item.id === addOn.id)?.name || ""}
                                            onChange={(e)=>handleAddOnsChange(addOn.id,"name",e.target.value)}
                                            />
                                            <label>{addOn.field1}</label>
                                         </div>

                                        <div className="input-group" style={{width:"110px"}}>
                                            <input placeholder=" "
                                            value={inputAddOns.find(item => item.id === addOn.id)?.price || ""}
                                            onChange={(e)=>handleAddOnsChange(addOn.id,"price",e.target.value)}
                                            />
                                            <label>{addOn.field2}</label>

                                         </div>
                                         {console.log(inputAddOns)}

                                            {/* <MdDelete style={{
                                                marginTop: "31px",
                                                fontSize: "26px",
                                                color: "red"
                                            }} /> */}
                                            <div style={{
                                            display:"flex",
                                            flexDirection: "row",
                                            gap: 15,
                                        }}>   
                                            <button
                                            onClick={()=>{
                                                
                                                setAddOnLimit((prev)=>prev+1)
                                                setAddOns((prev)=>
                                                [...prev,{id: addOnLimit+1,
                                                    field1:"Item", 
                                                    field2:"Price"}])   
                                                }}
                                                    
                                            >

                                                {/* {console.log(addOnLimit)} */}
                                                <IoAddCircle style={{
                                                        marginTop: "25px",
                                                        fontSize: "26px",
                                                        color: "green"
                                                    }} />       
                                            </button>
                                            <button onClick={()=>removeAddOn(addOn.id)}>                                                
                                                {addOn.id !== 0 && <MdDelete style={{
                                                    marginTop: "25px",
                                                    fontSize: "26px",
                                                    color: "red"
                                                }} />}
                                            </button>
                                            </div>                                                                              
                                        </div>
                                    )
                                    })}
                                    {/* {<div className="input-group">
                                        <input placeholder=" "/>
                                        <label>Item</label>
                                    </div>} */}
                                </div>}

                    </div>
                    </div>
                </div>}


                </div>


            </div>
    </>)

}
export default ManageBusiness;