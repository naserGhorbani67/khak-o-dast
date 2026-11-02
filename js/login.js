import {
  emailRegex,
  clientSupabase,
  toEmptyInputsLogin,
  handleModalConfirm,
} from "./auth.js";
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const rememberMeElem = document.querySelector("#rememberMe");
const emailErrorMessage = document.querySelector(".error-email");
const passwordErrorMessage = document.querySelector(".error-password");
// login btn
const loginBtn = document.querySelector("#loginBtn");
//eye icon
const visiblePasswordElem = document.querySelector(".eye-icon-password");
// modal screen
const modalScreen = document.querySelector("#modalScreen");
const iconModalScreen = document.querySelector("#iconModalScreen");
const modalText = document.querySelector("#ModalText");
const modalBtn = document.querySelector("#modalButton");

handleModalConfirm(modalScreen, modalBtn);

const validLoginForm = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  // email check
  const isEmailValid = emailRegex.test(email);
  emailErrorMessage.classList.toggle("hidden", isEmailValid);
  // password check
  const isPasswordValid = password.length >= 8;
  passwordErrorMessage.classList.toggle("hidden", isPasswordValid);
  const isFormValid = isEmailValid && isPasswordValid;
  loginBtn.disabled = !isFormValid;
  return isFormValid;
};
const passwordVisiblity = () => {
  // eye icon password
  const typePassword =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", typePassword);
  visiblePasswordElem.classList.toggle("fa-eye");
  visiblePasswordElem.classList.toggle("fa-eye-slash");
};
const loginUser = async (event) => {
  event.preventDefault();
  if (!validLoginForm()) return;

  const originalBtnText = loginBtn.innerHTML;
  loginBtn.disabled = true;
  loginBtn.innerHTML = "در حال ورود";
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  try {
    const { data, error } = await clientSupabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) throw error;
    modalScreen.classList.remove("hidden");
    iconModalScreen.setAttribute("src", "./imges/success.png");
    modalText.innerHTML = "خوش آمدید! در حال انتقال به صفحه اصلی";
    // redirect to home
    modalBtn.setAttribute("data-redirect", "index.html");
    toEmptyInputsLogin(emailInput, passwordInput);
  } catch (err) {
    console.log("خطا:", err.message);
    modalScreen.classList.remove("hidden");
    iconModalScreen.setAttribute("src", "./imges/failed.png");
    // close modal not redirect
    modalBtn.removeAttribute("data-redirect");

    if (err.message.includes("Invalid login credentials")) {
      modalText.innerHTML = "ایمیل یا رمز عبور اشتباه است.";
    } else if (err.message.includes("Email not confirmed")) {
      modalText.innerHTML =
        "ایمیل شما هنوز تایید نشده است. لطفاً ایمیل خود را بررسی کنید.";
    } else if (err.message.includes("Failed to fetch")) {
      // خطای شبکه
      if (!navigator.onLine) {
        modalText.innerHTML = "لطفا شبکه یا اینترنت خود را بررسی کنید";
      } else {
        modalText.innerHTML = "خطا در ارتباط با سرور";
      }
    } else {
      // هر خطای دیگه‌ای
      modalText.innerHTML = "ثبت‌نام با شکست مواجه شد! " + err.message;
    }
    toEmptyInputsLogin(emailInput, passwordInput);
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = originalBtnText;
  }
};

emailInput.addEventListener("keyup", validLoginForm);
passwordInput.addEventListener("keyup", validLoginForm);
visiblePasswordElem.addEventListener("click", passwordVisiblity);
loginBtn.addEventListener("click", loginUser);
