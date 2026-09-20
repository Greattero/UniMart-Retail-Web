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

    // Resizes and re-encodes an image client-side before upload — quality 0.8,
// capped at 1000px on the long edge. Keeps file sizes small (usually a few
// hundred KB instead of several MB from a phone camera) with no visible
// quality loss at the sizes we ever display images at.
const compressImage = (sourceFile, { maxWidth = 1000, quality = 0.8 } = {}) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("Canvas compression failed"));
                        return;
                    }
                    resolve(new File([blob], sourceFile.name, { type: "image/jpeg" }));
                }, "image/jpeg", quality);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(sourceFile);
    });
};

    const handleUpload = async (e) => {

        const rawFile = e.target.files[0]; // 👈 use this

        if (!rawFile) return;

        const businessId = "umr123"

        let file;
        try {
            file = await compressImage(rawFile, { maxWidth: 1000, quality: 0.8 });
        } catch (err) {
            console.log("Image compression failed, uploading original file:", err);
            file = rawFile;
        }

        setFile(file);

        const nameOnly = rawFile?.name.split(".")?.slice(0,-1).join("");
        const fileExt = "jpg"; // compressed output is always re-encoded as jpeg
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
                ...style,
                padding: "0 32px 32px"
            }}
            >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                    <h1 style={{
                        fontFamily: "var(--um-font-display)",
                        fontSize: "24px",
                        fontWeight: 600,
                        color: "var(--um-ink)",
                    }}>
                        My Menu
                    </h1>
                    <span style={{ fontSize: 13, color: "var(--um-ink-faint)" }}>
                        {ownerMenu === null ? "" : `${ownerMenu.length} item${ownerMenu.length === 1 ? "" : "s"}`}
                    </span>
                </div>

                <div className="um-card" style={{
                    minHeight: "80vh",
                    padding: "24px",
                }}>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                        gap: "18px",
                    }}>

                        <button
                        onClick={()=>setOpenPopUp(true)}
                        style={{
                            border: "2px dashed var(--um-line)",
                            borderRadius: "var(--um-radius-md)",
                            aspectRatio: "1 / 1",
                            display:"flex",
                            flexDirection: "column",
                            gap: 8,
                            justifyContent: "center",
                            alignItems: "center",
                            color: "var(--um-ink-faint)",
                            transition: "border-color 0.15s ease, color 0.15s ease",
                        }}
                        onMouseEnter={(e)=>{ e.currentTarget.style.borderColor = "var(--um-pine)"; e.currentTarget.style.color = "var(--um-pine)"; }}
                        onMouseLeave={(e)=>{ e.currentTarget.style.borderColor = "var(--um-line)"; e.currentTarget.style.color = "var(--um-ink-faint)"; }}
                        >
                            <IoAddCircle style={{fontSize:"44px"}}/>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Add item</span>
                        </button>

                        {ownerMenu === null ?
                        <>
                            <div className="skeleton" style={{ width: "100%", aspectRatio: "1 / 1", height: "auto" }} />
                            <div className="skeleton" style={{ width: "100%", aspectRatio: "1 / 1", height: "auto" }} />
                            <div className="skeleton" style={{ width: "100%", aspectRatio: "1 / 1", height: "auto" }} />
                        </>
                        :
                        ownerMenu?.map((food, i)=>{
                            return(
                        <button
                        key={i}
                        onClick={()=>{
                            const name = food.name;       // use current food name
                            setSelectedEditItem(true);
                            setOpenPopUp(true);     
                            handleEdit(name);
                            setRemovedFood(name);               
                        }}
                        className="um-card"
                        style={{
                            aspectRatio: "1 / 1",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            textAlign: "left",
                            boxShadow: "var(--um-shadow-sm)",
                            transition: "box-shadow 0.15s ease, transform 0.15s ease",
                        }}
                        onMouseEnter={(e)=>{ e.currentTarget.style.boxShadow = "var(--um-shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e)=>{ e.currentTarget.style.boxShadow = "var(--um-shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            <img src={food.image} style={{
                                width: "100%",
                                height: "62%",
                                objectFit: "cover",
                                flexShrink: 0,
                            }}/>

                            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--um-ink)" }}>
                                    {food.name.length > 12 ? food.name.slice(0,12)+"...":food.name}
                                </span>
                                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--um-pine-dark)" }}>
                                    {`₵${food.price}`}
                                </span>
                            </div>
                        </button>
                                )
                            })}
                    </div>

                {openPopUp === true &&
                <div style={{
                    position: "fixed",
                    top: 0,
                    left:0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(18, 38, 26, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000

                }}>
                    <div className="um-card" style={{
                        width: "min(560px, 92vw)",
                        maxHeight: "85vh",
                        boxShadow: "var(--um-shadow-lg)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "20px 24px",
                            borderBottom: "1px solid var(--um-line)",
                            flexShrink: 0,
                        }}>
                            <h1 style={{
                                fontFamily: "var(--um-font-display)",
                                fontSize: "20px",
                                fontWeight: 600,
                                color: "var(--um-ink)",
                            }}>{selectedEditItem ? "Edit Item" : "Add Item"}</h1>
                            <button
                                className="um-btn-ghost"
                                style={{ fontSize: 20 }}
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
                        </div>

                        <div className="um-scroll" style={{ overflowY: "auto", padding: "24px", flex: 1 }}>

                        { selectedEditItem===true&&showSkeletonView ? 
                        <>
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
                            <button style={{
                                height: "170px",
                                borderRadius: "var(--um-radius-md)",
                                width: "100%",
                                overflow:"hidden",
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                alignItems:"center",
                                justifyContent:"center",
                                border: "2px dashed var(--um-line)",
                                backgroundColor: "var(--um-line-soft)",
                                color: "var(--um-ink-faint)",
                            }}
                            onClick={()=>handleDialogue()}
                            >
                                {file ? <img src={URL.createObjectURL(file)} alt="Cover Picture" style={{height:"100%", width: "100%", objectFit: "cover"}}/> : fileURL ? 
                                <img src = {fileURL} alt="Cover Picture" style={{height:"100%", width: "100%", objectFit: "cover"}}/> : 
                                <>
                                    <FaRegImage style={{ fontSize:"32px" }}/>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>Click to upload a photo</span>
                                </>}
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
                                    gap: 16,
                                    marginTop: 18,
                                }}>
                                {inputFields.map((input, i)=>{
                                return (<div key={i} className="um-field" style={{ flex: 1 }}> 
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
                                style={{ paddingLeft: 14 }}
                                type={input.type}
                                />
                                <label style={{ left: 14 }}>{input.name}</label>
                            </div>) 
                                })}

                                </div>


                               {!selectedEditItem && <label style={{
                                    marginTop: "16px",
                                    backgroundColor: "var(--um-line-soft)",
                                    width: "100%",
                                    padding: "12px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    borderRadius: "var(--um-radius-sm)",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "var(--um-ink)",
                                    cursor: "pointer",
                                }}>
                                        <input type="checkbox"
                                        checked={checked.category}
                                        onChange={(e) => {
                                            setChecked(prev => ({
                                                ...prev,
                                                category: e.target.checked
                                                }));
                                        }}
                                        style={{ transform: "scale(1.2)" }}
                                        />
                                        Category
                                </label>}

                                    {
                                        checked.category === true && 
                                        <div style={{
                                            display: "flex",
                                            flexWrap:"wrap",
                                            marginTop:"12px",
                                            gap: 8
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
                                                    padding: "9px 16px",
                                                    borderRadius:"999px",
                                                    border: `1.5px solid ${foodCategoryType.rice ? "var(--um-pine)" : "var(--um-line)"}`,
                                                    color: foodCategoryType.rice ? "var(--um-pine-dark)":"var(--um-ink-soft)",
                                                    backgroundColor: foodCategoryType.rice ? "var(--um-pine-wash)": "transparent",
                                                    fontWeight: 600,
                                                    fontSize: 13,
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
                                                    padding: "9px 16px",
                                                    borderRadius:"999px",
                                                    border: `1.5px solid ${foodCategoryType.staple ? "var(--um-pine)" : "var(--um-line)"}`,
                                                    color: foodCategoryType.staple ? "var(--um-pine-dark)":"var(--um-ink-soft)",
                                                    backgroundColor: foodCategoryType.staple ? "var(--um-pine-wash)": "transparent",
                                                    fontWeight: 600,
                                                    fontSize: 13,
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
                                                    padding: "9px 16px",
                                                    borderRadius:"999px",
                                                    border: `1.5px solid ${foodCategoryType.snackies ? "var(--um-pine)" : "var(--um-line)"}`,
                                                    color: foodCategoryType.snackies ? "var(--um-pine-dark)":"var(--um-ink-soft)",
                                                    backgroundColor: foodCategoryType.snackies ? "var(--um-pine-wash)": "transparent",
                                                    fontWeight: 600,
                                                    fontSize: 13,
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
                                                            padding: "9px 16px",
                                                            borderRadius:"999px",
                                                            border: `1.5px solid ${stuffCategoryType.fashion ? "var(--um-pine)" : "var(--um-line)"}`,
                                                            color: stuffCategoryType.fashion ? "var(--um-pine-dark)":"var(--um-ink-soft)",
                                                            backgroundColor: stuffCategoryType.fashion ? "var(--um-pine-wash)": "transparent",
                                                            fontWeight: 600,
                                                            fontSize: 13,
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
                                                    padding: "9px 16px",
                                                    borderRadius:"999px",
                                                    border: `1.5px solid ${stuffCategoryType.books ? "var(--um-pine)" : "var(--um-line)"}`,
                                                    color: stuffCategoryType.books ? "var(--um-pine-dark)":"var(--um-ink-soft)",
                                                    backgroundColor: stuffCategoryType.books ? "var(--um-pine-wash)": "transparent",
                                                    fontWeight: 600,
                                                    fontSize: 13,
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
                                                    padding: "9px 16px",
                                                    borderRadius:"999px",
                                                    border: `1.5px solid ${stuffCategoryType.cosmetics ? "var(--um-pine)" : "var(--um-line)"}`,
                                                    color: stuffCategoryType.cosmetics ? "var(--um-pine-dark)":"var(--um-ink-soft)",
                                                    backgroundColor: stuffCategoryType.cosmetics ? "var(--um-pine-wash)": "transparent",
                                                    fontWeight: 600,
                                                    fontSize: 13,
                                                }}>
                                                    Cosmetics
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
                                                    padding: "9px 16px",
                                                    borderRadius:"999px",
                                                    border: `1.5px solid ${stuffCategoryType.electronics ? "var(--um-pine)" : "var(--um-line)"}`,
                                                    color: stuffCategoryType.electronics ? "var(--um-pine-dark)":"var(--um-ink-soft)",
                                                    backgroundColor: stuffCategoryType.electronics ? "var(--um-pine-wash)": "transparent",
                                                    fontWeight: 600,
                                                    fontSize: 13,
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
                                                    padding: "9px 16px",
                                                    borderRadius:"999px",
                                                    border: `1.5px solid ${stuffCategoryType.others ? "var(--um-pine)" : "var(--um-line)"}`,
                                                    color: stuffCategoryType.others ? "var(--um-pine-dark)":"var(--um-ink-soft)",
                                                    backgroundColor: stuffCategoryType.others ? "var(--um-pine-wash)": "transparent",
                                                    fontWeight: 600,
                                                    fontSize: 13,
                                                }}>
                                                    Others
                                                </button>
                                                </>
                                                }
                                        </div>
                                    }


                                <label style={{
                                    marginTop: "16px",
                                    backgroundColor: "var(--um-line-soft)",
                                    width: "100%",
                                    padding: "12px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    borderRadius: "var(--um-radius-sm)",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "var(--um-ink)",
                                    cursor: "pointer",
                                }}>
                                        <input type="checkbox"
                                        checked={checked.addOns}
                                        onChange={(e) => {
                                            setChecked(prev => ({
                                                ...prev,
                                                addOns: e.target.checked
                                                }));
                                        }}
                                        style={{ transform: "scale(1.2)" }}
                                        />
                                        Add-Ons
                                </label>


                                    {checked.addOns === true && <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                                        {addOns.map((addOn)=>{
                                            return(
                                            <div
                                            key={addOn.id} 
                                            style={{
                                                display:"flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 10,
                                            }}>
                                            <div className="um-field" style={{ flex: 1 }}>
                                                <input placeholder=" "
                                                value={inputAddOns.find(item => (item.id === addOn.id))?.name || ""}
                                                onChange={(e)=>handleAddOnsChange(addOn.id,"name",e.target.value)}
                                                style={{ paddingLeft: 14 }}
                                                />
                                                <label style={{ left: 14 }}>{addOn.field1}</label>
                                             </div>

                                            <div className="um-field" style={{width:"110px"}}>
                                                <input placeholder=" "
                                                type="number"
                                                value={inputAddOns.find(item => item.id === addOn.id)?.price || ""}
                                                onChange={(e)=>handleAddOnsChange(addOn.id,"price",Number(e.target.value))}
                                                style={{ paddingLeft: 14 }}
                                                />
                                                <label style={{ left: 14 }}>{addOn.field2}</label>

                                             </div>

                                                <div style={{
                                                display:"flex",
                                                alignItems: "center",
                                                gap: 4,
                                            }}>   
                                                <button
                                                className="um-btn-ghost"
                                                disabled={addOnLimit === 9 ? true : false}
                                                onClick={()=>{
                                                    
                                                    setAddOnLimit((prev)=>prev+1)
                                                    setAddOns((prev)=>
                                                    [...prev,{id: addOnLimit+1,
                                                        field1:"Item", 
                                                        field2:"Price"}])   
                                                    }}
                                                        
                                                >
                                                    <IoAddCircle style={{
                                                            fontSize: "22px",
                                                            color: "var(--um-pine)"
                                                        }} />       
                                                </button>
                                                <button className="um-btn-ghost" onClick={()=>removeAddOn(addOn.id)}>                                                
                                                    {addOn.id !== 0 && <MdDelete style={{
                                                        fontSize: "22px",
                                                        color: "var(--um-clay)"
                                                    }} />}
                                                </button>
                                                </div>                                                                              
                                            </div>                                        
                                        )
                                        })}
                                    </div>}

                                </>
                                }
                        </div>

                        { !(selectedEditItem===true&&showSkeletonView) &&
                        <div style={{
                            borderTop: "1px solid var(--um-line)",
                            padding: "16px 24px",
                            flexShrink: 0,
                        }}>
                            <div style={{
                                display:"flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 10,
                            }}>
                                {selectedEditItem && <button 
                                onClick={()=>removeFood()}
                                className="um-btn um-btn-danger"
                                style={{ minWidth: 96 }}
                                >
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

                                <button 
                                onClick={()=>handleSubmit()}
                                className="um-btn um-btn-primary"
                                style={{ minWidth: 96 }}
                                >{ loader === false ? "Submit" 
                                    :
                                    <div style={{
                                        display:"flex",
                                        alignItems: "center",
                                        justifyContent:"center"
                                    }}>
                                        <div className="loaderSubmit"/>
                                    </div>}
                                </button>
                            </div>
                            <p style={{
                                marginTop: "10px",
                                textAlign: "center",
                                color:"var(--um-ink-faint)",
                                fontStyle:"italic",
                                fontSize: 13,
                            }}>You can add up to 10 add-ons.</p>
                        </div>
                        }

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
