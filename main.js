"use strict";

// === Globals ===
const ON_OFF = 0;
const LOADING = 1;
const MAIN = 2;
const LOADING_BAR_TICKS = 100;

// === DOM-Element Selection ===
const powerButton = document.querySelector(".power-button");
const overlayedPages = document.getElementsByClassName(
  "containter-overlay-pages"
);
const onOffContainer = document.querySelector(".on-off-container");
const loadingContainer = document.querySelector(".container-loading");
const progressCount = document.querySelector("#progress");
const progressBar = document.querySelector("#progress-bar");

// === Callbacks ===
const progressLoadingBar = function (loadingTicks) {
  let loadingPercentige = LOADING_BAR_TICKS - loadingTicks;
  progressBar.style.width = `${loadingPercentige}%`;
  progressCount.innerText = `${loadingPercentige}%`;
};

// === Event-Listener ===
/* 
The click on the button starts the nested prequel sequence. The different stages are:
1. Event button clicked -> adds drop css class, queries added drop class and ands a event listener to react on end
2. Event drop animation ends -> adds the lr-slide css class to the loading container, toggels hide styles, queries slide animation and uses this to trigger the next event
3. Event lr-slide ends -> set interval to animate loading bar (could replaced by css webkit animation)
4. End of loading interval -> set interval to unblur main page.
*/
powerButton.addEventListener("click", () => {
  onOffContainer.classList.add("drop");
  const dropAnimation = document.querySelector(".drop");
  dropAnimation.addEventListener("animationend", () => {
    loadingContainer.classList.add("lr-slide");
    overlayedPages[ON_OFF].classList.add("hide");
    overlayedPages[LOADING].classList.remove("hide");
    const slideAnimation = document.querySelector(".lr-slide");
    slideAnimation.addEventListener("animationend", () => {
      let loadingTicks = LOADING_BAR_TICKS;
      const loadingInterval = setInterval(() => {
        progressLoadingBar(loadingTicks);
        if (!loadingTicks) {
          clearInterval(loadingInterval);
          overlayedPages[LOADING].classList.add("hide");
          overlayedPages[MAIN].classList.remove("hide");
          let unblurTicks = 10;
          const unblurInterval = setInterval(() => {
            overlayedPages[MAIN].style.webkitFilter = `blur(${
              unblurTicks - 1
            }px)`;
            unblurTicks--;
            if (!unblurTicks) {
              clearInterval(unblurInterval);
            }
          }, 100);
        }
        loadingTicks--;
      }, 50);
    });
  });
});

// Navigation Bar (Lazy scrolling)
document.querySelector(".navi-links").addEventListener("click", function (e) {
  e.preventDefault();
  let eventTarget = e.target;
  if (eventTarget.classList.contains("bi")) {
    eventTarget = e.target.parentElement;
  }
  if (eventTarget.classList.contains("navi-link")) {
    if (eventTarget.classList.contains("extern")) {
      window.open(eventTarget.getAttribute("href"));
    } else {
      const id = eventTarget.getAttribute("href");
      document.querySelector(id).scrollIntoView({ behavior: "smooth" });
    }
  }
});
