import React, {useState, useEffect, useRef} from "react";
import "./loginSignUpInputStyles.css";
import { MdConfirmationNumber, MdEmail, MdKey, MdLock, MdPerson, MdPhone } from "react-icons/md";
import google from "./assets/google.png";
import designs from "./assets/design.png";
import { FaUser } from "react-icons/fa";
import { getDatabase, onValue, ref, set, get } from "firebase/database";
import { app, auth} from "./firebaseConfig.js"; // your firebaseConfig file
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    signInWithCredential,
    signInWithPopup,
    signInWithEmailAndPassword,
    sendEmailVerification,
    reload 
} from "firebase/auth";
import { useGoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";




function LoginSignup({sendCameraSignal, sendProfile}) {

    const db = getDatabase(app);

    const loginInputFields=[{name: "Email-address", type:"text", key: "email"},
                    {name: "Password", type:"password", key: "password"},
                ]

    const signupInputFields=[{name: "Restaurant name", type:"text", key: "fullname"},
                    {name: "Email-address", type:"text", key: "email"},
                    {name: "Contact", type:"number", key: "contact"},
                    {name: "Password", type:"password", key: "password"},
                    {name: "Confirm password", type:"password", key: "confirm"},
                ]

    const [loginData, setLoginData] = useState({});
    const [signupData, setSignupData] = useState({});
    const [signup, setSignup] = useState(true);
    const [feedback, setFeedBack] = useState();
    const [loading, setLoading] = useState(false);
    const slideAnim = useRef(null);
    const [visible, setVisible] = useState(false);
    const [doReload, setDoReload] = useState(false);
    // const [forgottenActivate, setForgottenActivate] = useState(false);
    // const [retrievalEmail, setRetrievalEmail] = useState(false);
    // const [isforgottenEmailSent, setIsForgottenEmailSent] = useState(false);
    const [fullySignedUp, setFullySignedUp] = useState(null);
    const [idToken, setIdToken] = useState("");

    const [toastY, setToastY] = useState(-100); // starts off-screen


    useEffect(() => {
        if (!visible) return;

        // Slide in
        setToastY(20);

        const timer = setTimeout(() => {
            // Slide out
            setToastY(-100);
            // Hide after animation
            setTimeout(() => setVisible(false), 500); 
        }, 2000);

        return () => clearTimeout(timer);
    }, [visible]);




    const hasSpecial = /[^A-Za-z0-9]/.test(signupData?.password);
    const hasLetters = /[A-Za-z]/.test(signupData?.password);
    const hasDigits = /[0-9]/.test(signupData?.password);
    const isShort =  signupData?.password?.length >= 1 && signupData?.password?.length <= 7;
    const isMedium = signupData?.password?.length >= 8 && signupData?.password?.length <= 11;
    const isLong = signupData?.password?.length >= 12;


    const successFeedbacks = ["accountCreated", "correctLogs", "newGoogleSignUp", "googleAlreadyExists"];

    const isSuccess = successFeedbacks.includes(feedback);

    const handleSignupDetails = (field, value) =>{
        setSignupData(prev=>({
            ...prev,
            [field]: value
        }))
    }

    const handleLoginDetails = (field, value) =>{
        setLoginData(prev=>({
            ...prev,
            [field]: value
        }))
    }


    // const login = useGoogleLogin({
    // flow: "implicit",
    // onSuccess: async (tokenResponse) => {
    //     const response = await fetch(
    //     "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    //     {
    //         headers: {
    //         Authorization: `Bearer ${tokenResponse.access_token}`,
    //         },
    //     }
    //     );

    //     const userInfo = await response.json();
    //     console.log(userInfo);
    // },
    // });

    const handleGoogleSignIn = async () => {

        if(!signupData.fullname || !signupData.contact){
            console.log("Fill the restaurant name and contact fields only before proceeding");
            return;
        }


        const provider = new GoogleAuthProvider();
    

        try {
            const result = await signInWithPopup(auth, provider);

            const user = result.user;

            // Check if new user
            const { creationTime, lastSignInTime } = user.metadata;
            const isNewUser = new Date(creationTime).getTime() === new Date(lastSignInTime).getTime();

            const myemail = user.email;

            console.log("🎉 Signed in with Google!", myemail, "Is new user?", isNewUser);
            
            if (isNewUser) {
            setVisible(true);
            setFeedBack("newGoogleSignUp");
            await set(ref(db, `restaurants/${myemail.replace('.', ',')}`), {
                restaurantName: signupData.fullname,
                category: "",
                numberOfRatings: 0,
                sumOfRatings: 0,
                contact: signupData?.contact || ""
            })
            .then(() => console.log("✅ Data written to DB"))
            .catch(err => console.log("❌ Failed to write:", err));     
            
            sendCameraSignal(true);
            sendProfile(myemail);
            } else {

            get(ref(db, `restaurants/${myemail.replace(".",",")}`))
                .then(snapshot => {
                    if(!snapshot.exists()){
                        setFeedBack("wrongLogs");
                        console.log("❌ Email does not exists as restaurant");
                        return;
                    
                    }
                    else{
                        setVisible(true);
                        setFeedBack("googleAlreadyExists");
                        // setLogger(true);
                    }
                })
            // setVisible(true);
            // setFeedBack("googleAlreadyExists");
            // // setLogger(true);
            }

        } catch (error) {
            console.log("❌ Google sign-in error:", error);
            setVisible(true);
            setFeedBack("accountNotCreated");
        }
        };


    const checkVerification = () => {
        const interval = setInterval(async () => {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                                        clearInterval(interval); // stop polling

                    console.log("Verified!");
                    setVisible(true);
                    setFeedBack("accountCreated");
                    setLoading(false);
                    
                    // write to database
                    await set(ref(db, `restaurants/${signupData?.email.replace(".",",")}`), {
                        restaurantName: signupData?.fullname,
                        category: "",
                        numberOfRatings: 0,
                        sumOfRatings: 0,
                        contact: signupData?.contact || ""
                    });

                    clearInterval(interval); // stop polling
                }
            }
        }, 3000);

        // cleanup on component unmount
        return () => clearInterval(interval);
    }


    useEffect(()=>{
    checkVerification();
    console.log("hghghghgh")
    setDoReload(false);
    },[doReload])

    const handleSubmit = async () => {
        setLoading(true);
        if (signup === true){

            if(!signupData?.fullname 
                || !signupData?.email 
                || !signupData?.contact 
                || !signupData?.password
                || !signupData?.confirm
            ){
                console.log("Sign up fields not completed");
                return;

            }

            if (signupData.password !== signupData.confirm) {
                setVisible(true);
                setFeedBack("notMatch")
                console.log("❌ Passwords do not match");
                console.log(`hasSpecial: ${hasSpecial}`);
                console.log(`hasLetters: ${hasLetters}`);
                console.log(`hasDigits: ${hasDigits}`);          
                setLoading(false);
                return;
            }

        if (isShort){
            setVisible(true);
            setFeedBack("shortPassword")
            console.log("Password is short");
            setLoading(false);
            return;
        }

        if ((isMedium || isLong) && (!hasLetters || !hasDigits)) {
            setVisible(true);
            setFeedBack("notAccurate")
            console.log("Password does not have both special characters and digits");
            setLoading(false);
            return;
            }


        }
        signup ? (
            
            await createUserWithEmailAndPassword(auth, signupData?.email, signupData?.password)
            .then((userCredential)=>{
                    // get(ref(db, `restaurants/${signupData.email.replace(".",",")}`))
                    // .then(snapshot => {
                    //     if(snapshot.exists()){
                    //         console.log("✅ Email exists as restaurant");
                    //         return;
                    //     }
                    //     else{
                                sendEmailVerification(userCredential.user);
                                if(!auth.currentUser.emailVerified){
                                    console.log("Verify email");
                                    setDoReload(true);
                                    return;
                                }
                                // setVisible(true);
                                // setFeedBack("accountCreated");
                                // console.log("Account Created");
                                // setLoading(false);
                                // set(ref(db, `restaurants/${signupData?.email.replace(".",",")}`), {
                                // restaurantName: signupData?.fullname,
                                // category: "",
                                // numberOfRatings: 0,
                                // sumOfRatings: 0,
                                // contact: signupData?.contact || ""
                                // });
                                // sendCameraSignal(true);
                                // sendProfile(signupData.email);
                            
                    //     } 
                    // });
                    // setVisible(true);
                    // setFeedBack("accountCreated");
                    // console.log("Account Created");
                    // setLoading(false);
                    // set(ref(db, `restaurants/${signupData?.email.replace(".",",")}`), {
                    // restaurantName: signupData?.fullname,
                    // category: "",
                    // numberOfRatings: 0,
                    // sumOfRatings: 0,
                    // contact: signupData?.contact
                    // });
                    // // sendCameraSignal(true);
                    // // sendProfile(signupData.email);
            })
            .catch((err)=>{
                setVisible(true);
                setLoading(false);

                if(err.code === "auth/email-already-in-use"){
                    setFeedBack("emailAlreadyRegistered");
                    console.log("Email is already in use");
                } else {
                    setFeedBack("accountNotCreated");
                    console.log(`🚫 Error: ${err.message}`);
                }
                
            })
            
        
        )
        :
        (
            signInWithEmailAndPassword(auth, loginData?.email, loginData?.password)
            .then(()=>{
                if(fullySignedUp === false){
                    // sendCameraSignal(true);
                    // sendProfile(loginData.email);
                }
                else{

                    get(ref(db, `restaurants/${loginData?.email.replace(".",",")}`))
                        .then(snapshot => {
                            if(!snapshot.exists()){
                                setFeedBack("wrongLogs");
                                console.log("❌ Email does not exists as restaurant");
                                return;
                            }
                            else{
                                setFeedBack("correctLogs");
                                setVisible(true);
                                console.log("🎉🎉 Logged in");
                                // setLogger(true)
                                setLoading(false);
                            }
                        });
                    // setFeedBack("correctLogs");
                    // setVisible(true);
                    // console.log("🎉🎉 Logged in");
                    // // setLogger(true)
                    // setLoading(false);
                }
                // setFeedBack("correctLogs");
                // setVisible(true);
                // console.log("🎉🎉 Logged in");
                // setLoading(false);
            })
            .catch((err)=>{
                setFeedBack("wrongLogs");
                setVisible(true);
                console.log(`❌ Wrong password${err}`);
                setLoading(false);
            })
        )
    }




    // const handleEmail = (field, value) =>{
    //     setSignupData(prev=>({
    //         ...prev,
    //         [field]: value
    //     }))
    // }

    // const handleContact = (field, value) =>{
    //     setSignupData(prev=>({
    //         ...prev,
    //         [field]: value
    //     }))
    // }

    // const handlePassword = (field, value) =>{
    //     setSignupData(prev=>({
    //         ...prev,
    //         [field]: value
    //     }))
    // }

    // const handleConfrimPassword = (field, value) =>{
    //     setSignupData(prev=>({
    //         ...prev,
    //         [field]: value
    //     }))
    // }



  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(70, 180, 127, 1)",
        width: "100vw",
        height: "100vh",
      }}
    >

    {visible && (
    <div
        className="toast"
        style={{
            transform: `translateY(${toastY}px)`,
            transition: 'transform 0.5s ease',
        }}
    >

        {!isSuccess ? "❌" : "✅"}
        <label style={{
            marginLeft: "15px",
            marginTop: "2px",
        }}>
                    {feedback === "notMatch" ? "Password doesn't match" 
                    : feedback === "shortPassword" ? "Password too short"
                    : feedback === "notAccurate" ? "Password must have at least letter and digit" 
                    : feedback === "accountCreated" ? "Account created successfully"
                    : feedback === "correctLogs" ? "Logged in successfully"
                    : feedback === "wrongLogs" ? "Incorrect logins"
                    : feedback === "accountNotCreated" ? "Network error"
                    : feedback === "newGoogleSignUp" ? "Account created successfully"
                    : feedback === "googleAlreadyExists" ? "Logged in successfully"
                    : feedback === "passwordResetLinkSent" ? "Password reset not successful"
                    : feedback === "emailAlreadyRegistered" ? "Account already exists"
                    : null}
        </label>
    </div>
    )}




        
      {/* Top space / header */}
      <div
        style={{
          height: "40vh",
          position: "relative",
          display:"flex",
          justifyContent:"center"
        }}
      >

        <label style={{
            marginTop:"35px",
            fontSize: "80px",
            fontWeight:"bold",
            color:"white"
        }}
        
        >Unimart</label>
            <label style={{        
                position: "absolute",
                top: 70,
                // right: 76,
                color: "white",
                fontSize: 12,
                right: !signup ? 125 : 86}}>
            {signup ? "Already have an account?": "Don't have an account?"}</label>


            <div style={{
                position: "absolute",
                top: 62,
                right: 25,
                backgroundColor: "rgba(13, 150, 72, 0.39)",
                padding: 5,
                borderRadius: 5,
                alignItems: "center",
                width: !signup ? "90px" : "55px"}}>
                <button 
                onClick={()=>{
                    setSignup(!signup);
                    // setForgottenActivate(false);
                    // setIsForgottenEmailSent(false);

                }}
                >
                    <label style={{
                        color: "white",
                        fontSize: 13,
                        fontWeight: "bold",
                    }}>{signup ? "Sign in": "Get Started"}</label>
                </button>
            </div>
        <div style={{
            height: "590px",
            width: "610px",
            backgroundColor: "white",
            position: "absolute",
            left: "50%",
            bottom: "-400px",
            transform: "translateX(-50%)",
            borderRadius: "20px",
          }}>
        <div
          style={{
            height: "550px",
            width: "600px",
            backgroundColor: "white",
            position: "absolute",
            left: "50%",
            bottom: "-400px",
            transform: "translateX(-50%)",
            borderRadius: "20px",
            overflowY:"scroll",
            top:20
          }}
        >
            {signup === false ? <div style={{
                display: "flex",
                alignItems: "center",
                marginTop: "25px",
                flexDirection:"column"
            }}>
                <label style={{
                    fontSize: 28,
                    fontWeight: "bold"
                    }}>Welcome back</label>
                <label style={{
                    color: "#979595ff",
                    fontStyle: "italic"
                }}>Fill the form below</label>
                {loginInputFields.map((input, i)=>{
                    return( <div key={i}className="input-group"> 
                            <input 
                            placeholder=" " 
                            value={loginData ? loginData[input.key]||"" : ""}
                            onChange={(e)=>handleLoginDetails(input.key, e.target.value)}
                            type={input.type}
                            style={{
                                borderWidth: 1,
                                // paddingBottom: "20px"
                            }}
                            />

                            <label>{input.name}</label>
                            {input.key ==="email" ? 
                            <MdPerson  style={{
                                    position: "absolute",
                                    left: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize:"25px",
                                    color:"#a9a9a9ff"
                                }}/>
                                :
                            input.key ==="password" ? 
                            <MdLock  style={{
                                    position: "absolute",
                                    left: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize:"25px",
                                    color:"#a9a9a9ff"
                                }}/>
                                :
                            null}
                        </div>)

                        
                })}

                <label style={{
                    marginTop:"30px",
                    color: "#aba9a9ff",
                    fontWeight: "bold"
                }}
                
                >Forgot password?</label>

                <button 
                onClick={
                    ()=>handleSubmit()
                    // console.table(loginData)
                }
                style={{
                    backgroundColor:"rgba(70, 180, 127, 1)",
                    width: 450,
                    height: 50,
                    borderRadius: 10,
                    marginLeft: "20px",
                    fontWeight:"bold",
                    color:"white",
                    marginTop:"30px"
                }}>
                    Sign in
                </button>
                <div style={{
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center"
                }}>
                    <div style={{
                        borderWidth:1,
                        marginTop: "40px",
                        marginLeft:"25px",
                        width: "450px",
                        color:"#cac8c8ff"
                    }}/>

                    <label style={{
                        position:"absolute",
                        top: 425,
                        fontWeight:"bold",
                        backgroundColor:"white",
                        paddingLeft: "20px",
                        paddingRight: "20px"
                    }}
                    >Or sign in</label>
                </div>

                <button style={{
                    backgroundColor:"rgba(255, 255, 255, 1)",
                    width: 450,
                    height: 50,
                    borderRadius: 10,
                    marginLeft: "20px",
                    fontWeight:"bold",
                    color:"black",
                    marginTop:"30px",
                    borderColor: "#adacacff",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center", // or "flex-start" if you want text left-aligned
                    alignItems:"center",
                    gap: "10px",              // space between icon and text
                    borderWidth:1
               }}>
                    <img src={google}
                    style={{
                        width:"30px",
                        height:"30px",
                    }}
                    />
                    Google
                </button>
            </div>

            :

            <div style={{
                display: "flex",
                alignItems: "center",
                marginTop: "25px",
                flexDirection:"column"
            }}>
                <label style={{
                    fontSize: 28,
                    fontWeight: "bold"
                    }}>Wanna Get Your Business Started</label>
                <label style={{
                    color: "#979595ff",
                    fontStyle: "italic"
                }}>Fill the form below to register</label>

                    <div style={{
                        display: "flex",
                        flexDirection:"row",
                        position: "absolute",
                        right: 70,
                        bottom: 145,
                        gap: 3,
                    }}>
                        <div style={{
                            height: 5,
                            width: 18,
                            borderRadius: 5,
                            backgroundColor: isShort ? "red" : isMedium ? "gold" : isLong ? "rgba(108, 197, 7, 1)" : "#3562"}}>
                        </div>
                        <div style={{
                            height: 5,
                            width: 18,
                            borderRadius: 5,
                            backgroundColor: isMedium ? "gold" : isLong ? "rgba(108, 197, 7, 1)" : "#3562"}}>
                        </div>
                        <div style={{
                            height: 5,
                            width: 18,
                            borderRadius: 5,
                            backgroundColor: isLong ? "rgba(108, 197, 7, 1)" : "#3562"}}>
                        </div>
                    </div>
                {signupInputFields.map((input, i)=>{
                    return( <div key={i} className="input-group"> 
                            <input 
                            placeholder=" "
                            value = {signupData ? signupData[input.key] || "" : ""}
                            onChange={(e)=>handleSignupDetails(input.key,e.target.value)}
                            type={input.type}
                            style={{
                                borderWidth: 1,
                                        paddingRight: 80,

                                
                                // paddingBottom: "20px"
                            }}
                            />

                            <label>{input.name}</label>
                            { input.key === "fullname"?
                            <MdPerson  style={{
                                    position: "absolute",
                                    left: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize:"25px",
                                    color:"#a9a9a9ff"
                                }}/>
                                :
                            input.key ==="email" ? 
                            <MdEmail  style={{
                                    position: "absolute",
                                    left: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize:"25px",
                                    color:"#a9a9a9ff"
                                }}/>
                                :
                            input.key ==="contact" ? 
                            <MdPhone  style={{
                                    position: "absolute",
                                    left: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize:"25px",
                                    color:"#a9a9a9ff"
                                }}/>
                                :
                            input.key ==="password" ? 
                            <MdLock  style={{
                                    position: "absolute",
                                    left: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize:"25px",
                                    color:"#a9a9a9ff"
                                }}/>
                                :
                            input.key ==="confirm" ? 
                            <MdLock  style={{
                                    position: "absolute",
                                    left: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize:"25px",
                                    color:"#a9a9a9ff"
                                }}/>
                                :
                            null
                            
                            }
                        </div>)

                        
                })}



                <button 
                onClick={
                    ()=>handleSubmit()
                    // console.table(signupData)
                }           
                style={{
                    backgroundColor:"rgba(70, 180, 127, 1)",
                    width: 450,
                    height: 50,
                    borderRadius: 10,
                    marginLeft: "20px",
                    fontWeight:"bold",
                    color:"white",
                    marginTop:"30px"
                }}>
                    Sign up
                </button>
                <div style={{
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center"
                }}>
                    <div style={{
                        borderWidth:1,
                        marginTop: "40px",
                        marginLeft:"25px",
                        width: "450px",
                        color:"#cac8c8ff"
                    }}/>

                    <label style={{
                        position:"absolute",
                        top: 625,
                        fontWeight:"bold",
                        backgroundColor:"white",
                        paddingLeft: "20px",
                        paddingRight: "20px"
                    }}
                    >Or sign up with</label>
                </div>

                <button 
                onClick={() => handleGoogleSignIn()}
                style={{
                    backgroundColor:"rgba(255, 255, 255, 1)",
                    width: 450,
                    height: 50,
                    borderRadius: 10,
                    marginLeft: "20px",
                    fontWeight:"bold",
                    color:"black",
                    marginTop:"30px",
                    borderColor: "#adacacff",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center", // or "flex-start" if you want text left-aligned
                    alignItems:"center",
                    gap: "10px",              // space between icon and text
                    borderWidth:1,
                    marginBottom: "20px"
               }}>
                    <img src={google}
                    style={{
                        width:"30px",
                        height:"30px",
                    }}
                    />
                    Google
                </button>
                       
           

            </div>
}


        </div>
        </div>

      </div>

      {/* Bottom container */}
      <div
        style={{
          flex: 1,
        // display: "flex",
          backgroundColor: "#eee",
          borderTopLeftRadius: "40px",
          borderTopRightRadius: "40px",
        }}
      />
    </div>
  );
}

export default LoginSignup;
