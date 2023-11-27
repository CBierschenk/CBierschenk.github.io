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
const projectText = document.querySelector(".container-project-information");

// === Page State ===

// change default values?
let pageState = {
  _skipPrequal: false,
  _currPageNumber: this._skipPrequal ? pages.length : 1,
  _currPage: this._skipPrequal ? pages[MAIN] : pages[ON_OFF],
  _activeAboutText: 1,
  _numberProjects: -1,
  _mappingProjects: [],
  _activeProject: "",
  _projectFocusIndex: 0,

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
  get numberProjects() {
    return this._numberProjects;
  },
  get mappingProjects() {
    return this._mappingProjects;
  },
  get activeProject() {
    return this._activeProject;
  },
  get projectFocusIndex() {
    return this._projectFocusIndex;
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
  set numberProjects(value) {
    this._numberProjects = value;
    this.storeInLocalStorage();
  },
  set mappingProjects(value) {
    this._mappingProjects = value;
    this.storeInLocalStorage();
  },
  set activeProject(value) {
    this._activeProject = value;
    this.storeInLocalStorage();
  },
  set projectFocusIndex(value) {
    this._projectFocusIndex = value;
    this.storeInLocalStorage();
  },
  addMappingProjects(value) {
    this._mappingProjects.push(value);
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
      projectFocusIndex: this.projectFocusIdx,
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
    state.projectFocusIndex = newState.projectFocusIdx;
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
    aboutText.innerHTML = getText(text, "about", eventTarget.id);
  }
}

//TODO: Uses this later
function initializeAboutText() {
  aboutButtons[pageState.activeAboutText].classList.add("active-button");
  aboutText.innerHTML = switchAboutText("About", pageState.activeAboutText);
}

// === Projects Sections ===

// Initialization project section
function initializeProjectSection() {
  const definedProjects = getElementsFromText(text, "projects");
  pageState.numberProjects = definedProjects.length;
  pageState.projectFocusIndex = Math.round(pageState.numberProjects / 2) - 1;
  // Disable button if only one project
  if (pageState.numberProjects <= 1) {
    const containerChildren = projectsContainer.children;
    for (let idx = 0; idx < containerChildren.length; ++idx) {
      if (containerChildren[idx].nodeName.toLowerCase() === "button") {
        containerChildren[idx].classList.add("hide");
      }
    }
  }
  if (!pageState.activeProject && pageState.numberProjects > 1) {
    pageState.activeProject = definedProjects[1];
  } else if (!pageState.activeProject) {
    pageState.activeProject = definedProjects[-1];
  }
  for (const project of definedProjects) {
    pageState.addMappingProjects(project);
    const projectTitle = getText(text, "projects", project, "title");
    const projectImg = getText(text, "projects", project, "img");
    const projectInSlideshow = `
                              <div class="project-element">
                                <h3>${projectTitle}</h3>
                                <img src="${projectImg}"/>
                              </div>
                             `;
    projectsSlideshow.insertAdjacentHTML("beforeend", projectInSlideshow);
  }
  const projectDescription = getText(
    text,
    "projects",
    pageState.activeProject,
    "description"
  );
  // Code to initialize the correct project section state
  const idxProjectFocussed = pageState.mappingProjects.indexOf(
    pageState.activeProject
  );
  let projectFocusDifference = pageState.projectFocusIndex - idxProjectFocussed;
  if (projectFocusDifference > 0) {
    projectsSlideshow.appendChild(projects[0]);
    while (projectFocusDifference--) {
      projectsSlideshow.appendChild(projects[0]);
    }
  } else if (projectFocusDifference) {
    while (projectFocusDifference++) {
      projectsSlideshow.appendChild(projects[0]);
    }
  }
  projects[pageState.projectFocusIndex].classList.add("focus");
  const projectInformation = `
      <button>"Link to project"</button>
      <div class="text-element">
        <p>${projectDescription}</p>
      </div>
    `;
  projectText.insertAdjacentHTML("beforeend", projectInformation);
}

// Project slidingshow
projectsContainer.addEventListener("click", updateSelectedProject);

function updateSelectedProject(event) {
  let eventTarget = event.target;
  if (eventTarget.nodeName.toLowerCase() === "button") {
    slideProjects(eventTarget);
    projectText.children[0].innerHTML = getText(
      text,
      "projects",
      pageState.activeProject,
      "link"
    );
    projectText.children[1].innerHTML = getText(
      text,
      "projects",
      pageState.activeProject,
      "description"
    );
  }
}

function slideProjects(eventTarget) {
  projects[pageState.projectFocusIndex].classList.remove("focus");
  projectsSlideshow.appendChild(projects[0]); // moves the first element to the last slideshow position
  let projectShiftValue = 1;
  if (eventTarget.id === "left") {
    for (let c = 0; c < pageState.numberProjects - 2; c++) {
      projectsSlideshow.appendChild(projects[0]); // n - 2 left moves if right button pressed results in right rotation
    }
    projectShiftValue = -1;
  }
  let newProjectIndex = pageState.mappingProjects.indexOf(
    pageState.activeProject
  );
  // Code to track the active project and deal with index overflow
  if (newProjectIndex < 1 && projectShiftValue < 0) {
    newProjectIndex = pageState.numberProjects - 1;
  } else if (
    newProjectIndex >= pageState.numberProjects - 1 &&
    projectShiftValue > 0
  ) {
    newProjectIndex = 0;
  } else {
    newProjectIndex += projectShiftValue;
  }
  pageState.activeProject = pageState.mappingProjects[newProjectIndex];
  projects[pageState.projectFocusIndex].classList.add("focus");
}

// === Utility Functions ===

// TODO: Refactor "getText" and "getNumberOfElementsFromText"
function getText(textFile, ...textLocation) {
  let failText = `E - Text for ${textLocation} not found!`;
  if (textLocation.length === 0) return failText;
  // Loop over object and extract text by object tree
  let searchText = textFile;
  for (const property of textLocation) {
    if (!searchText.hasOwnProperty(property)) {
      break;
    }
    searchText = searchText[property];
  }
  return searchText && typeof searchText === "string" ? searchText : failText;
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
