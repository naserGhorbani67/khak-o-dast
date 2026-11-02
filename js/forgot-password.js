import {
  clientSupabase,
  emailRegex,
  toEmptyInputsForgotPassword,
} from "./auth.js";

const emailInput = document.querySelector("#email");
const emailErrorMessage = document.querySelector(".error-email");
// modal screen
const modalScreen = document.querySelector("#modalScreen");
const iconModalScreen = document.querySelector("#iconModalScreen");
const modalText = document.querySelector("#ModalText");
const modalBtn = document.querySelector("#modalButton");
// submit button
const submitBtn = document.querySelector("#submitBtn");

const validForgotForm = () => {
  const email = emailInput.value.trim();
  // email check
  const isEmailValid = emailRegex.test(email);
  emailErrorMessage.classList.toggle("hidden", isEmailValid);

  submitBtn.disabled = !isEmailValid;
  return isEmailValid;
};
const handleForgotPassword = async (event) => {
  event.preventDefault();
  if (!validForgotForm()) return;

  const email = emailInput.value.trim();
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = "در حال ارسال";

  try {
    const { error } = await clientSupabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        "https://naserghorbani67.github.io/khak-o-dast/reset-password.html",
    });
    if (error) throw error;
    modalScreen.classList.remove("hidden");
    iconModalScreen.setAttribute("src", "./imges/success.png");
    modalText.innerHTML =
      "لینک بازیابی پسورد به ایمیل شما ارسال شد لطفا ایمیل خود را بررسی کنید";
    toEmptyInputsForgotPassword(emailInput);
    modalBtn.onclick = () => (window.location.href = "login.html");
  } catch (error) {
    console.error("خطا در ارسال لینک:", error);
    modalScreen.classList.remove("hidden");
    iconModalScreen.setAttribute("src", "./imges/failed.png");
    modalBtn.onclick = () => modalScreen.classList.add("hidden");
    if (error.message.includes("email_address_invalid")) {
      modalText.innerText = " آدرس ایمیل نامعتبر است ";
    }
    if (error.message.includes("Unable to validate email address")) {
      modalText.innerText = " آدرس ایمیل نامعتبر است ";
    }
    if (error.message.includes("email rate limit exceeded")) {
      modalText.innerText = "محدودیت سرویس ایمیل لطفا بعدا تلاش کنید";
    }

    if (error.message.includes("Failed to fetch")) {
      // خطای شبکه
      if (!navigator.onLine) {
        modalText.innerHTML = "لطفا شبکه یا اینترنت خود را بررسی کنید";
      } else {
        modalText.innerText = "خطا در ارتباط با سرور";
      }
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
    toEmptyInputsForgotPassword(emailInput);
  }
};
emailInput.addEventListener("keyup", validForgotForm);
submitBtn.addEventListener("click", handleForgotPassword);
