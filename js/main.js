const myImage = document.querySelector("img");

setInterval(imgSwitch, 5000);

function imgSwitch() {
    const mySrc = myImage.getAttribute("src");

    if (mySrc === "images/MeWP.jpeg") {
        myImage.setAttribute("src", "images/MeWP2.jpg");
    } else {
        myImage.setAttribute("src", "images/MeWP.jpeg");
    }
};
