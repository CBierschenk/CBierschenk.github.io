const myImage = document.querySelector("img");

myImage.onclick = () => {
    const mySrc = myImage.getAttribute("src");

    if (mySrc === "images/MeWP.jpeg") {
        myImage.setAttribute("src", "images/MeWP2.jpg");
    } else {
        myImage.setAttribute("src", "images/MeWP.jpeg");
    }
};