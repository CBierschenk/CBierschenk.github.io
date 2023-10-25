"use strict";

// === Globals ===
// TODO: Improve page tracking
const ON_OFF = 0;
const LOADING = 1;
const MAIN = 2;
const PREQUAL_SKIP = false;
const LOADING_BAR_TICKS = 100;
const LOADING_INTERVAL = 50;
const TICKS_TILL_UNBLUR = 10;
const UNBLUR_TIMEINTERVAL = 100;
const MAX_PROJECTS = 3;

// === DOM-Element Selection ===
const powerButton = document.querySelector(".power-button");
const pages = document.querySelectorAll("div[id*='page']");
const loadingContainer = pages[1].querySelector(".prequal-container");
const progressCount = document.querySelector("#progress");
const progressBar = document.querySelector("#progress-bar");
const navigation = document.querySelector("#header");
const aboutButtons = document.getElementsByClassName("feature-button");
const aboutButtonsContainer = document.querySelector(".about-buttons");
const aboutText = document
  .querySelector(".about-information")
  .querySelector(".text-element");

// === Page State ===
const pageState = {
  currPageNumber: PREQUAL_SKIP ? pages.length : 1,
  currPage: PREQUAL_SKIP ? pages[MAIN] : pages[ON_OFF],
  activeAboutText: 1,
  activeProject: 1,
};

// == Prequal Code ==
if (!PREQUAL_SKIP) {
  runPrequal();
} else {
  pages[ON_OFF].classList.add("hide");
  pages[MAIN].classList.remove("hide");
  pages[MAIN].style.webkitFilter = `blur(0px)`;
  toggleNavigation();
}

// Main prequal function
async function runPrequal() {
  await promisePowerButtonPressed();
  await waitUntilAnimationFinished(".drop");
  loadingContainer.classList.add("lr-slide");
  nextPage(pageState);
  await waitUntilAnimationFinished(".lr-slide");
  await runLoadingBarAnimation();
  nextPage(pageState);
  await unblurMainPage(pageState);
  toggleNavigation();
  console.log("Prequal complete! Welcome to main page");
}

async function promisePowerButtonPressed() {
  return new Promise((resolve) =>
    powerButton.addEventListener("click", () => {
      pages[pageState.currPageNumber - 1]
        .querySelector(".prequal-container")
        .classList.add("drop");
      resolve();
    })
  );
}

async function promisePowerButtonPressed() {
  return new Promise((resolve) =>
    powerButton.addEventListener("click", () => {
      pages[pageState.currPageNumber - 1]
        .querySelector(".prequal-container")
        .classList.add("drop");
      resolve();
    })
  );
}

async function waitUntilAnimationFinished(animationSelector) {
  return new Promise((resolve, reject) => {
    const animation = document.querySelector(
      typeof animationSelector === String
        ? animationSelector
        : `${animationSelector}`
    );
    if (!animation) {
      reject(`Could not query the animation: ${animationSelector}`);
    }
    animation.addEventListener("animationend", () => resolve());
  });
}

// TODO: Improve page handling
function nextPage(state) {
  pages[state.currPageNumber - 1].classList.add("hide");
  pages[state.currPageNumber].classList.remove("hide");
  state.currPage = pages[state.currPageNumber];
  state.currPageNumber++;
}

async function runLoadingBarAnimation() {
  return new Promise((resolve) => {
    let loadingTicks = LOADING_BAR_TICKS;
    const loadingInterval = setInterval(() => {
      progressLoadingBar(loadingTicks);
      if (!loadingTicks) {
        clearInterval(loadingInterval);
        resolve();
      }
      loadingTicks--;
    }, LOADING_INTERVAL);
  });
}

function progressLoadingBar(loadingTicks) {
  let loadingPercentige = LOADING_BAR_TICKS - loadingTicks;
  progressBar.style.width = `${loadingPercentige}%`;
  progressCount.innerText = `${loadingPercentige}%`;
}

async function unblurMainPage(state) {
  return new Promise((resolve) => {
    let unblurTicks = TICKS_TILL_UNBLUR;
    const unblurInterval = setInterval(() => {
      state.currPage.style.webkitFilter = `blur(${unblurTicks - 1}px)`;
      unblurTicks--;
      if (!unblurTicks) {
        clearInterval(unblurInterval);
        resolve();
      }
    }, UNBLUR_TIMEINTERVAL);
  });
}

function toggleNavigation() {
  navigation.classList.toggle("hide");
}

// == Navigation Bar ==
document
  .querySelector(".navi-links")
  .addEventListener("click", navigationAction);

function navigationAction(event) {
  event.preventDefault();
  let eventTarget = event.target;
  if (eventTarget.classList.contains("bi")) {
    eventTarget = event.target.parentElement;
  }
  if (eventTarget.classList.contains("navi-link")) {
    console.log(eventTarget.classList.contains("extern"));
    if (eventTarget.classList.contains("extern")) {
      window.open(eventTarget.getAttribute("href"));
    } else {
      const id = eventTarget.getAttribute("href");
      document.querySelector(id).scrollIntoView({ behavior: "smooth" });
    }
  }
}
// About text switching
aboutButtonsContainer.addEventListener("click", aboutButtonsAction);

function aboutButtonsAction(event) {
  event.preventDefault();
  let eventTarget = event.target;
  if (eventTarget.classList.contains("bi")) {
    eventTarget = event.target.parentElement;
  }
  console.log(eventTarget);
  if (eventTarget && eventTarget.id) {
    Array.prototype.forEach.call(aboutButtons, (btn) => {
      btn.classList.remove("active-button");
    });
    eventTarget.classList.add("active-button");
    aboutText.innerHTML = switchAboutText("About", eventTarget.id);
  }
}
function switchAboutText(textSection, textId) {
  //TODO: Create textFile and get function
  //const newText = getText(textSection, textId);
  const htmlMarkup = `${textId}`;
  return htmlMarkup;
}

//TODO: Uses this later
function initializeAboutText() {
  aboutButtons[pageState.activeAboutText].classList.add("active-button");
  aboutText.innerHTML = switchAboutText("About", pageState.activeAboutText);
}

// Project slidingshow
let slideshowIndex = 1;
const projectsArray = document.getElementsByClassName("single-project");
document.querySelector(".container-projects").addEventListener("click", (e) => {
  let eventTarget = e.target;
  console.log(projectsArray);
  if (eventTarget.nodeName.toLowerCase() === "button") {
    if (e.target.id === "left") {
      const currentPrj = projectsArray[slideshowIndex];
      const selectedProjectImg = currentPrj.getElementsByTagName("img")[0];
      selectedProjectImg.classList.remove("project");
      selectedProjectImg.classList.add("selected");
      const selectedProjectHeader = currentPrj.getElementsByTagName("h3")[0];
      selectedProjectHeader.classList.remove("project");
      selectedProjectHeader.classList.add("selected");
    }
    if (e.target.id === "right") {
      console.log("right");
    }
  }
  console.log(eventTarget.nodeName);
});
