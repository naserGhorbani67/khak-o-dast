import { clientSupabase } from "./auth.js";

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
// loged or not-loged user
const guestView = document.querySelector("#guest-view");
const userView = document.querySelector("#user-view");
const userNameDisplay = document.querySelector("#user-name-display");
const userNavContainer = document.querySelector(".user-nav-container");

// logout modal and logout btn
const logoutBtn = document.querySelector("#logout-btn");
const logoutModal = document.querySelector("#logoutModal");
const confirmLogoutBtn = document.querySelector("#confirmLogoutBtn");
const cancelLogoutBtn = document.querySelector("#cancelLogoutBtn");
const messageErrorModalLogout = document.querySelector(".modal-content p");

const checkUserAuthStatus = async () => {
  try {
    if (!navigator.onLine) {
      throw new Error("آفلاین");
    }
    const {
      data: { user },
    } = await clientSupabase.auth.getUser();
    if (user) {
      // user is loged
      guestView.style.display = "none";
      userView.style.display = "flex";
      const fullName = user.user_metadata?.full_name || "; کاربر عزیز";
      userNameDisplay.innerText = fullName;
    } else {
      // user is guest
      guestView.style.display = "flex";
      userView.style.display = "none";
    }
    userNavContainer.style.visibility = "visible";
  } catch (error) {
    alert("لطفا وضعیت اینترنت و شبکه خود را بررسی کنید");
    console.error("خطا در بررسی وضعیت کاربر", error);
    guestView.style.display = "flex";
    userView.style.display = "none";
    userNavContainer.style.visibility = "visible";
  }
};
const handleLogout = async () => {
  const messageErrorModalLogout = document.querySelector(".modal-content p");
  messageErrorModalLogout.innerHTML = "";

  confirmLogoutBtn.innerHTML = "در حال خروج ...";
  confirmLogoutBtn.disabled = true;
  confirmLogoutBtn.classList.add("disable");
  cancelLogoutBtn.classList.add("disable");
  cancelLogoutBtn.disabled = true;

  await new Promise((resolve) => setTimeout(resolve, 2000));
  let isSuccess = false;
  try {
    const { error } = await clientSupabase.auth.signOut();
    if (error) throw error;
    isSuccess = true;
  } catch (error) {
    console.error("خطا در خروج از حساب", error);
    messageErrorModalLogout.style.color = "#b24a2b";
    messageErrorModalLogout.innerHTML =
      "مشکلی در خروج از حساب پیش آمد لطفا دوباره تلاش کنید";
  } finally {
    if (isSuccess) {
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } else {
      confirmLogoutBtn.innerHTML = " تلاش مجدد";
      confirmLogoutBtn.disabled = false;
      confirmLogoutBtn.classList.remove("disable");
      cancelLogoutBtn.classList.remove("disable");
      cancelLogoutBtn.disabled = false;
    }
  }
};
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

//input control-----
const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]{3,}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|ir|info)$/;

const showWarningName = () => {
  const name = inputName.value.trim();
  if (!nameRegex.test(name)) {
    warningName.classList.remove("hidden");
  } else {
    warningName.classList.add("hidden");
  }
};
const showWarningEmail = () => {
  const email = inputEmail.value.trim();
  if (!emailRegex.test(email)) {
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
  if (nameRegex.test(name) && emailRegex.test(email) && message.length !== 0) {
    inputName.value = "";
    inputEmail.value = "";
    textEreaMessage.value = "";
    //send message (بعدا باید تکمیل شود)
  } else {
    alert("wrong");
  }
};

inputName?.addEventListener("keyup", showWarningName);
inputEmail?.addEventListener("keyup", showWarningEmail);
textEreaMessage?.addEventListener("keyup", showWarningMessage);
formBtn?.addEventListener("click", submitMessage);
// login and logout user
document.addEventListener("DOMContentLoaded", () => {
  checkUserAuthStatus();

  if (logoutBtn && logoutModal) {
    logoutBtn.addEventListener("click", () => {
      messageErrorModalLogout.innerHTML =
        "آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟";
      messageErrorModalLogout.style.color = "#6b5a48";
      logoutModal.classList.remove("hidden");
      confirmLogoutBtn.innerHTML = " بله، خارج شو ";
    });
    cancelLogoutBtn.addEventListener("click", () => {
      logoutModal.classList.add("hidden");
    });
    confirmLogoutBtn.addEventListener("click", () => {
      handleLogout();
    });
  }
});
