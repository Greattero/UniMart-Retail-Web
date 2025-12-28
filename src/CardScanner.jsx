import React, { useEffect } from "react";
import Webcam from "react-webcam";


function CardScanner() {
    const webcamRef = React.useRef(null);
    const [imageSrc, setImageSrc] = React.useState(null);

    const OCRSPACE_API_KEY = "K86278601088957";

    const extractTextFromOCRSpace = async (base64Image) => {
    const formData = new URLSearchParams();
    formData.append("base64Image", base64Image);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");

    try {
        const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
            apikey: OCRSPACE_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
        });

        const result = await response.json();
        return result.ParsedResults[0]?.ParsedText || "";
    } catch (err) {
        console.error("OCR.space error:", err);
        return "";
    }
    };

    useEffect(() => {
    if (!imageSrc) return;

    const runOCR = async () => {
        const textExtracted = await extractTextFromOCRSpace(imageSrc);


        const hasUniversity =
        textExtracted.toLowerCase().includes("mines and technology (umat)") ||
        textExtracted.toLowerCase().includes("mines and technoiogy (umat)");



    const hasIdCard = textExtracted.toLowerCase().includes("student identification card");

    const hasRailway = textExtracted.toLowerCase().includes("railway");

    if(textExtracted){
      console.log(`uni ${hasUniversity}`);
      console.log(`card ${hasIdCard}`);
      console.log(`hall ${hasRailway}`);
              console.log(textExtracted)


    }



    if(!hasIdCard || !hasUniversity || !hasRailway){
      console.log("Couldn't verify card. Scan properly");
    //   setLoading(false);
      return;
    }


    const studentRef =
    textExtracted.match(/90\d{8}/)?.[0] || "Not found";
        
        // const studentNum = textExtracted
        //             .find(t=>/sri/i.test(t))
        //             ?.match(/sri[\w\.]+/i)?.[0]
        //             ?.replaceAll(".","")
        //             ?.toUpperCase()
        //             || "Not Found";

        console.log("ref",studentRef);
        // console.log(textExtracted)
    };

    runOCR();
    }, [imageSrc]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const capture = React.useCallback(() => {
    setImageSrc(webcamRef.current.getScreenshot());
    // console.log(imageSrc);
  }, []);




  return (
    
      <div
        style={{
          height: "100vh",
          position: "relative",
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          width:"100vw",
          backgroundColor:"white"
        }}
      >
        <div style={{
    width: 1250,
    height: 700,
    backgroundColor:"blue",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    borderRadius: "35px",
    overflow:"hidden"

        }}>
            <div style={{
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
            }}>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
            />

      <button style={{
        position: "absolute",
        marginTop:"500px",
        backgroundColor:"rgba(14, 125, 145, 1)",
        color: "white",
        padding: "20px",
        fontWeight:'bold', 
        fontSize:"25px",
        borderRadius:"15px"  
      }}
      onClick={capture}>Scan ID</button>
            </div>
      </div>
      <div>
        <img src={imageSrc}/>
      </div>

    </div>
  );
}

export default CardScanner;
