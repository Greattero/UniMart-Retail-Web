import React, {useState, useRef, useEffect} from "react";
import { IoAddCircle } from "react-icons/io5";
import jollof from "./assets/jollofFood.jpg";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { app } from "./firebaseConfig.js"; // your firebaseConfig file
import { getDatabase, set, ref, get, update, remove } from "firebase/database";
// import { getDatabase, onValue, ref, set } from "firebase/database";
import "./inputStyle.css"
import supabase from "./supabaseClient";
import { FaRegImage } from "react-icons/fa";
import { snapshotEqual } from "firebase/firestore/lite";



function ManageBusiness({style, getSeller, getBusinessType, getNameofBusiness}){

    const [seller, setSeller] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [businessName, setBusinessName] = useState("");

    useEffect(()=>{
        setSeller(getSeller);
    },[getSeller])

    useEffect(()=>{
        setBusinessType(getBusinessType);
    },[getBusinessType])

    useEffect(()=>{
        setBusinessName(getNameofBusiness);
    },[getNameofBusiness])

    // console.log("whhh",businessType);

                // console.log("kiiiii",businessName);


    const db = getDatabase(app);

    const businessRef = businessType==="restaurant" ? 
                        ref(db, `restaurants/${seller}`)
                        :
                        ref(db, `shops/${seller}`);

    const [ownerMenu, setOwnerMenu] = useState(null);
    const [loader, setLoader] = useState(false);
    const [selectedEditItem, setSelectedEditItem] = useState(false);
    const [removeLoader, setRemoveLoader] = useState(false);
    const [editImage, setEditImage] = useState("");
    const [removedFood, setRemovedFood] = useState("");
    const [oldRef, setOldRef] = useState("")

    get(businessRef).then((snapshot)=>{

        const data = snapshot.val() || {};

        const businessItems = businessType==="restaurant" ? data.foods || [] : data.items || [];

        const itemsArray = businessItems.map(item => ({
        name: item.name,
        price: item.price,
        image: item.image,
        }));

        // console.log(foodsArray);

        setOwnerMenu(itemsArray);
    })



    const fileInputRef = useRef(null);

    const inputFields=[{name: "Item name", type:"text", key: "name"},
                       {name: "Price", type:"number", key: "price"},
                    ]

    const [addOns, setAddOns]= useState([{id: 0, field1: "Item", field2:"Price"}]);

    const [itemData, setItemData] = useState({});
    const [inputAddOns, setInputAddOns] = useState([]);
    const [fileURL, setFileURL] = useState(null);
    const [file,setFile] = useState(null);
    const [foodCategoryType, setFoodCategoryType] = useState({rice: false,
        staple: false,
        snackies: false
    });
    const [stuffCategoryType, setStuffCategoryType] = useState({fashion: false,
        books: false,
        cosmetics: false,
        electronics: false,
        others: false,
    });
    const [selectedCategory, setSelectedCatergory] = useState(null);


    const handleItemName = (field, value) => {
    setItemData(prev => ({ 
        ...prev,      // keep existing fields
        [field]: value  // update the specific field dynamically
    }));
    };

    const handleItemPrice = (field, value)=>{
        setItemData((prev)=>({
            ...prev,
            [field] : Number(value)
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
        setItemData((prev)=>({
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


    const handleEdit = (item)=>{
        const itemRef = ref(db,`${businessType==="restaurant" ? "restaurants" : "shops"}/${seller}/${businessType==="restaurant"?"foods":"items"}`);
        const addOnsRef = ref(db,`${businessType==="restaurant" ? "restaurants" : "shops"}/${seller}/${item}`);
        const categoryRef = ref(db, `${businessType==="restaurant" ? "restaurants" : "shops"}/${seller}/category`);

        setOldRef(item);
        // console.log(item);
        // console.log(itemRef)


        get(itemRef).then((snapshot) =>{

            const foodList = snapshot.val() || {};
            console.log(foodList);


            const selectedFood = foodList?.find(myItem => myItem.name === `${item}`);
            console.log("sjkhkjah", selectedFood)
            setItemData(selectedFood);
            setFileURL(selectedFood.image);
            // console.log("jsjsjhjhsjhs");

            

            console.log(`rrrrr: ${item}`)

            console.log(`qqqqq: ${foodList}`)


        });

        get(addOnsRef).then((snapshot)=>{
            const addOnData = snapshot.val() || {};

            const toBeEdittedAddOn = Object.values(addOnData);
            // console.table(toBeEdittedAddOn);


            setInputAddOns(toBeEdittedAddOn);  
            
            const numberOfAddOns = toBeEdittedAddOn.length;


            setAddOnLimit(Math.max(0,numberOfAddOns-1));
            console.log(`ffffff: ${numberOfAddOns}`);

            const list = Array.from({length: numberOfAddOns},(_,i) =>({
                id: i,
                field1: "Item",
                field2: "Price",
            }));

            setAddOns(list);

        })

        get(categoryRef).then((snapshot)=>{

            const data = snapshot.val() || "";

            businessType==="restaurant" ?
            setFoodCategoryType((prev) =>({
                    rice: data === "rice" ? true : false,
                    staple: data === "staple" ? true : false,
                    snackies: data === "snackies" ? true : false
                }))
                :
            setStuffCategoryType((prev)=> ({
                fashion: data === "fashion" ? true : false,
                books: data === "books" ? true : false,
                cosmetics: data === "cosmetics" ? true : false,
                electronics: data === "electronics" ? true : false,
                others: data === "others" ? true : false,

            }))
            
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

        setItemData((prev)=>({
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

        const itemRef = ref(db,`${businessType==="restaurant" ? "restaurants" : "shops"}/${seller}/${businessType==="restaurant"?"foods":"items"}`);

        const itemDisplayRef = ref(db,(`${businessType==="restaurant"? "foodDisplay":"shopDisplay"}/${selectedCategory}`))

        get(itemRef).then((snapshot)=>{
            const data = snapshot.val() || [];
            const filteredFoods = data.filter(f => f.name !== removedFood)

            //remove from foods
            update(ref(db, `${businessType==="restaurant" ? "restaurants" : "shops"}/${seller}`),{
                    foods: filteredFoods
            })
                .then(()=>{
                    // setRemoveLoader(false);
                    console.log("Removed from items successfully");
                })
                .catch((err)=>{
                    // setRemoveLoader(false);
                    console.log(`Remove items failed: ${err}`)
                });

            //remove the foodAddons
            remove(ref(db,`${businessType==="restaurant" ? "restaurants" : "shops"}/${seller}/${removedFood}`))
                .then(()=>{
                    // setSelectedEditItem(false);
                    // setSelectedCatergory(null);
                    // setRemoveLoader(false);
                    // setItemData({});
                    // setInputAddOns([]);
                    // setFileURL(null);
                    // setChecked({addOns: false,
                    //     category: false
                    // });
                    // setStuffCategoryType((prev) =>({
                    //     fashion: false,
                    //     books: false,
                    //     cosmetics: false,
                    //     electronics: false,
                    //     others: false,
                    //     }))
                    // setFoodCategoryType((prev) =>({
                    //     rice: false,
                    //     staple: false,
                    //     snackies: false
                    // }))
                    // setAddOns([{id: 0, field1: "Item", field2:"Price"}]);
                    // setFileURL(null);
                    // setFile(null);
                    console.log("Removed from addons successfully");
                })
                .catch((err)=>{
                    // setRemoveLoader(false);
                    console.log(`Remove addons failed: ${err}`)
                });

            // remove from foodDisplay


        })

        get(itemDisplayRef).then((snapshot)=>{

            const data = snapshot.val() || [];
            const filteredFoods = data.filter(f => f.name !== removedFood)

            set(itemDisplayRef, filteredFoods)
            .then(()=>{
                    setSelectedEditItem(false);
                    setSelectedCatergory(null);
                    setItemData({});
                    setInputAddOns([]);
                    setFileURL(null);
                    setChecked({addOns: false,
                        category: false
                    });
                    setStuffCategoryType((prev) =>({
                        fashion: false,
                        books: false,
                        cosmetics: false,
                        electronics: false,
                        others: false,
                        }))
                    setFoodCategoryType((prev) =>({
                        rice: false,
                        staple: false,
                        snackies: false
                    }))
                    setAddOns([{id: 0, field1: "Item", field2:"Price"}]);
                    setFileURL(null);
                    setFile(null);
                    setRemoveLoader(false);
                    console.log("Removed from foodDisplaySUccessful")

            })
                .catch((err)=>{
                    setRemoveLoader(false);
                    console.log(`Remove foodDisplay failed: ${err}`)
                });
        })
        
    }


    const showSkeletonView =
    // selectedEditItem &&
    inputAddOns.length === 0 &&
    fileURL===null &&
    selectedCategory === null ;

    // console.log("wwww: ", showSkeletonView, "sss", selectedEditItem)



    const handleSubmit = ()=>{
        if(Object.keys(itemData).length === 0 || inputAddOns.length === 0 || fileURL === null ||  selectedCategory === null){
            console.log("Fields not filled totally");
            return
        }

        setLoader(true)

        // Insert in restaurant 
        if(businessType === "restaurant"){
            get(ref(db, `restaurants/${seller}/foods`)).then(snapshot => {
            const existing = snapshot.val() || [];
            const updatedItems = selectedEditItem === false ? [...existing, itemData] : existing.map(
                f => f.name === oldRef ?
                {...f, ...itemData}
                : f
            );

            update(ref(db, `restaurants/${seller}`), {
                foods: updatedItems,
                [itemData.name]: inputAddOns,
                category: selectedCategory,
            })
            .then(()=>{
                if (selectedEditItem && oldRef !== itemData.name) {
                remove(ref(db, `restaurants/${seller}/${oldRef}`));
                }
                console.log("Stored in firebase successfully")
                setItemData({});
                setInputAddOns([]);
                setFileURL(null);
                setSelectedEditItem(false);
                setSelectedCatergory(null);
                setChecked({addOns: false,
                    category: false
                });
                setAddOns([{id: 0, field1: "Item", field2:"Price"}]);
                // setFileURL(null);
                setFile(null);
                    setStuffCategoryType((prev) =>({
                        fashion: false,
                        books: false,
                        cosmetics: false,
                        electronics: false,
                        others: false,
                        }))
                    setFoodCategoryType((prev) =>({
                        rice: false,
                        staple: false,
                        snackies: false
                    }))
            })
            .catch((err)=>{
                console.log(`err ${err}`)
            })      
            ;
            console.log("Submitted❤️❤️");


            //Insert in Food Display

            get(ref(db, `foodDisplay/${selectedCategory}`)).then(snapshot => {
            const existing = snapshot.val() || [];
            const itemWithBusiness = {
            ...itemData,
            restaurantName: businessName,
            sellerName: seller,
            };
            const updatedItems = selectedEditItem===false ? [...existing, itemWithBusiness] : existing.map(
                f => f.name === oldRef && f.restaurantName ===businessName ? {
                    ...f, ...itemWithBusiness
                } : f
            
            );
            console.log(businessName);

            update(ref(db, `foodDisplay`), {
                [selectedCategory]: updatedItems,
                // restaurantName : businessName
            })
            .then(()=>{
                // if (selectedEditItem &&  && oldRef !== itemData.name) {
                // remove(ref(db, `restaurants/${seller}/${oldRef}`));
                // }
                console.log(`Stored in ${selectedCategory} successfully`)
                setSelectedCatergory(null);
                setLoader(false);
            })
            .catch((err)=>{
                console.log(`err ${err}`)
                setLoader(false);

            });
            
            });

            });
        }

    else{

        //Insert in Shop
        get(ref(db, `shops/${seller}/items`)).then(snapshot => {
        const existing = snapshot.val() || [];
        const updatedItems = selectedEditItem === false ? [...existing, itemData] : existing.map(
            f => f.name === oldRef ?
            {...f, ...itemData}
            : f
        );
        update(ref(db, `shops/${seller}`), {
            items: updatedItems,
            [itemData.name]: inputAddOns,
            category: selectedCategory
        })
        .then(()=>{
            if (selectedEditItem && oldRef !== itemData.name) {
            remove(ref(db, `shops/${seller}/${oldRef}`));
            }
            console.log("Stored in firebase successfully")
            setItemData({});
            setInputAddOns([]);
            setFileURL(null);
            setSelectedEditItem(false);
            setSelectedCatergory(null);
            setChecked({addOns: false,
                category: false
            });
            setAddOns([{id: 0, field1: "Item", field2:"Price"}]);
            setFileURL(null);
            setFile(null);
            setStuffCategoryType((prev) =>({
                fashion: false,
                books: false,
                cosmetics: false,
                electronics: false,
                others: false,
                }))
            setFoodCategoryType((prev) =>({
                rice: false,
                staple: false,
                snackies: false
            }))
        })
        .catch((err)=>{
            console.log(`err ${err}`)
        })      
        ;
        console.log("Submitted❤️❤️");
        });

        //Insert into Shop Display
        get(ref(db, `shopDisplay`)).then(snapshot => {
        const existing = snapshot.val() || [];
        const itemWithBusiness = {
        ...itemData,
        shopName: seller,
        category: selectedCategory
        };
        const updatedItems = selectedEditItem===false ? [...existing, itemWithBusiness] : existing.map(
            f => f.name === oldRef && f.shopName ===seller ? {
                ...f, ...itemWithBusiness
            } : f
        
        );

        update(ref(db), {
            shopDisplay: updatedItems,
            // shopName : seller
        })
        .then(()=>{
            // if (selectedEditItem &&  && oldRef !== itemData.name) {
            // remove(ref(db, `restaurants/${seller}/${oldRef}`));
            // }
            console.log(`Stored in ${selectedCategory} successfully`)
            setSelectedCatergory(null);
            setLoader(false);
        })
        .catch((err)=>{
            console.log(`err ${err}`)
            setLoader(false);

        });
        
        });}
        // update(ref(db, `foodDisplay/${selectedCategory}`), {
        //     shopName : seller
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
                <h1 style={{
                    paddingBottom: "10px",
                    fontSize: "25px",
                    fontWeight:"bold"
                }}>

                    
                    My Menu
                </h1>

                
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
                        height: "160px",
                        width: "160px",
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
                        setSelectedEditItem(true);
                        setOpenPopUp(true);     
                        handleEdit(name);
                        setRemovedFood(name);               
                    }}
                    style={{
                        margin: "20px",
                        borderColor: "rgba(219, 217, 217, 1)",
                        borderWidth: 2,
                        height: "160px",
                        width: "160px",
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
                            height:"105px",
                            width:"160px",
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
                        overflowY: "scroll"

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
                                setSelectedEditItem(false);
                                setSelectedCatergory(null);
                                setOpenPopUp(false);
                                setItemData({});
                                setInputAddOns([]);
                                setAddOnLimit(0);
                                setFileURL(null);
                                setFile(null)
                                setChecked({addOns: false,
                                    category: false
                                });
                                setAddOns([{id: 0, field1: "Item", field2:"Price"}]);
                                setStuffCategoryType((prev) =>({
                                    fashion: false,
                                    books: false,
                                    cosmetics: false,
                                    electronics: false,
                                    others: false,
                                    }))
                                setFoodCategoryType((prev) =>({
                                    rice: false,
                                    staple: false,
                                    snackies: false
                                }))
                            }}
                        >
                            <IoMdClose />
                        </button>
                        
                        </h1>

                        
                        { selectedEditItem===true&&showSkeletonView ? 
                        <>
                        {/* {console.log("Seee:",showSkeletonView)} */}
                            <div className="addItemPicSkeleton"/> 
                            <div style={{
                                display:"flex",
                                flexDirection: "row",
                            }}>
                                <div className="addItemFoodNameSkeleton"/> 
                                <div className="addItemFoodPriceSkeleton"/>
                            </div>
                            <div className="addItemAddOnDropdownSkeleton"/> 
                            <div style={{
                                display:"flex",
                                flexDirection: "row",
                            }}>
                                <div className="addItemAddOnNameSkeleton"/>
                                <div className="addItemAddOnPriceSkeleton"/> 
                                <div className="addItemAddNewFieldSkeleton"/> 

                            </div>
                        </>

                            :
                            <>
                                                    {/* {console.log("Seee:",showSkeletonView)} */}

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
                            value={itemData ? itemData[input.key] || "" : ""}
                            onChange={(e)=>{input.key === "name" ?
                                handleItemName(input.key,e.target.value) : 
                                input.key === "price" ?
                                handleItemPrice(input.key,e.target.value) :
                                ""                           
                            }}
                            style={{
                                borderWidth: 1
                            }}
                            type={input.type}
                            />
                            {/* {console.log(itemData)} */}
                            <label>{input.name}:</label>
                        </div>) 
                            })}

                            </div>


                           {!selectedEditItem && <div style={{
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

                            </div>}

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
                                            {
                                                businessType ==="restaurant" ?
                                                <>
                                            <button 
                                            onClick={()=>{setFoodCategoryType((prev) =>({
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
                                                borderColor: foodCategoryType.rice === true ? "green" : "#c2bfbfff",
                                                color: foodCategoryType.rice === true ? "green":"#848383ff",
                                                backgroundColor: foodCategoryType.rice === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: foodCategoryType.rice === true ? "bold" : null
                                            }}>
                                                Rice Dish
                                            </button>

                                            <button 
                                            onClick={()=>{setFoodCategoryType((prev) =>({
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
                                                borderColor: foodCategoryType.staple === true ? "green" : "#c2bfbfff",
                                                color: foodCategoryType.staple === true ? "green":"#848383ff",
                                                backgroundColor: foodCategoryType.staple === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: foodCategoryType.staple === true ? "bold" : null
                                            }}>
                                                {"Staple Dish (Local)"}
                                            </button>

                                            <button 
                                            onClick={()=>{setFoodCategoryType((prev) =>({
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
                                                borderColor: foodCategoryType.snackies === true ? "green" : "#c2bfbfff",
                                                color: foodCategoryType.snackies === true ? "green":"#848383ff",
                                                backgroundColor: foodCategoryType.snackies === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: foodCategoryType.snackies === true ? "bold" : null
                                            }}>
                                                Snackies
                                            </button>
                                            </>
                                                :
                                                <>

                                                <button 
                                                    onClick={()=>{setStuffCategoryType((prev) =>({fashion: true,
                                                                books: false,
                                                                cosmetics: false,
                                                                electronics: false,
                                                                others: false,
                                                            }));
                                                    setSelectedCatergory("books");
                                                    }}
                                                    style={{
                                                        height:"5vh",
                                                        width:"10vw",
                                                        borderRadius:"5px",
                                                        borderWidth: 2,
                                                        borderColor: stuffCategoryType.fashion === true ? "green" : "#c2bfbfff",
                                                        color: stuffCategoryType.fashion === true ? "green":"#848383ff",
                                                        backgroundColor: stuffCategoryType.fashion === true ? "rgba(32, 145, 96, 0.22)": null,
                                                        fontWeight: stuffCategoryType.fashion === true ? "bold" : null
                                                    }}>
                                                        Fashion
                                            </button>


                                                <button 
                                            onClick={()=>{setStuffCategoryType((prev) =>({fashion: false,
                                                        books: true,
                                                        cosmetics: false,
                                                        electronics: false,
                                                        others: false,
                                                    }));
                                            setSelectedCatergory("books");
                                            }}
                                            style={{
                                                height:"5vh",
                                                width:"10vw",
                                                borderRadius:"5px",
                                                borderWidth: 2,
                                                borderColor: stuffCategoryType.books === true ? "green" : "#c2bfbfff",
                                                color: stuffCategoryType.books === true ? "green":"#848383ff",
                                                backgroundColor: stuffCategoryType.books === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: stuffCategoryType.books === true ? "bold" : null
                                            }}>
                                                Books
                                            </button>

                                            <button 
                                            onClick={()=>{setStuffCategoryType((prev) =>({fashion: false,
                                                        books: false,
                                                        cosmetics: true,
                                                        electronics: false,
                                                        others: false,
                                                    }));
                                            setSelectedCatergory("cosmetics");

                                            }}
                                            style={{
                                                height:"5vh",
                                                width:"10vw",
                                                borderRadius:"5px",
                                                borderWidth: 2,
                                                borderColor: stuffCategoryType.cosmetics === true ? "green" : "#c2bfbfff",
                                                color: stuffCategoryType.cosmetics === true ? "green":"#848383ff",
                                                backgroundColor: stuffCategoryType.cosmetics === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: stuffCategoryType.cosmetics === true ? "bold" : null
                                            }}>
                                                {"Cosmetics"}
                                            </button>

                                            <button 
                                            onClick={()=>{setStuffCategoryType((prev) =>({fashion: false,
                                                        books: false,
                                                        cosmetics: false,
                                                        electronics: true,
                                                        others: false,
                                                    }));
                                            setSelectedCatergory("electronics");                                        
                                            }}
                                            style={{
                                                height:"5vh",
                                                width:"10vw",
                                                borderRadius:"5px",
                                                borderWidth: 2,
                                                borderColor: stuffCategoryType.electronics === true ? "green" : "#c2bfbfff",
                                                color: stuffCategoryType.electronics === true ? "green":"#848383ff",
                                                backgroundColor: stuffCategoryType.electronics === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: stuffCategoryType.electronics === true ? "bold" : null
                                            }}>
                                                Electronics
                                            </button>
                                            <button 
                                            onClick={()=>{setStuffCategoryType((prev) =>({fashion: false,
                                                        books: false,
                                                        cosmetics: false,
                                                        electronics: false,
                                                        others: true,
                                                    }));
                                            setSelectedCatergory("others");                                        
                                            }}
                                            style={{
                                                height:"5vh",
                                                width:"10vw",
                                                borderRadius:"5px",
                                                borderWidth: 2,
                                                borderColor: stuffCategoryType.others === true ? "green" : "#c2bfbfff",
                                                color: stuffCategoryType.others === true ? "green":"#848383ff",
                                                backgroundColor: stuffCategoryType.others === true ? "rgba(32, 145, 96, 0.22)": null,
                                                fontWeight: stuffCategoryType.others === true ? "bold" : null
                                            }}>
                                                Others
                                            </button>
                                            </>
                                            }
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
                                            onChange={(e)=>handleAddOnsChange(addOn.id,"price",Number(e.target.value))}
                                            />
                                            <label>{addOn.field2}</label>

                                         </div>
                                         {/* {console.log(addOn.id)} */}
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
                                            disabled={addOnLimit === 9 ? true : false}
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
                                    gap: selectedEditItem ? 10 : null
                                }}>
                                    <button 
                                    onClick={()=>handleSubmit()}
                                    style={{
                                        backgroundColor: "rgba(34, 136, 87, 1)",
                                        padding: "4px",
                                        color: "white",
                                        borderRadius: "5px",
                                        width: selectedEditItem=== true ? "6vw":"10vw"

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

                                    {selectedEditItem && <button 
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
                                <label style={{
                                    display:"flex",
                                    alignItems:"center",
                                    justifyContent:"center",
                                    color:"rgba(170, 170, 170, 1)",
                                    fontStyle:"italic"
                                }}>You can add up to 10 add-ons.</label>
                                
                                </>
                                }

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

//fix so that pics with the same name dont throw errors