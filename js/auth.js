const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]{3,}$/;
const emailRegex =
  /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|ir|info)$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,15}$/;
const phoneRegex = /^09[0-9]{9}$/;
const addressRegex = /^.{10,}$/;
const postalCodeRegex = /^[0-9]{10}$/;
//supabase
const key = "sb_publishable_O6oTgJNtWu5EcDD7MIjX2A_OJNtZzzv";
const url = "https://bmicvelxkvvupcballbj.supabase.co";
export const clientSupabase = supabase.createClient(url, key);

const toEmptyInputs = (name, email, password, confirm) => {
  name.value = "";
  email.value = "";
  password.value = "";
  confirm.value = "";
};
const toEmptyInputsLogin = (email, password) => {
  email.value = "";
  password.value = "";
};
const toEmptyInputsForgotPassword = (email) => {
  email.value = "";
};
const toEmptyInputsResetPassword = (password, confirm) => {
  password.value = "";
  confirm.value = "";
};
const handleModalConfirm = (modalScreen, modalConfirmBtn) => {
  modalConfirmBtn.addEventListener("click", () => {
    const redirectUrl = modalConfirmBtn.getAttribute("data-redirect");
    redirectUrl
      ? (window.location.href = redirectUrl)
      : modalScreen.classList.add("hidden");
  });
};
export {
  nameRegex,
  emailRegex,
  passwordRegex,
  phoneRegex,
  postalCodeRegex,
  addressRegex,
  toEmptyInputs,
  toEmptyInputsLogin,
  handleModalConfirm,
  toEmptyInputsForgotPassword,
  toEmptyInputsResetPassword,
};
