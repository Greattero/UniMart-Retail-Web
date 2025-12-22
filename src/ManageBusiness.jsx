import React, {useState, useRef} from "react";
import { IoAddCircle } from "react-icons/io5";
import jollof from "./assets/jollofFood.jpg";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { app } from "./firebaseConfig.js"; // your firebaseConfig file
import { getDatabase, onValue, ref, get, update, remove } from "firebase/database";
// import { getDatabase, onValue, ref, set } from "firebase/database";
import "./inputStyle.css"
import supabase from "./supabaseClient";
import { FaRegImage } from "react-icons/fa";
import { snapshotEqual } from "firebase/firestore/lite";



function ManageBusiness({style}){

    const db = getDatabase(app);

    const restaurantRef = ref(db, `restaurants/Fosphag`);

    const [ownerMenu, setOwnerMenu] = useState(null);
    const [loader, setLoader] = useState(false);
    const [selectedEditFood, setSelectedEditFood] = useState(false);
    const [removeLoader, setRemoveLoader] = useState(false);
    const [editImage, setEditImage] = useState("");
    const [removedFood, setRemovedFood] = useState("");

    get(restaurantRef).then((snapshot)=>{

        const data = snapshot.val() || {};

        const restaurantFoods = data.foods || [];

        const foodsArray = restaurantFoods.map(food => ({
        name: food.name,
        price: food.price,
        image: food.image,
        }));

        // console.log(foodsArray);

        setOwnerMenu(foodsArray);
    })



    const fileInputRef = useRef(null);

    const inputFields=[{name: "Food name", type:"text", key: "name"},
                       {name: "Price", type:"number", key: "price"},
                    ]

    const [addOns, setAddOns]= useState([{id: 0, field1: "Item", field2:"Price"}]);

    const [foodData, setFoodData] = useState({});
    const [inputAddOns, setInputAddOns] = useState([]);
    const [fileURL, setFileURL] = useState(null);
    const [file,setFile] = useState(null);
    const [categoryType, setCategoryType] = useState({rice: false,
        staple: false,
        snackies: false
    });
    const [selectedCategory, setSelectedCatergory] = useState(null);


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


    const handleEdit = (food)=>{
        const foodRef = ref(db,`restaurants/Fosphag/foods`);
        const addOnsRef = ref(db,`restaurants/Fosphag/${food}`);
        const categoryRef = ref(db, `restaurants/Fosphag/category`);


        get(foodRef).then((snapshot) =>{

            const foodList = snapshot.val() || {};

            const selectedFood = foodList?.find(item => item.name === `${food}`);

            setFoodData(selectedFood);
            setFileURL(selectedFood.image);

            

            console.log(`rrrrr: ${food}`)

            console.log(`qqqqq: ${foodList}`)


        });

        get(addOnsRef).then((snapshot)=>{
            const addOnData = snapshot.val() || {};

            const toBeEdittedAddOn = Object.values(addOnData);
            // console.table(toBeEdittedAddOn);


            setInputAddOns(toBeEdittedAddOn);  
            
            const numberOfAddOns = toBeEdittedAddOn.length;

            setAddOnLimit(numberOfAddOns);

            const list = Array.from({length: numberOfAddOns},(_,i) =>({
                id: i,
                field1: "Item",
                field2: "Price",
            }));

            setAddOns(list);

        })

        get(categoryRef).then((snapshot)=>{

            const data = snapshot.val() || "";


            setCategoryType((prev) =>({
                    rice: data === "rice" ? true : false,
                    staple: data === "staple" ? true : false,
                    snackies: data === "snackies" ? true : false
                }));
            
            setSelectedCatergory(data);



            console.log(data);
            
        })
    }

    const handleUpload = async (e) => {

        const file = e.target.files[0]; // 👈 use this

        setFile(file);

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

        setFoodData((prev)=>({
            ...prev,  
            ["image"]: url.publicUrl
        }));
        
    };



    const [addOnLimit, setAddOnLimit] = useState(0);
    
    const [checked, setChecked] = useState({addOns: false,
        category: false
    });
    const [openPopUp, setOpenPopUp] = useState(false);
    
    const removeAddOn = (id) => {
        setAddOns(prev =>
            prev
            .filter(a => a.id !== id)
            .map((a, i) => ({ ...a, id: i }))
        );

        setInputAddOns(prev =>
            prev
            .filter(a => a.id !== id)
            .map((a, i) => ({ ...a, id: i }))
        );
        };

    const removeFood = () =>{

        setRemoveLoader(true);

        const foodRef= ref(db,(`restaurants/Fosphag/foods`));

        const foodDisplayRef = ref(db,(`foodDisplay`))

        get(foodRef).then((snapshot)=>{
            const data = snapshot.val() || [];
            const filteredFoods = data.filter(f => f.name !== removedFood)

            //remove from foods
            update(ref(db, `restaurants/Fosphag`),{
                foods: filteredFoods
            })
                .then(()=>{
                    // setRemoveLoader(false);
                    console.log("Removed from foods successfully");
                })
                .catch((err)=>{
                    // setRemoveLoader(false);
                    console.log(`Remove food failed: ${err}`)
                });

            //remove the foodAddons
            remove(ref(db,`restaurants/Fosphag/${removedFood}`))
                .then(()=>{
                    setRemoveLoader(false);
                    setFoodData({});
                    setInputAddOns([]);
                    setFileURL(null);
                    setChecked({addOns: false,
                        category: false
                    });
                    setAddOns([{id: 0, field1: "Item", field2:"Price"}]);
                    setFileURL(null);
                    setFile(null);
                    console.log("Removed from addons successfully");
                })
                .catch((err)=>{
                    setRemoveLoader(false);
                    console.log(`Remove addons failed: ${err}`)
                });

            // remove from foodDisplay

        })
        
    }


    const handleSubmit = ()=>{
        if(Object.keys(foodData).length === 0 || inputAddOns.length === 0 || fileURL === null ||  selectedCategory === null){
            console.log("Fields not filled totally");
            return
        }

        setLoader(true)

        // Insert in restaurant
        get(ref(db, `restaurants/Fosphag/foods`)).then(snapshot => {
        const existing = snapshot.val() || [];
        const updatedFoods = [...existing, foodData];

        update(ref(db, `restaurants/Fosphag`), {
            foods: updatedFoods,
            [foodData.name]: inputAddOns,
            category: selectedCategory
        })
        .then(()=>{
            console.log("Stored in firebase successfully")
            setFoodData({});
            setInputAddOns([]);
            setFileURL(null);
            setChecked({addOns: false,
                category: false
            });
            setAddOns([{id: 0, field1: "Item", field2:"Price"}]);
            setFileURL(null);
            setFile(null);
        })
        .catch((err)=>{
            console.log(`err ${err}`)
        });
        console.log("Submitted❤️❤️");
        });

        //Insert in Food Display

        get(ref(db, `foodDisplay/${selectedCategory}`)).then(snapshot => {
        const existing = snapshot.val() || [];
        const foodWithRestaurant = {
        ...foodData,
        restaurantName: "Fosphag"
        };
        const updatedFoods = [...existing, foodWithRestaurant];

        update(ref(db, `foodDisplay`), {
            [selectedCategory]: updatedFoods,
            // restaurantName : "Fosphag"
        })
        .then(()=>{
            console.log(`Stored in ${selectedCategory} successfully`)
            setSelectedCatergory(null);
            setLoader(false);
        })
        .catch((err)=>{
            console.log(`err ${err}`)
            setLoader(false);

        });
        
        });

        // update(ref(db, `foodDisplay/${selectedCategory}`), {
        //     restaurantName : "Fosphag"
        // })
        // .then(()=>{
        //     console.log(`Stored in particular ${selectedCategory} successfully`)
        //     setSelectedCatergory(null);
        //     setLoader(false);
        // })
        // .catch((err)=>{
        //     console.log(`err ${err}`)
        // });
        
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
                    display: "flex",
                    flexWrap: "wrap",
                    columnGap: "5px",
                    // rowGap: "0px"
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
                        display:"flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <div style={{
                        // display: "flex",
                        // justifyContent: "center",                    
                    }}>
                        <IoAddCircle style={{fontSize:"90px", color:"rgba(17, 153, 114, 1)"}}/>
                    </div>
                    </button>
                    {/* {console.log(`www: ${ownerMenu}`)} */}

                    {ownerMenu === null ? 
                    <>
                        <div className="skeleton"
                        style={{
                            marginRight:"20px"
                        }}
                        />  
                        <div className="skeleton"
                        style={{
                            marginRight:"20px"
                        }}
                        />  
                        <div className="skeleton"
                        style={{
                            marginRight:"20px"
                        }}
                        />  
                    </>                  
                    :
                    ownerMenu?.map((food, i)=>{
                        return(
                    <button
                    className="editFood"
                    key={i}
                    onClick={()=>{
                        const name = food.name;       // use current food name
                        setSelectedEditFood(true);
                        setOpenPopUp(true);     
                        handleEdit(name);
                        setRemovedFood(name);               
                    }}
                    style={{
                        margin: "20px",
                        borderColor: "rgba(219, 217, 217, 1)",
                        borderWidth: 2,
                        height: "22vh",
                        width: "10vw",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "center",
                        // alignItems: "center",
                    }}>
                        <div  style={{
                            // display: "flex",
                            // flexDirection: "column"
                        }}>
                            <img src={food.image} style={{
                            height:"15vh",
                            width:"10vw",
                            borderTopLeftRadius: "5px",
                            borderTopRightRadius: "5px",
                        }}/>

                        <label style={{
                            display: "flex",
                            alignSelf: "flex-start",
                            marginTop: "2px",
                            fontWeight: "bold",
                            marginLeft: "7px"
                        }}> {food.name.length > 12 ? food.name.slice(0,12)+"...":food.name}</label>

                        <label style={{
                            display: "flex",
                            alignSelf: "flex-start",
                            marginLeft: "7px",
                            color: "red"
                        }}>
                            {`₵${food.price}`}
                        </label>
                        </div>
                        

                        {/* <IoAddCircle style={{fontSize:"90px", color:"rgba(17, 153, 114, 1)"}}/> */}
                    </button>
                        )
                    })}
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
                            onClick={()=>{
                                setOpenPopUp(false);
                                setFoodData({});
                                setInputAddOns([]);
                                setFileURL(null);
                                setChecked({addOns: false,
                                    category: false
                                });
                                setAddOns([{id: 0, field1: "Item", field2:"Price"}]);
                            }}
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
                            alignItems:"center",
                            border: "2px dashed #ccc",
                            justifyContent:"center"


                        }}
                        onClick={()=>handleDialogue()}
                        >
                            {file ? <img src={URL.createObjectURL(file)} alt="Cover Picture" style={{height:"50vh", width: "50vw"}}/> : fileURL ? 
                            <img src = {fileURL} alt="Cover Picture" style={{height:"50vh", width: "50vw"}}/> : 
                            <FaRegImage style={{
                                fontSize:"40px",
                                color:"#a6a5a5ff"
                            }}/>}
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
                            value={foodData ? foodData[input.key] || "" : ""}
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
                            {/* {console.log(foodData)} */}
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
                                    checked={checked.category}
                                    onChange={(e) => {
                                        setChecked(prev => ({
                                            ...prev,
                                            category: e.target.checked
                                            }));
                                        // console.log("Checked on:", e.target.checked);
                                    }}
                                    style={{marginLeft: "10px", transform: "scale(1.4)"}}
                                    />
                                    Category
                                </label>

                            </div>

                                {
                                    checked.category === true && 
                                    <div>
                                        <div style={{
                                            display: "flex",
                                            // height: "2vh",
                                            flexWrap:"wrap",
                                            marginLeft:"20px",
                                            marginTop:"15px",
                                            gap: 10
                                        }}>
                                            <button 
                                            onClick={()=>{setCategoryType((prev) =>({
                                                rice: true,
                                                staple: false,
                                                snackies: false
                                            }));
                                            setSelectedCatergory("rice");
                                            }}
                                            style={{
                                                height:"5vh",
                                                width:"10vw",
                                                borderRadius:"5px",
                                                borderWidth: 2,
                                                borderColor: categoryType.rice === true ? "green" : "#c2bfbfff",
                                                color: categoryType.rice === true ? "green":"#848383ff",
                                                backgroundColor: categoryType.rice === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: categoryType.rice === true ? "bold" : null
                                            }}>
                                                Rice Dish
                                            </button>

                                            <button 
                                            onClick={()=>{setCategoryType((prev) =>({
                                                rice: false,
                                                staple: true,
                                                snackies: false
                                            }));
                                            setSelectedCatergory("staple");

                                            }}
                                            style={{
                                                height:"5vh",
                                                width:"10vw",
                                                borderRadius:"5px",
                                                borderWidth: 2,
                                                borderColor: categoryType.staple === true ? "green" : "#c2bfbfff",
                                                color: categoryType.staple === true ? "green":"#848383ff",
                                                backgroundColor: categoryType.staple === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: categoryType.staple === true ? "bold" : null
                                            }}>
                                                {"Staple Dish (Local)"}
                                            </button>

                                            <button 
                                            onClick={()=>{setCategoryType((prev) =>({
                                                rice: false,
                                                staple: false,
                                                snackies: true
                                            }));
                                            setSelectedCatergory("snackies");                                        
                                            }}
                                            style={{
                                                height:"5vh",
                                                width:"10vw",
                                                borderRadius:"5px",
                                                borderWidth: 2,
                                                borderColor: categoryType.snackies === true ? "green" : "#c2bfbfff",
                                                color: categoryType.snackies === true ? "green":"#848383ff",
                                                backgroundColor: categoryType.snackies === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: categoryType.snackies === true ? "bold" : null
                                            }}>
                                                Snackies
                                            </button>
                                        </div>
                                        
                                    </div>
                                }


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
                                    checked={checked.addOns}
                                    onChange={(e) => {
                                        setChecked(prev => ({
                                            ...prev,
                                            addOns: e.target.checked
                                            }));
                                        // console.log("Checked on:", e.target.checked);
                                    }}
                                    style={{marginLeft: "10px", transform: "scale(1.4)"}}
                                    />
                                    Add-Ons
                                </label>

                            </div>


                                {checked.addOns === true && <div>
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
                                            value={inputAddOns.find(item => (item.id === addOn.id))?.name || ""}
                                            onChange={(e)=>handleAddOnsChange(addOn.id,"name",e.target.value)}
                                            />
                                            <label>{addOn.field1}</label>
                                         </div>

                                        <div className="input-group" style={{width:"110px"}}>
                                            <input placeholder=" "
                                            type="number"
                                            value={inputAddOns.find(item => item.id === addOn.id)?.price || ""}
                                            onChange={(e)=>handleAddOnsChange(addOn.id,"price",e.target.value)}
                                            />
                                            <label>{addOn.field2}</label>

                                         </div>
                                         {/* {console.table(inputAddOns)}
                                         {console.table(addOns)} */}

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

                                {/* {
                                    checked.category === true && 
                                    <div>
                                        <div style={{
                                            display: "flex",
                                            height: "20vh",
                                            flexWrap:"wrap"
                                        }}>
                                            <button style={{
                                                height:"5vh",
                                                borderRadius:"5px",
                                                borderWidth: 1,
                                            }}>
                                                Rice
                                            </button>
                                        </div>
                                        
                                    </div>
                                } */}

                                <div style={{
                                    display:"flex",
                                    alignItems: "flex-end",
                                    justifyContent: "flex-end",
                                    marginTop: checked.addOns?"25px":"35px",
                                    marginRight: "10px",
                                    marginBottom: "20px",
                                    gap: selectedEditFood ? 10 : null
                                }}>
                                    <button 
                                    onClick={()=>handleSubmit()}
                                    style={{
                                        backgroundColor: "rgba(34, 136, 87, 1)",
                                        padding: "4px",
                                        color: "white",
                                        borderRadius: "5px",
                                        width: selectedEditFood=== true ? "6vw":"10vw"

                                    }}>{ loader === false ? "Submit" 
                                        :
                                        <div style={{
                                            display:"flex",
                                            alignItems: "center",
                                            justifyContent:"center"
                                        }}>
                                            <div className="loaderSubmit"/>
                                        </div>}
                                    </button>

                                    {selectedEditFood && <button 
                                    onClick={()=>removeFood()}
                                    style={{
                                        backgroundColor: "rgba(201, 11, 11, 1)",
                                        padding: "4px",
                                        color: "white",
                                        borderRadius: "5px",
                                        width:"6vw"

                                    }}>
                                        { removeLoader === false ? "Remove" 
                                        :
                                        <div style={{
                                            display:"flex",
                                            alignItems: "center",
                                            justifyContent:"center"
                                        }}>
                                            <div className="loaderRemove"/>
                                        </div>}

                                    </button>}
                                </div>

                    </div>
                    </div>
                </div>}


                </div>


            </div>
    </>)

}
export default ManageBusiness;

//when i click on close in pop up, everything should clear or reset

// when an addon field is deleted let it affect the inputAddon itself

//add food category, make it a checkbox where when you click on it you'll see a dropdown box

// set limits for the addons to be only 10

// make sure that when an item is added it can be updated properly

// and no food should repeat itself

// when sending to fooddisplay, add the name of the restaurant, so that when you are deleting the resturant, you can delete it from foodDisplay easily..
// for the one above it has been done to add restaurant so remay be able to delete it easily

// when editing, make sure summision is to update or overwrite not create new