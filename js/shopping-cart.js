import { getCart, saveCart, updateCartBadge } from "./shoping-cart-logic.js";
import { clientSupabase } from "./auth.js";

const cartGrid = document.querySelector("#cartGrid");
const emptyCartState = document.querySelector("#emptyCartState");
const cartItemsSection = document.querySelector("#cartItemsSection");
// shopping cart summary
const totalItemsCount = document.querySelector("#totalItemsCount");
const totalPrice = document.querySelector("#totalPrice");
const finalPrice = document.querySelector("#finalPrice");

const renderShoppingCart = async () => {
  let cartHTML = "";
  const cart = getCart();
  if (cart.length === 0) {
    cartGrid.classList.add("hidden");
    emptyCartState.classList.remove("hidden");
  } else {
    cartGrid.classList.remove("hidden");
    emptyCartState.classList.add("hidden");
    const productIds = cart.map((item) => item.id);
    try {
      const { data: productsData, error } = await clientSupabase
        .from("products")
        .select("*")
        .in("id", productIds); //گرفتن محصولاتی که آیدی‌شان در لیست است

      if (error) throw error;

      productsData.forEach((product) => {
        const cartItem = cart.find((item) => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 1;

        cartHTML += `
        <div class="cart-item-card">
            <div class="cart-item-image">
              <img src="${product.image_url}" alt="${product.name}" />
            </div>
            <div class="cart-item-details">
              <div class="cart-item-name">${product.name}</div>
              <div class="cart-item-price">
                ${product.price.toLocaleString("fa-IR")} تومان
              </div>

              <!-- دکمه‌های افزایش و کاهش تعداد -->
              <div class="cart-item-qty">
                <button class="decrease-btn" data-id="${product.id}">-</button>
                <span>${quantity}</span>
                <button class="increase-btn" data-id="${product.id}">+</button>
              </div>
            </div>

            <!-- دکمه حذف محصول -->
            <button class="cart-item-remove" data-id="${product.id}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
        `;
      });
      cartItemsSection.innerHTML = cartHTML;
    } catch (error) {
      console.error("خطا در دریافت اطلاعات محصولات سبد", error);
    }
  }
};
const updateShoppingCartSummary = () => {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItemsCount) totalItemsCount.innerHTML = totalItems;
  //   ادامه کد در آینده
};
// مدریریت کلیک روی دکمه‌های داخل سبد خرید
document.addEventListener("click", (e) => {
  // دکمه افزایش (+)
  if (e.target.closest(".increase-btn")) {
    const btn = e.target.closest(".increase-btn");
    const productId = btn.getAttribute("data-id");

    const cart = getCart();
    const item = cart.find((i) => i.id === productId);
    if (item) {
      item.quantity += 1;
      saveCart(cart);
      renderShoppingCart();
      updateCartBadge();
      updateShoppingCartSummary();
    }
  }
  // دکمه کاهش (-)
  if (e.target.closest(".decrease-btn")) {
    const btn = e.target.closest(".decrease-btn");
    const productId = btn.getAttribute("data-id");

    const cart = getCart();
    const item = cart.find((i) => i.id === productId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        // اگر تعداد یک بود و کاربر کمتر کرد محصول حذف شود
        const index = cart.findIndex((i) => i.id === productId);
        cart.splice(index, 1);
      }
      saveCart(cart);
      renderShoppingCart();
      updateCartBadge();
      updateShoppingCartSummary();
    }
  }
  //   دکمه حذف (سطل زباله)
  if (e.target.closest(".cart-item-remove")) {
    const btn = e.target.closest(".cart-item-remove");
    const productId = btn.getAttribute("data-id");

    const cart = getCart();
    const updateCart = cart.filter((i) => i.id !== productId);
    saveCart(updateCart);
    renderShoppingCart();
    updateCartBadge();
    updateShoppingCartSummary();
  }
});

document.addEventListener("DOMContentLoaded", renderShoppingCart);
window.addEventListener("load", updateShoppingCartSummary);
