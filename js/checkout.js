import {
  nameRegex,
  phoneRegex,
  addressRegex,
  postalCodeRegex,
  toEmptyInputscheckoutShoppingCart,
} from "./auth.js";
import { clientSupabase } from "./auth.js";
import { getCart, GUEST_CART_KEY } from "./shoping-cart-logic.js";
// checkout form elems
const fullNameInput = document.querySelector("#fullName");
const phoneInput = document.querySelector("#phone");
const addressInput = document.querySelector("#address");
const postalCodeInput = document.querySelector("#postalCode");
// error message
const fullNameErrorMessage = document.querySelector(".error-name");
const phoneErrorMessage = document.querySelector(".error-phone");
const addressErrorMessage = document.querySelector(".error-address");
const formErrorMessage = document.querySelector(".error-form");
const postalErrorMessage = document.querySelector(".error-postal");
// checkout sammary elems
const checkoutItemsList = document.querySelector("#checkoutItemsList");
const checkoutFinalPrice = document.querySelector("#checkoutFinalPrice");
const submitOrderBtn = document.querySelector("#submitOrderBtn");
// checkout modal
const statusModal = document.querySelector("#statusModal");
const statusModalIcon = document.querySelector("#statusModalIcon");
const statusModalText = document.querySelector("#statusModalText");

const validCheckoutForm = () => {
  const fullName = fullNameInput.value.trim();
  const phoneNumber = phoneInput.value.trim();
  const address = addressInput.value.trim();
  const postalCode = postalCodeInput.value.trim();

  // name check
  const isFullNameValid = nameRegex.test(fullName);
  fullNameErrorMessage.classList.toggle("hidden", isFullNameValid);
  // phone check
  const isPhoneNumberValid = phoneRegex.test(phoneNumber);
  phoneErrorMessage.classList.toggle("hidden", isPhoneNumberValid);
  // address check
  const isAddressValid = addressRegex.test(address);
  addressErrorMessage.classList.toggle("hidden", isAddressValid);
  // postalCode check
  const isPostalCodeValid = postalCodeRegex.test(postalCode);
  postalErrorMessage.classList.toggle("hidden", isPostalCodeValid);

  //   disable or Enable orderbutton
  const isFormValid =
    isFullNameValid &&
    isPhoneNumberValid &&
    isAddressValid &&
    isPostalCodeValid;
  submitOrderBtn.disabled = !isFormValid;
  formErrorMessage.classList.toggle("hidden", isFormValid);
  return isFormValid;
};
const renderCheckoutSummary = async () => {
  const cart = await getCart();
  // وقتی محصول را ثبت نهایی میکنیم باعث میشه که سبد خالی بشه و این کد اجرا بشه و اشتباهی به صفحه سبد خرید بره که برای جلوگیری از این کار شرط زیر رو مینویسم
  if (cart.length === 0 && !isSubmitting) {
    window.location.href = "shopping-cart.html";
    return;
  }
  try {
    const productIds = cart.map((item) => item.id);
    const { data: productsData, error } = await clientSupabase
      .from("products")
      .select("id,name,price,image_url")
      .in("id", productIds);

    if (error) throw error;

    let totalPrice = 0;
    let itemHTML = "";

    // ساختن لیست Html
    cart.forEach((cartItem) => {
      const product = productsData.find((p) => p.id === cartItem.id);
      if (product) {
        totalPrice += product.price * cartItem.quantity;
        itemHTML += `
            <div class="checkout-item">
                <img src="${product.image_url}" alt="${product.name}">
                <div class="checkout-item-details">
                    <span class="checkout-item-name">${product.name}</span>
                    <span class="item-unit-price">${Number(product.price).toLocaleString("fa-IR")} تومان</span>
                    <span class="checkout-item-qty">${cartItem.quantity.toLocaleString("fa-IR")} عدد</span>
                </div>
            </div>        
        `;
      }
    });
    if (checkoutItemsList) checkoutItemsList.innerHTML = itemHTML;
    if (checkoutFinalPrice)
      checkoutFinalPrice.innerHTML = totalPrice.toLocaleString("fa-IR");
    checkoutFinalPrice.dataset.price = totalPrice;
  } catch (error) {
    console.error("خطا:", error);
  }
};

