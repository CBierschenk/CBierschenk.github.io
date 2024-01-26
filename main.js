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
const DEFAULT_IMG = "./imgs/dummy.jpeg";

// === DOM-Element Selection ===
const powerButton = document.querySelector(".power-button");
const pages = document.querySelectorAll("div[id*='page']");
const loadingContainer = pages[1].querySelector(".prequal-container");
const progressCount = document.querySelector("#progress");
const progressBar = document.querySelector("#progress-bar");
const header = document.querySelector("#header");
const navigation = document.querySelector(".navigation");
const aboutContainer = document.querySelector(".about-container");
const aboutButtonsContainer = document.querySelector(".about-button-container");
const aboutInformation = document.querySelector(".about-information");
const aboutText = aboutInformation.querySelector(".text-element");
const projectsContainer = document.querySelector(".container-projects");
const projectsSlideshow = document.querySelector(
  ".container-projects-slideshow"
);
const projects = document.getElementsByClassName("project-element");
const projectText = document.querySelector(".container-project-information");

// === Page State ===

// change default values?
let pageState = {
  _skipPrequal: false,
  _currPageNumber: this._skipPrequal ? pages.length : 1,
  _currPage: this._skipPrequal ? pages[MAIN] : pages[ON_OFF],
  _activeAboutText: -1,
  _projects: [],
  _numberProjects: -1,
  _activeProject: -1,

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
  get projects() {
    return this._projects;
  },
  get numberProjects() {
    return this._numberProjects;
  },
  get mappingProjects() {
    return this._mappingProjects;
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
  set projects(value) {
    this._projects = value;
    this.storeInLocalStorage();
  },
  set numberProjects(value) {
    this._numberProjects = value;
    this.storeInLocalStorage();
  },
  set activeProject(value) {
    this._activeProject = value;
    this.storeInLocalStorage();
  },
  storeInLocalStorage() {
    window.localStorage.setItem("pageState", JSON.stringify(this));
  },
  toJSON() {
    return {
      skipPrequal: this.skipPrequal,
      currPageNumber: this.currPageNumber,
      currPage: this.currPage,
      activeAboutText: this.activeAboutText,
      activeProject: this.activeProject,
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
    state.activeProject = parseInt(newState.activeProject);
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
initializeAboutSection();
initializeProjectSection();

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

// == About Section ==
function initializeAboutSection() {
  displayAboutGalleryImg();
  initializeAboutButtons();
  initializeAboutText();
}

function displayAboutGalleryImg(initialImg = DEFAULT_IMG) {
  aboutContainer.insertAdjacentHTML("afterbegin", getAboutGallery(initialImg));
}

function getAboutGallery(src) {
  return `
          <div class="about-gallery">
            <img src="${src}"/>
          </div>
         `;
}

function switchGalleryImg(imgPath = DEFAULT_IMG) {
  const currentGallery = document.querySelector(".about-gallery");
  if (!currentGallery.parentNode) {
    return;
  }
  currentGallery.parentNode.removeChild(currentGallery);
  displayAboutGalleryImg(imgPath);
}

function initializeAboutButtons() {
  const aboutEntries = getElementsFromText(text, "about");
  for (const entry of aboutEntries) {
    const buttonBootstrapClass = getText(text, "about", entry, "bootstrap");
    const buttonHtml = `
                  <button id="${entry}" class="feature-button">
                    <i class="${buttonBootstrapClass}"></i>
                  </button>
                `;
    aboutButtonsContainer.insertAdjacentHTML("beforeend", buttonHtml);
  }
}

function initializeAboutText() {
  hideAboutText();
  aboutButtonsContainer.addEventListener("click", displayAboutText);
  aboutContainer.addEventListener("click", hideAboutTextEvent);
}

function displayAboutText(event) {
  event.preventDefault();
  let eventTarget = event.target;
  if (eventTarget.classList.contains("bi")) {
    eventTarget = event.target.parentElement;
  }
  if (eventTarget && eventTarget.id) {
    aboutText.classList.remove("conceal");
    Array.prototype.forEach.call(aboutButtonsContainer.children, (btn) => {
      btn.classList.remove("active-button");
    });
    eventTarget.classList.add("active-button");
    aboutText.innerHTML = getText(text, "about", eventTarget.id, "text");
    switchGalleryImg(getText(text, "about", eventTarget.id, "img"));
  }
}

function hideAboutTextEvent(event) {
  if (
    event.target.className.includes("bi") ||
    event.target.className.includes("feature-button")
  ) {
    return;
  }
  event.preventDefault();
  Array.prototype.forEach.call(aboutButtonsContainer.children, (btn) => {
    btn.classList.remove("active-button");
  });
  hideAboutText();
  switchGalleryImg(DEFAULT_IMG);
}

function hideAboutText() {
  aboutText.classList.add("conceal");
}
// === Projects Sections ===

// Initialization project section
function initializeProjectSection() {
  pageState.projects = getElementsFromText(text, "projects");
  pageState.numberProjects = pageState.projects.length;
  switch (pageState.numberProjects) {
    case 1:
    case 2:
      pageState.activeProject = 0;
      break;
    default:
      pageState.activeProject = 1;
      break;
  }
  toggleProjectButtons();
  renderProjectsInterval(0, Math.min(pageState.numberProjects, MAX_PROJECTS));
  updateActiveProjectText();
  projects[pageState.activeProject].classList.add("focus");
  projectsContainer.addEventListener("click", updateSelectedProject);
}

function renderProjectsInterval(start, stop) {
  while (start < stop) {
    projectsSlideshow.insertAdjacentHTML("beforeend", getProject(start));
    start++;
  }
}

function toggleProjectButtons() {
  const containerChildren = projectsContainer.children;
  if (pageState.activeProject === 0) {
    containerChildren[0].classList.add("conceal");
  } else {
    containerChildren[0].classList.remove("conceal");
  }
  if (pageState.activeProject === pageState.numberProjects - 1) {
    containerChildren[containerChildren.length - 1].classList.add("conceal");
  } else {
    containerChildren[containerChildren.length - 1].classList.remove("conceal");
  }
}

// Project slidingshow
function updateSelectedProject(event) {
  let eventTarget = event.target;
  if (eventTarget.nodeName.toLowerCase() === "button") {
    if (pageState.numberProjects === 2) {
      handleTwoProjectCase(eventTarget);
      return;
    }
    eventTarget.id === "left" && slideLeft();
    eventTarget.id === "right" && slideRight();
    toggleProjectButtons();
    updateActiveProjectFocus();
    updateActiveProjectText();
  }
}

function slideLeft() {
  pageState.activeProject -= 1;
  projectsSlideshow.removeChild(projectsSlideshow.lastElementChild);
  if (pageState.activeProject === 0) {
    projectsSlideshow.insertAdjacentHTML(
      "afterbegin",
      `<div class="project-element">
      </div>`
    );
  } else {
    projectsSlideshow.insertAdjacentHTML(
      "afterbegin",
      getProject(pageState.activeProject - 1)
    );
  }
}

function slideRight() {
  pageState.activeProject += 1;
  projectsSlideshow.removeChild(projectsSlideshow.firstElementChild);
  if (pageState.activeProject === pageState.numberProjects - 1) {
    projectsSlideshow.insertAdjacentHTML(
      "beforeend",
      `<div class="project-element">
      </div>`
    );
  } else {
    projectsSlideshow.insertAdjacentHTML(
      "beforeend",
      getProject(pageState.activeProject + 1)
    );
  }
}

function updateActiveProjectText() {
  projectText.innerHTML = "";
  const activeProjectText = getText(text, "projects", pageState.activeProject);
  const link = getText(text, "projects", pageState.activeProject)["link"];
  const projectInformation = `
      ${link ? `<button>${link}</button>` : ""}
      <div class="text-element">
        <p>${activeProjectText["description"]}</p>
      </div>
    `;
  projectText.innerHTML = projectInformation;
}

function updateActiveProjectFocus() {
  Array.prototype.forEach.call(projects, (project) => {
    project.classList.remove("focus");
  });
  projects[1].classList.add("focus");
}

function getProject(project) {
  const projectTitle = getText(
    text,
    "projects",
    pageState.projects[project],
    "title"
  );
  const projectImg = getText(
    text,
    "projects",
    pageState.projects[project],
    "img"
  );
  return `
          <div class="project-element">
            <h3>${projectTitle}</h3>
            <img src="${projectImg}"/>
          </div>
          `;
}

function handleTwoProjectCase(eventTarget) {
  // Case: Only two projects
  if (eventTarget.id === "left") {
    pageState.activeProject = 0;
    projects[0].classList.add("focus");
    projects[1].classList.remove("focus");
  }
  if (eventTarget.id === "right") {
    pageState.activeProject = 1;
    projects[1].classList.add("focus");
    projects[0].classList.remove("focus");
  }
  toggleProjectButtons();
  updateActiveProjectText();
  return;
}

// === Utility Functions ===

// TODO: Refactor "getText" and "getNumberOfElementsFromText"
function getText(textFile, ...textLocation) {
  let failText = `E - Text for ${textLocation} not found!`;
  let success = true;
  if (textLocation.length === 0) return failText;
  // Loop over object and extract text by object tree
  let searchText = textFile;
  for (const property of textLocation) {
    if (!searchText.hasOwnProperty(property)) {
      success = false;
      break;
    }
    searchText = searchText[property];
  }
  if (!success) {
    return failText;
  }
  if (searchText.length && !(typeof searchText === "string")) {
    return searchText.join(" ");
  }
  return searchText;
}

// Counts number of definitions by using text file
function getElementsFromText(textFile, ...textLevel) {
  let numberOfDefinitions = -1;
  if (!textFile || textLevel.length === 0) return numberOfDefinitions;
  let objectLevel = textFile;
  for (const property of textLevel) {
    if (!objectLevel.hasOwnProperty(property)) {
      console.error(`The property ${property} does not exists in text file.`);
      break;
    }
    objectLevel = objectLevel[property];
  }
  return Object.keys(objectLevel);
}
