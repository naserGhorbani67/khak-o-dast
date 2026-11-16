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
const toEmptyInputscheckoutShoppingCart = (
  fullName,
  phone,
  address,
  postalCode,
) => {
  fullName.value = "";
  phone.value = "";
  address.value = "";
  postalCode.value = "";
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
  toEmptyInputscheckoutShoppingCart,
};
//تابع انتقال سبد خرید مهمان به دیتا بیس
export const mergeGuestCartToDatabase = async (userId) => {
  const guestCartJSON = localStorage.getItem("khak_o_dast_cart_guest");
  if (!guestCartJSON) return; // اگر سبد خرید مهمان خالی است کاری نکن
  try {
    const guestCart = JSON.parse(guestCartJSON);
    if (guestCart.length === 0) return;
    // انتقال تک تک محصولات به دیتابیس
    for (const item of guestCart) {
      const productId = item.id;
      const guestQuantity = item.quantity;
      // چک کنیم که این محصول از قبل توی دیتابیس است یا نه؟
      const { data: existingItems, error: findError } = await clientSupabase
        .from("carts")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", productId);

      if (findError) {
        console.error("خطا در بررسی محصول در دیتابیس", findError);
        continue; //برو سراغ محصول بعدی
      }
      const existingItem =
        existingItems && existingItems.length > 0 ? existingItems[0] : null;
      if (existingItem) {
        // اگر محصول از قبل در دیتابیس وجود داشت تعداد را جمع میزنیم
        const newQuantity = existingItem.quantity + guestQuantity;
        const { error: updateError } = await clientSupabase
          .from("carts")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id);
        if (updateError)
          console.error("خطا در آپدیت تعداد محصولات", updateError);
      } else {
        // اگر وجود نداشت ردیف جدید میسازیم
        const { error: insertError } = await clientSupabase
          .from("carts")
          .insert([
            { user_id: userId, product_id: productId, quantity: guestQuantity },
          ]);
        if (insertError)
          console.error("خطا در اضافه‌کردن محصول جدید", insertError);
      }
    }
    // بعد از موفقیت سبد مهمان را پاک میکنیم
    localStorage.removeItem("khak_o_dast_cart_guest");
    console.log("سبد خرید مهمان با موفقیت منتقل شد");
  } catch (error) {
    console.error("خطا در پردازش  سبد خرید مهمان ", error);
  }
};
