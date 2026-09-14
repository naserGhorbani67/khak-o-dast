const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");
const overlayElem = document.querySelector("#overlay");
const warningName = document.querySelector(".warning-name");
const warningEmail = document.querySelector(".warning-email");
const warningMessage = document.querySelector(".warning-message");
const inputName = document.querySelector(".contact-form-name");
const inputEmail = document.querySelector(".contact-form-email");
const textEreaMessage = document.querySelector(".contact-form-message");
const formBtn = document.querySelector("form button");

// منوی موبایل
const menuHandler = () => {
  navLinks.classList.toggle("open");
  navToggle.classList.toggle("active");
  overlayElem.classList.toggle("show");
};
const closeMenu = () => {
  navLinks.classList.remove("open");
  overlayElem.classList.remove("show");
  navToggle.classList.remove("active");
};
navToggle.addEventListener("click", menuHandler);
overlayElem.addEventListener("click", closeMenu);

// const open = navLinks.style.display === "flex";
// navLinks.style.display = open ? "none" : "flex";
// navLinks.style.cssText += open
//   ? ""
//   : "position:fixed; top:64px; right:20px; left:20px; background:#FBF6EC; flex-direction:column; padding:20px; border:1px solid var(--line); border-radius:10px; gap:18px; z-index:99;";

//input control-----
const showWarningName = () => {
  const name = inputName.value.trim();
  if (name.length < 3 || !isNaN(name)) {
    warningName.classList.remove("hidden");
  } else {
    warningName.classList.add("hidden");
  }
};
const showWarningEmail = () => {
  const email = inputEmail.value.trim();
  if (!email.includes("@") || !email.includes(".")) {
    warningEmail.classList.remove("hidden");
  } else {
    warningEmail.classList.add("hidden");
  }
};
const showWarningMessage = () => {
  const message = textEreaMessage.value.trim();
  if (message.length === 0) {
    warningMessage.classList.remove("hidden");
  } else {
    warningMessage.classList.add("hidden");
  }
};
const submitMessage = (event) => {
  const name = inputName.value.trim();
  const email = inputEmail.value.trim();
  const message = textEreaMessage.value.trim();

  event.preventDefault();
  if (
    name.length >= 3 &&
    isNaN(name) &&
    email.includes("@") &&
    email.includes(".") &&
    message.length !== 0
  ) {
    inputName.value = "";
    inputEmail.value = "";
    textEreaMessage.value = "";
    //send message (بعدا باید تکمیل شود)
  }
};

inputName.addEventListener("keyup", showWarningName);
inputEmail.addEventListener("keyup", showWarningEmail);
textEreaMessage.addEventListener("keyup", showWarningMessage);
formBtn.addEventListener("click", submitMessage);
