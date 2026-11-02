import {
  passwordRegex,
  clientSupabase,
  toEmptyInputsResetPassword,
} from "./auth.js";

const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");
// errore messages
const passwordErrorMessage = document.querySelector(".error-password");
const confirmErrorMessage = document.querySelector(".error-confirm");
// submit button
const submitBtn = document.querySelector("#submitBtn");
// eye icon
const visiblePasswordElem = document.querySelector(".eye-icon-password");
const visibleConfirmElem = document.querySelector(".eye-icon-confirm");
// modal screen
const modalScreen = document.querySelector("#modalScreen");
const iconModalScreen = document.querySelector("#iconModalScreen");
const modalText = document.querySelector("#ModalText");
const modalBtn = document.querySelector("#modalButton");

const validResetPassword = () => {
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  // password check
  const isPasswordValid = passwordRegex.test(password);
  passwordErrorMessage.classList.toggle("hidden", isPasswordValid);
  // confirm password check
  const isConfirmValid = password === confirmPassword && password !== "";
  confirmErrorMessage.classList.toggle("hidden", isConfirmValid);
  //   disable or Enable button
  const isFormValid = isPasswordValid && isConfirmValid;
  submitBtn.disabled = !isFormValid;
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
const confirmVisiblity = () => {
  // eye icon confirm
  const typeConfirm =
    confirmPasswordInput.getAttribute("type") === "password"
      ? "text"
      : "password";
  confirmPasswordInput.setAttribute("type", typeConfirm);
  visibleConfirmElem.classList.toggle("fa-eye");
  visibleConfirmElem.classList.toggle("fa-eye-slash");
};
const handleResetPassword = async (event) => {
  const password = passwordInput.value.trim();
  event.preventDefault();
  if (!validResetPassword()) return;

  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = "در حال ذخیره";

  try {
    const { data, error } = await clientSupabase.auth.updateUser({
      password: password,
    });
    if (error) throw error;
    modalScreen.classList.remove("hidden");
    iconModalScreen.setAttribute("src", "./imges/success.png");
    modalText.innerHTML =
      "رمز عبور شما با موفقیت تغییر کرد. حالا میتوانید وارد سایت شوید";
    toEmptyInputsResetPassword(passwordInput, confirmPasswordInput);
    modalBtn.onclick = () => (window.location.href = "login.html");
  } catch (error) {
    console.error("خطا در تغییر رمز:", error);
    modalScreen.classList.remove("hidden");
    iconModalScreen.setAttribute("src", "./imges/failed.png");
    toEmptyInputsResetPassword(passwordInput, confirmPasswordInput);
    modalBtn.onclick = () => modalScreen.classList.add("hidden");
    // خطای شبکه
    if (error.message.includes("Failed to fetch")) {
      // خطای شبکه
      if (!navigator.onLine) {
        modalText.innerHTML = "لطفا شبکه یا اینترنت خود را بررسی کنید";
      } else {
        modalText.innerText = "خطا در ارتباط با سرور";
      }
    }
    if (
      error.message.includes(
        "New password should be different from the old password.",
      )
    ) {
      modalText.innerHTML =
        "رمز عبور جدید شما نباید با رمز قبلی یکسان باشد. لطفا یک رمز متفاوت انتخاب کنید";
    }
    if (error.message.includes("Email not confirmed")) {
      modalText.innerHTML =
        "ایمیل خود را بررسی کنید و  لینک ارسالی مربوط به تغییر پسورد را تایید کنید.";
    }
    if (error.message.includes("Auth session missing")) {
      modalText.innerHTML =
        "لینک بازیابی شما منقضی شده یا نامعتبر است. لطفا دوباره از صفحه فراموشی رمز اقدام کنید";
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
};
passwordInput.addEventListener("keyup", validResetPassword);
confirmPasswordInput.addEventListener("keyup", validResetPassword);
submitBtn.addEventListener("click", handleResetPassword);
visiblePasswordElem.addEventListener("click", passwordVisiblity);
visibleConfirmElem.addEventListener("click", confirmVisiblity);
submitBtn.addEventListener("click", handleResetPassword);
