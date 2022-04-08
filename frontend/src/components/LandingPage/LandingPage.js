import React from "react";
import "./LandingPage.css"

function LandingPage() {
//   const img = document.createElement("img");
//   img.src = "georgie.jpeg";
//   const block = document.getElementById("img");
//   block.appendChild(img);



    return (
        <div className="landingpage">
            <h1>Welcome to DOPE!  </h1>
            <h2>Your Ultimate NYC Puppy Cafe Local Guide</h2>
            <h3>(Say HI to Georgie!)</h3>
            {/* <img src="georgie.gif" alt="georgie" className="georgie" />
            <a><img src="https://i.ibb.co/xjbPMsS/IMG-5337.jpg" alt="goergie" className="georgie" /></a> */}
            <a>
                <img src="https://s7.gifyu.com/images/georgie.gif" className="georgie" alt="georgie.gif" border="0" />
                </a>
        </div>
    )
}

export default LandingPage


// <!-- <style>
// h1 {color:pink;font-family: verdana;margin-top: 80px; text-align: center;}
// h2 {color:lightpink;font-family: verdana;text-align: center;}
// h3 {color:lightpink;font-family: verdana;text-align: center;}
// a {text-align: center;}
// </style> -->
