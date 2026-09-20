import React, {useState, useEffect, useRef} from "react";
import "./design-system.css";
import "./loginSignUpInputStyles.css";
import { MdEmail, MdLock, MdPerson, MdPhone } from "react-icons/md";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import google from "./assets/google.png";
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
    deleteUser,
    reload 
} from "firebase/auth";
import mail from "./assets/mail.png";
import { useGoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";

// Purely visual: which icon represents each field key. Not logic —
// just keeps the icon consistent wherever a key of this name appears,
// across both the login and signup field lists.
const FIELD_ICONS = {
    fullname: MdPerson,
    email: MdEmail,
    contact: MdPhone,
    password: MdLock,
    confirm: MdLock,
};

function LoginSignup({sendBusinessName, sendProfile, setLogger,sendBusinessType}) {

    const db = getDatabase(app);

    const loginInputFields=[{name: "Email-address", type:"text", key: "email"},
                    {name: "Password", type:"password", key: "password"},
                ]

    const signupInputFields=[{name: "Business name", type:"text", key: "fullname"},
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
    const [resendLinkLoading, setResendLinkLoading] = useState(false);
    const slideAnim = useRef(null);
    const [visible, setVisible] = useState(false);
    const [doReload, setDoReload] = useState(false);
    // const [forgottenActivate, setForgottenActivate] = useState(false);
    // const [retrievalEmail, setRetrievalEmail] = useState(false);
    const [isforgottenEmailSent, setIsForgottenEmailSent] = useState(false);
    const [fullySignedUp, setFullySignedUp] = useState(null);
    const [showVerifyPage, setShowVerifyPage] = useState(false);
    const [showResetLinkPage, setShowResetLinkPage] = useState(false);
    const isActivePage = showVerifyPage || showResetLinkPage;
    const [retrievalEmail, setRetrievalEmail] = useState("");
    const [moveToPartialForm, setMoveToPartialForm] = useState(false);


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

    const feedbackMessage =
        feedback === "notMatch" ? "Password doesn't match"
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
        : feedback === "fillRequiredFields" ? "Fill in business name and contact before continuing with Google"
        : null;

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

                       console.table(signupData) 

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

        if(signup === true && (!signupData?.fullname || !signupData?.contact || !signupData?.businessType)){
            setVisible(true);
            setFeedBack("fillRequiredFields");
            return;
        }


        const provider = new GoogleAuthProvider();
    

        try {
            const result = await signInWithPopup(auth, provider);

            const user = result.user;

            // Check if new user
            const { creationTime, lastSignInTime } = user.metadata;
            const isNewUser = new Date(creationTime).getTime() === new Date(lastSignInTime).getTime();

            const myemail = user?.email?.replace('.', ',');

            console.log("🎉 Signed in with Google!", myemail, "Is new user?", isNewUser);

            const restaurantSnap = await get(ref(db, `restaurants/${myemail}`));
            const shopSnap = await get(ref(db, `shops/${myemail}`));

            const userData = restaurantSnap.exists()
                ? restaurantSnap.val()
                : shopSnap.val();
            
            if (isNewUser) {

            if (signup === false) {
                await deleteUser(user);
                setFeedBack("wrongLogs");
                console.log("❌ Email doesnt have business");
                setLoading(false);
                return;
            }

            await set(ref(db, `${signupData.businessType === "restaurant"?"restaurants":"shops"}/${myemail}`), {
                [signupData.businessType === "restaurant"
                    ? "restaurantName"
                    : "shopName"
                ]: signupData.fullname,
                category: "",
                numberOfRatings: 0,
                sumOfRatings: 0,
                contact: signupData?.contact || "",
                businessType: signupData?.businessType
            })
            .then(() => console.log("✅ Data written to DB"))
            .catch(err => console.log("❌ Failed to write:", err));  
            
            setVisible(true);
            setFeedBack("newGoogleSignUp");   
            // sendCameraSignal(true);
            sendProfile(myemail);
            sendBusinessName(signupData?.fullname);
            sendBusinessType(signupData?.businessType);
            setLogger(true);
            } else {

                    if (!restaurantSnap.exists() && !shopSnap.exists()) {
                        setFeedBack("wrongLogs");
                        console.log("❌ Email does not exist");
                        setLoading(false);
                        return;
                    }
                    else{
                        const data = userData || "";

                        // const myemail = loginData?.email.replace(".",",");
                        setVisible(true);
                        setFeedBack("googleAlreadyExists");
                        sendProfile(myemail);
                        sendBusinessName(data?.businessType==="restaurant" ? data?.restaurantName : data?.shopName);
                        sendBusinessType(data?.businessType);
                        setLogger(true);
                    }

            }

        } catch (error) {
            const user = auth.currentUser
            if(user){
                await deleteUser(user);
            }
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

                    const myemail = signupData?.email?.replace(".",",");
                    
                    if (!myemail) return;

                    // write to database
                    await set(ref(db, `${signupData.businessType === "restaurant"?"restaurants":"shops"}/${myemail}`), {
                        [signupData.businessType === "restaurant"
                            ? "restaurantName"
                            : "shopName"
                        ]: signupData.fullname,
                        category: "",
                        numberOfRatings: 0,
                        sumOfRatings: 0,
                        contact: signupData?.contact || "",
                        businessType: signupData?.businessType

                    });
                    setShowVerifyPage(false);
                    sendProfile(myemail);
                    sendBusinessName(signupData?.fullname);
                    sendBusinessType(signupData?.businessType);
                    setLogger(true);
                    

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
    },[doReload]);

    const handleResendLink = async ()=>{
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
                
        try {
            await sendEmailVerification(user);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false); // ✅ guaranteed to run
        }
    }

    const handlePasswordReset = ()=>{
        setLoading(true);
        sendPasswordResetEmail(auth, retrievalEmail)
        .then(()=>{
            setIsForgottenEmailSent(true);
            setLoading(false);
            console.log("Reset link sent successfully");
        })
        .catch((err)=>{
            setLoading(false);
            setVisible(true);
            setFeedBack("passwordResetLinkSent");
            console.log(`Error: ${err}`);
        });
    }

    const handleSubmit = async () => {
        setLoading(true);
        if (signup === true){

            if(!signupData?.fullname 
                || !signupData?.email 
                || !signupData?.contact 
                || !signupData?.password
                || !signupData?.confirm
                || !signupData?.businessType
            ){
                console.log("Sign up fields not completed");
                setLoading(false);
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
                                setLoading(false);
                                sendEmailVerification(userCredential.user);
                                if(!auth.currentUser.emailVerified){
                                    console.log("Verify email");
                                    setDoReload(true);
                                    setShowVerifyPage(true);
                                    return;
                                }
            })
            .catch((err)=>{
                setVisible(true);
                setLoading(false);

                 if(!auth.currentUser.emailVerified){
                    console.log("Verify email");
                    setDoReload(true);
                    setShowVerifyPage(true);
                    setLoading(false);
                    return;
                }

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
            .then(async ()=>{
                if(fullySignedUp === false){
                    // sendCameraSignal(true);
                    // sendProfile(loginData.email);
                    setLoading(false);
                }
                else{

                            const safeEmail = loginData?.email?.replace(/\./g, ",");

                            if(!safeEmail) return

                            const restaurantSnap = await get(ref(db, `restaurants/${safeEmail}`));
                            const shopSnap = await get(ref(db, `shops/${safeEmail}`));

                            const userData = restaurantSnap.exists()
                                ? restaurantSnap.val()
                                : shopSnap.val();

                            console.log("User data:", userData);

                            if (!restaurantSnap.exists() && !shopSnap.exists()) {
                                setFeedBack("wrongLogs");
                                console.log("❌ Email does not exist");
                                setLoading(false);
                                return;
                            }
                            else{

                                const data = userData || "";

                                const myemail = loginData?.email.replace(".",",");

                                setFeedBack("correctLogs");
                                setVisible(true);
                                console.log("🎉🎉 Logged in");
                                setLoading(false);
                                sendProfile(myemail);
                                sendBusinessName(loginData.businessType==="restaurant" ? data?.restaurantName : data?.shopName);
                                sendBusinessType(data?.businessType);
                                setLogger(true);
                            }
                     
                }
            })
            .catch((err)=>{
                setFeedBack("wrongLogs");
                setVisible(true);
                console.log(`❌ Wrong password${err}`);
                setLoading(false);
            })
        )
    }

    // ---------------------------------------------------------
    // Below this line: render helpers only. No state, no effects,
    // no logic — just organizes the same JSX/handlers that used to
    // sit inline into readable chunks.
    // ---------------------------------------------------------

    const renderField = (input, i, data, onChange) => {
        const Icon = FIELD_ICONS[input.key];
        return (
            <div key={i} className="um-field" style={{ marginTop: 18 }}>
                <input
                    placeholder=" "
                    value={data ? data[input.key] || "" : ""}
                    onChange={(e) => onChange(input.key, e.target.value)}
                    type={input.type}
                />
                <label>{input.name}</label>
                {Icon && <Icon className="um-field-icon" />}
            </div>
        );
    };

    const renderSubmitButton = (label, isLoading, onClick) => (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="um-btn um-btn-primary um-btn-block"
            style={{ marginTop: 26, height: 50 }}
        >
            {isLoading ? <div className="loaderSubmit" /> : label}
        </button>
    );

    const renderDivider = (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "26px 0 18px" }}>
            <div style={{ flex: 1, height: 1, background: "var(--um-line)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--um-ink-faint)" }}>{text}</span>
            <div style={{ flex: 1, height: 1, background: "var(--um-line)" }} />
        </div>
    );

    const renderGoogleButton = (onClick) => (
        <button onClick={onClick} className="um-btn um-btn-secondary um-btn-block" style={{ height: 50, marginBottom: 4 }}>
            <img src={google} style={{ width: 20, height: 20 }} />
            Continue with Google
        </button>
    );

    const renderLoginForm = () => (
        <>
            <h1 className="um-auth-title">Welcome back</h1>
            <p className="um-auth-subtitle">Sign in to manage your storefront</p>

            {loginInputFields.map((input, i) => renderField(input, i, loginData, handleLoginDetails))}

            <button
                onClick={() => setShowResetLinkPage(true)}
                className="um-btn-ghost"
                style={{ marginTop: 14, fontSize: 13, fontWeight: 600 }}
            >
                Forgot password?
            </button>

            {renderSubmitButton("Sign in", loading, handleSubmit)}
            {renderDivider("Or sign in with")}
            {renderGoogleButton(handleGoogleSignIn)}
        </>
    );

    const renderForgotPassword = () => (
        isforgottenEmailSent === false ? (
            <>
                <h1 className="um-auth-title">Reset your password</h1>
                <p className="um-auth-subtitle">We'll email you a link to get back in</p>
                <div className="um-field" style={{ marginTop: 18 }}>
                    <input
                        placeholder=" "
                        value={retrievalEmail}
                        onChange={(e) => setRetrievalEmail(e.target.value)}
                        style={{ paddingLeft: 14 }}
                    />
                    <label style={{ left: 14 }}>Email address</label>
                </div>
                {renderSubmitButton("Send reset link", loading, handlePasswordReset)}
                <button
                    onClick={() => setShowResetLinkPage(false)}
                    className="um-btn-ghost"
                    style={{ marginTop: 16, fontSize: 13, fontWeight: 600 }}
                >
                    Back to sign in
                </button>
            </>
        ) : (
            <div className="um-auth-endstate">
                <img src={mail} style={{ width: 160, height: 160 }} />
                <p className="um-auth-endstate-text">Password reset email sent! Click the link in your inbox to continue.</p>
                {renderSubmitButton("Back to login", loading, () => {
                    setRetrievalEmail("");
                    setShowResetLinkPage(false);
                    signup(false);
                })}
            </div>
        )
    );

    const renderSignupForm = () => (
        showVerifyPage === false ? (
            <>
                <h1 className="um-auth-title">Start selling on campus</h1>
                <p className="um-auth-subtitle">Set up your storefront in a few minutes</p>

                {signupInputFields.map((input, i) => {
                    const field = renderField(input, i, signupData, handleSignupDetails);
                    if (input.key !== "password") return field;
                    return (
                        <div key={i}>
                            {field}
                            <div className="um-strength" style={{ marginTop: 8, marginLeft: 2 }}>
                                <div className="um-strength-bar" style={{ background: isShort ? "var(--um-clay)" : (isMedium || isLong) ? "var(--um-marigold)" : undefined }} />
                                <div className="um-strength-bar" style={{ background: isMedium ? "var(--um-marigold)" : isLong ? "var(--um-pine)" : undefined }} />
                                <div className="um-strength-bar" style={{ background: isLong ? "var(--um-pine)" : undefined }} />
                            </div>
                        </div>
                    );
                })}

                <div className="um-field" style={{ marginTop: 18 }}>
                    <select
                        value={signupData.businessType}
                        onChange={e => setSignupData(prev => ({ ...prev, businessType: e.target.value }))}
                    >
                        <option value="">Business type</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="shop">Shop</option>
                    </select>
                </div>

                {renderSubmitButton("Sign up", loading, handleSubmit)}
                {renderDivider("Or sign up with")}
                {renderGoogleButton(handleGoogleSignIn)}
            </>
        ) : (
            <div className="um-auth-endstate">
                <img src={mail} style={{ width: 160, height: 160 }} />
                <p className="um-auth-endstate-text">Verification link sent — check your email to continue.</p>
                {renderSubmitButton("Resend verification email", loading, handleResendLink)}
            </div>
        )
    );

  return (
    <div className="um-auth-shell">

      {/* Toast / notification */}
      {visible && (
        <div className="um-toast-stack">
            <div
                className={`um-toast ${isSuccess ? "" : "is-error"}`}
                style={{
                    transform: `translateY(${toastY}px)`,
                    transition: 'transform 0.5s ease',
                }}
            >
                <span className="um-toast-icon">
                    {isSuccess ? <IoCheckmarkCircle /> : <IoCloseCircle />}
                </span>
                <span className="um-toast-text">{feedbackMessage}</span>
                <div className="um-toast-progress" style={{ animationDuration: "2000ms" }} />
            </div>
        </div>
      )}

      {/* Left: brand panel */}
      <div className="um-auth-brand">
        <div className="um-auth-brand-pattern" />
        <div className="um-auth-brand-content">
            <span className="um-auth-wordmark">UniMart</span>
            <p className="um-auth-tagline">
                The marketplace built for your campus — post what you sell,
                reach students down the hall or across the quad.
            </p>
        </div>
        <button
            onClick={() => setSignup(!signup)}
            className="um-btn um-btn-secondary um-auth-switch"
        >
            {signup ? "Have an account? Sign in" : "New here? Get started"}
        </button>
      </div>

      {/* Right: form panel */}
      <div className="um-auth-form-panel um-scroll">
        <div className="um-auth-form-inner">
            {signup === false ? (
                showResetLinkPage === false ? renderLoginForm() : renderForgotPassword()
            ) : (
                renderSignupForm()
            )}
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;
