import {
  nameRegex,
  phoneRegex,
  addressRegex,
  postalCodeRegex,
} from "./auth.js";
import { clientSupabase } from "./auth.js";
import { getCart } from "./shoping-cart-logic.js";

const fullNameInput = document.querySelector("#fullName");
const phoneInput = document.querySelector("#phone");
const addressInput = document.querySelector("#address");
const postalCodeInput = document.querySelector("#postalCode");

const fullNameErrorMessage = document.querySelector(".error-name");
const phoneErrorMessage = document.querySelector(".error-phone");
const addressErrorMessage = document.querySelector(".error-address");
const formErrorMessage = document.querySelector(".error-form");
const postalErrorMessage = document.querySelector(".error-postal");

const checkoutItemsList = document.querySelector("#checkoutItemsList");
const checkoutFinalPrice = document.querySelector("#checkoutFinalPrice");
const submitOrderBtn = document.querySelector("#submitOrderBtn");

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
  const cart = getCart();
  if (cart.length === 0) {
    window.Location.href = "shopping-cart.html";
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
  } catch (error) {
    //
  }
};
const xxx = (event) => {
  event.preventDefault();
  if (!validCheckoutForm()) {
    return;
  }
};
fullNameInput.addEventListener("keyup", validCheckoutForm);
phoneInput.addEventListener("keyup", validCheckoutForm);
postalCodeInput.addEventListener("keyup", validCheckoutForm);
addressInput.addEventListener("keyup", validCheckoutForm);
document.addEventListener("DOMContentLoaded", renderCheckoutSummary);
// submit orders
submitOrderBtn.addEventListener("click", xxx);
