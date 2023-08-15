"use strict";

// === Globals ===
const ON_OFF = 0;
const LOADING = 1;
const MAIN = 2;

// === DOM-Element Selection ===
const powerButton = document.querySelector(".power-button");
const overlayedPages = document.getElementsByClassName(
  "containter-overlay-pages"
);
console.log(powerButton);
console.log(overlayedPages);
console.log(overlayedPages[ON_OFF]);

// === Callbacks ===
const switchOverlayPage = function (layerTurnOff, layerTurnOn, intervalTime) {
  overlayedPages[layerTurnOn].style.opacity = 0;
  overlayedPages[layerTurnOn].classList.remove("hide");
  let invterval = 5;
  let vanishPage = setInterval(() => {
    overlayedPages[layerTurnOff].style.opacity = `${10 / invterval}`;
    overlayedPages[layerTurnOff].style.webkitFilter = `blur(${
      10 - invterval
    }px)`;
    overlayedPages[layerTurnOn].style.opacity = `${1 / invterval}`;
    invterval--;
    if (invterval < 0) {
      clearInterval(vanishPage);
      overlayedPages[layerTurnOff].classList.add("hide");
      invterval = 5;
      let blurInterval = setInterval(() => {
        overlayedPages[layerTurnOff].style.opacity = `${10 / invterval}`;
        overlayedPages[layerTurnOn].style.webkitFilter = `blur(${invterval}px)`;
        invterval--;
        if (invterval < 0) {
          clearInterval(blurInterval);
          overlayedPages[layerTurnOn].classList.remove("blur");
          overlayedPages[layerTurnOff].classList.add("hide");
        }
      }, intervalTime);
    }
  }, intervalTime);
};

// === Event-Listener ===
powerButton.addEventListener("click", () =>
  switchOverlayPage(ON_OFF, LOADING, 100)
);
