"use strict";

// === Globals ===
// TODO: Improve page tracking
const ON_OFF = 0;
const LOADING = 1;
const MAIN = 2;
const PREQUAL_SKIP = true;
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
const header = document.querySelector("#header");
const navigation = document.querySelector(".navigation");
const aboutButtons = document.getElementsByClassName("feature-button");
const aboutButtonsContainer = document.querySelector(".about-buttons");
const aboutText = document
  .querySelector(".about-information")
  .querySelector(".text-element");
const projectsContainer = document.querySelector(".container-projects");
const projectsSlideshow = document.querySelector(
  ".container-projects-slideshow"
);
const projects = document.getElementsByClassName("project-element");
const projectText = document
  .querySelector(".container-project-information")
  .querySelector(".text-element");

// === Page State ===

let pageState = {
  _skipPrequal: false,
  _currPageNumber: this._skipPrequal ? pages.length : 1,
  _currPage: this._skipPrequal ? pages[MAIN] : pages[ON_OFF],
  _activeAboutText: 1,
  _activeProject: 1,

  get skipPrequal() {
    return this._skipPrequal;
  },
  get currPageNumber() {
    return this._currPageNumber;
  },
  get currPage() {
    return this._currPage;
  },
  get activeAboutText() {
    return this._activeAboutText;
  },
  get activeProject() {
    return this._activeProject;
  },
  set skipPrequal(value) {
    this._skipPrequal = value;
    this.storeInLocalStorage();
  },
  set currPageNumber(value) {
    this._currPageNumber = value;
    this.storeInLocalStorage();
  },
  set currPage(value) {
    this._currPage = value;
    this.storeInLocalStorage();
  },
  set activeAboutText(value) {
    this._activeAboutText = value;
    this.storeInLocalStorage();
  },
  set activeProject(value) {
    this._activeProject = value;
    this.storeInLocalStorage();
  },
  storeInLocalStorage() {
    const stringifiedProperties = this.toJSON();
    window.localStorage.setItem(
      "pageState",
      JSON.stringify(stringifiedProperties)
    );
  },
  toJSON() {
    return {
      skipPrequal: this.skipPrequal,
      currPageNumber: this.skipPrequal,
      currPage: this.skipPrequal,
      activeAboutText: this.skipPrequal,
      activeProject: this.skipPrequal,
    };
  },
};

function loadPageState(state) {
  console.log(`Loading page state!`);
  try {
    const newState = JSON.parse(window.localStorage.getItem("pageState"));
    state.skipPrequal = newState.skipPrequal;
    state.currPageNumber = newState.currPageNumber;
    state.currPage = newState.currPage;
    state.activeAboutText = newState.activeAboutText;
    state.activeProject = newState.activeProject;
    return state;
  } catch {
    console.log(`Couldn't load page state`);
    return state;
  }
}
pageState = loadPageState(pageState);

// == Prequal Code ==
if (!pageState.skipPrequal) {
  runPrequal();
  pageState.skipPrequal = true;
} else {
  pages[ON_OFF].classList.add("hide");
  pages[MAIN].classList.remove("hide");
  pages[MAIN].style.webkitFilter = `blur(0px)`;
  toggleNavigation();
}

// Main Prequal Function
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
  state.currPageNumber = state.currPageNumber + 1;
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
  navigation.style.opacity = "0";
  header.classList.toggle("hide");
}

function showNavigation(event) {
  console.log("Swithc");
  console.log(event);
  if (event.type === "mouseleave") {
    navigation.style.opacity = "0";
  } else {
    navigation.style.opacity = "1";
  }
}

// == Navigation Bar ==
document
  .querySelector(".navi-links")
  .addEventListener("click", navigationAction);

document
  .querySelector(".navigation")
  .addEventListener("mouseenter", showNavigation);
document
  .querySelector(".navigation")
  .addEventListener("mouseleave", showNavigation);

function navigationAction(event) {
  event.preventDefault();
  let eventTarget = event.target;
  if (eventTarget.classList.contains("extern")) {
    window.open(eventTarget.getAttribute("id"));
  } else {
    const id = eventTarget.getAttribute("id");
    document.querySelector(id).scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// == About Text Switching ==
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
    aboutText.innerHTML = switchText("About", eventTarget.id);
  }
}
function switchText(textSection, textId) {
  //TODO: Create textFile and get function
  //const newText = getText(textSection, textId);
  const htmlMarkup = `${textSection}`;
  return htmlMarkup;
}

//TODO: Uses this later
function initializeAboutText() {
  aboutButtons[pageState.activeAboutText].classList.add("active-button");
  aboutText.innerHTML = switchAboutText("About", pageState.activeAboutText);
}

// Project slidingshow
projectsContainer.addEventListener("click", updateSelectedProject);

function updateSelectedProject(event) {
  let eventTarget = event.target;
  if (eventTarget.nodeName.toLowerCase() === "button") {
    slideProjects(eventTarget);
    projectText.innerHTML = switchText(projects[1].innerText, 0);
  }
}

function slideProjects(eventTarget) {
  projects[1].classList.remove("focus");
  projectsSlideshow.appendChild(projects[0]); // moves the first element to the last slideshow position
  if (eventTarget.id === "right") {
    projectsSlideshow.appendChild(projects[0]); // second move if right button pressed results in right rotation
  }
  projects[1].classList.add("focus");
}

// Utils
function getText(textFile, ...textLocation) {
  let failText = `E - Text for ${textLocation} not found!`;
  if (textLocation.length === 0) return failText;
  // Loop over object and extract text by object tree
  let searchText = textFile;
  for (const property of textLocation) {
    searchText = searchText[property];
  }
  return searchText || typeof searchText === String ? searchText : failText;
}