let isSubmitting = false; //قفل
const placeOrder = async (event) => {
  event.preventDefault();

  // اگر درخواست قبلی هنوز در حال انجام است، کلیک‌های بعدی را نادیده بگیر
  if (isSubmitting) return;

  // اعتبارسنجی فرم (قبل از قفل کردن، تا اگر فرم نامعتبر بود قفل نماند)
  if (!validCheckoutForm()) return;

  // قفل را همین‌جا و قبل از اولین await فعال کن
  isSubmitting = true;
  if (submitOrderBtn) {
    submitOrderBtn.disabled = true;
    submitOrderBtn.innerHTML = "در حال ثبت سفارش ...";
  }

  let orderId = null;
  let isLeavingPage = false;

  try {
    // بررسی لاگین بودن کاربر
    const {
      data: { user },
    } = await clientSupabase.auth.getUser();

    if (!user) {
      isLeavingPage = true; // دکمه تا ریدایرکت در حالت «در حال ثبت» می‌ماند
      await new Promise((resolve) => setTimeout(resolve, 2000)); //چند ثانیه مکث برای نمایش دکمه
      statusModal.classList.remove("hidden");
      statusModalIcon.src = "./imges/failed.png";
      statusModalText.innerHTML =
        "برای ثبت سفارش ابتدا باید وارد حساب کاربری خود شوید";
      setTimeout(() => {
        statusModal.classList.add("hidden");
        window.location.href = "login.html";
      }, 3000);
      return; // finally همچنان اجرا می‌شود و قفل آزاد می‌شود
    }

    const recipientName = fullNameInput.value.trim();
    const phone = phoneInput.value.trim();
    const postalCode = postalCodeInput.value.trim();
    const address = addressInput.value.trim();

    const cart = await getCart();
    if (cart.length === 0) return;

    // خواندن قیمت از دیتابیس
    const productIds = cart.map((item) => item.id);
    const { data: productsData, error: productsError } = await clientSupabase
      .from("products")
      .select("id, price")
      .in("id", productIds);
    if (productsError) throw productsError;

    let calculatedTotalPrice = 0;
    // آماده سازی آرایه orderitems با قیمت‌های معتبر
    const orderItems = cart.map((cartItem) => {
      const product = productsData.find((p) => p.id === cartItem.id);
      const itemPrice = product ? product.price : 0;
      calculatedTotalPrice += itemPrice * cartItem.quantity;
      return {
        order_id: null,
        product_id: cartItem.id,
        quantity: cartItem.quantity,
        price: itemPrice,
      };
    });
    // ثبت در جدول orders
    const { data: orderData, error: orderError } = await clientSupabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          total_price: calculatedTotalPrice,
          status: "pending",
          recipient_name: recipientName,
          phone,
          postal_code: postalCode,
          address,
        },
      ])
      .select()
      .single();
    if (orderError) throw orderError;
    orderId = orderData.id;
    // اضافه کردن order_id به آیتم‌ها
    const finalOrderItems = orderItems.map((item) => ({
      ...item,
      order_id: orderId,
    }));

    // ثبت در جدول order_items
    const { error: itemsError } = await clientSupabase
      .from("order_items")
      .insert(finalOrderItems);

    if (itemsError) throw itemsError;

    await clientSupabase.from("carts").delete().eq("user_id", user.id);

    // موفقیت
    isLeavingPage = true;
    localStorage.removeItem(GUEST_CART_KEY);
    statusModal.classList.remove("hidden");
    statusModalIcon.src = "./imges/success.png";
    statusModalText.innerHTML =
      "سفارش شما با موفقیت ثبت شد! در حال انتقال به پنل کاربری ...";

    // خالی کردن فرم فقط در حالت موفقیت
    toEmptyInputscheckoutShoppingCart(
      fullNameInput,
      phoneInput,
      addressInput,
      postalCodeInput,
    );

    setTimeout(() => {
      window.location.href = "profile.html";
    }, 3000);
  } catch (error) {
    console.error("خطا در ثبت سفارش", error);

    // اگر فاکتور ساخته شد ولی اقلام ثبت نشدند، فاکتور را پاک کن
    if (orderId) {
      await clientSupabase.from("orders").delete().eq("id", orderId);
    }

    statusModal.classList.remove("hidden");
    statusModalIcon.src = "./imges/failed.png";
    statusModalText.innerHTML =
      "خطایی در ثبت سفارش رخ داده است لطفا مجددا تلاش کنید";
    setTimeout(() => statusModal.classList.add("hidden"), 3000);
  } finally {
    // قفل را فقط در حالت شکست آزاد کن؛ در حالت موفقیت تا ریدایرکت قفل بماند
    if (!isLeavingPage) {
      isSubmitting = false;
      if (submitOrderBtn) {
        submitOrderBtn.disabled = false;
        submitOrderBtn.innerHTML =
          'ثبت نهایی سفارش <i class="fa-solid fa-check"></i>';
      }
    }
  }
};
fullNameInput.addEventListener("keyup", validCheckoutForm);
phoneInput.addEventListener("keyup", validCheckoutForm);
postalCodeInput.addEventListener("keyup", validCheckoutForm);
addressInput.addEventListener("keyup", validCheckoutForm);
document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutSummary();
  // submit orders
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", placeOrder);
  }
});
//قرار دادن تابع در window سراسری برای استفاده در app.js برای آبدیت محصولات زمانی که کاربر محصولات رو در تب دیگر تغییرم میدهد.
window.renderCheckoutSummary = renderCheckoutSummary;
