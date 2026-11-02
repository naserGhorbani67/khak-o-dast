import {
  nameRegex,
  emailRegex,
  passwordRegex,
  clientSupabase,
  toEmptyInputs,
  handleModalConfirm,
} from "./auth.js";
console.log(clientSupabase.auth);

const fullNameInput = document.querySelector("#full-name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");
// errore messages
const nameErrorMessage = document.querySelector(".error-name");
const emailErrorMessage = document.querySelector(".error-email");
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

// redirect for success or failed
handleModalConfirm(modalScreen, modalBtn);

const validRegisterForm = () => {
  const name = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  // name check
  const isNameValid = nameRegex.test(name);
  nameErrorMessage.classList.toggle("hidden", isNameValid);
  // email check
  const isEmailValid = emailRegex.test(email);
  emailErrorMessage.classList.toggle("hidden", isEmailValid);
  // password check
  const isPasswordValid = passwordRegex.test(password);
  passwordErrorMessage.classList.toggle("hidden", isPasswordValid);
  // confirm password check
  const isConfirmValid = password === confirmPassword && password !== "";
  confirmErrorMessage.classList.toggle("hidden", isConfirmValid);
  //   disable or Enable button
  const isFormValid =
    isNameValid && isEmailValid && isPasswordValid && isConfirmValid;
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
const registerUser = async (event) => {
  event.preventDefault();
  if (!validRegisterForm()) {
    return;
  }
  const name = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = "در حال بررسی";
  try {
    const { data, error } = await clientSupabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo:
          "https://naserghorbani67.github.io/khak-o-dast/confirm.html",
        data: {
          full_name: name,
        },
      },
    });
    // console.log(data.user);
    // console.log(data.user.identities);

    if (error) throw error;
    if (data?.user?.identities?.length === 0) {
      modalScreen.classList.remove("hidden");
      iconModalScreen.setAttribute("src", "./imges/success.png");
      modalText.innerHTML = "این ایمیل قبلا ثبث شده است لطفا وارد شوید";
      modalBtn.setAttribute("data-redirect", "login.html");
      toEmptyInputs(
        fullNameInput,
        emailInput,
        passwordInput,
        confirmPasswordInput,
      );
      return;
    }
    modalScreen.classList.remove("hidden");
    iconModalScreen.setAttribute("src", "./imges/success.png");
    modalText.innerHTML =
      "ثبت نام با موفقیت انجام شد! لطفا ایمیل خود را بررسی کنید";
    modalBtn.setAttribute("data-redirect", "login.html");
    toEmptyInputs(
      fullNameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput,
    );
  } catch (err) {
    // ۶. مدیریت خطاها
    console.log("خطا:", err.message);
    modalScreen.classList.remove("hidden");
    iconModalScreen.setAttribute("src", "./imges/failed.png");
    modalBtn.removeAttribute("data-redirect");
    // بررسی نوع خطای ساپابیس
    if (err.message.includes("User already registered")) {
      modalText.innerHTML = "این ایمیل قبلا ثبت شده است. لطفا وارد شوید.";
    } else if (
      err.message.includes("Password should be at least 8 characters")
    ) {
      modalText.innerHTML = "رمز عبور بسیار ضعیف است.";
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

    // خالی کردن اینپوت‌ها
    toEmptyInputs(
      fullNameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput,
    );
  } finally {
    // ۷. فعال کردن دوباره دکمه
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
};

fullNameInput.addEventListener("keyup", validRegisterForm);
emailInput.addEventListener("keyup", validRegisterForm);
passwordInput.addEventListener("keyup", validRegisterForm);
confirmPasswordInput.addEventListener("keyup", validRegisterForm);
visiblePasswordElem.addEventListener("click", passwordVisiblity);
visibleConfirmElem.addEventListener("click", confirmVisiblity);
submitBtn.addEventListener("click", registerUser);
// modalBtn.addEventListener("click", hideModal);
