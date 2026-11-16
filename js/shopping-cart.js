import {
  getCart,
  updateCartBadge,
  GUEST_CART_KEY,
} from "./shoping-cart-logic.js";
import { clientSupabase } from "./auth.js";

const cartGrid = document.querySelector("#cartGrid");
const emptyCartState = document.querySelector("#emptyCartState");
const cartItemsSection = document.querySelector("#cartItemsSection");
// shopping cart summary
const totalItemsCount = document.querySelector("#totalItemsCount");
const totalPriceElem = document.querySelector("#totalPrice");
const finalPriceElem = document.querySelector("#finalPrice");
// delete modal screen
const deleteModal = document.querySelector("#deleteModal");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const messageDelete = document.querySelector("#messageDelete");

let productToDeleteId = null;

const renderShoppingCart = async () => {
  let cartHTML = "";
  const cart = await getCart();
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
      updateShoppingCartSummary(productsData);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات محصولات سبد", error);
    }
  }
};
const updateShoppingCartSummary = async (productsData) => {
  const cart = await getCart();
  let totalPrice = 0;
  if (cart.length === 0) {
    if (totalItemsCount) totalItemsCount.innerHTML = "0";
    if (totalPriceElem) totalPriceElem.innerHTML = "0";
    if (finalPriceElem) finalPriceElem.innerHTML = "0";
    return;
  }
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItemsCount)
    totalItemsCount.innerHTML = totalItems.toLocaleString("fa-IR");

  cart.forEach((cartItem) => {
    if (productsData && productsData.length > 0) {
      const product = productsData.find((p) => p.id === cartItem.id);
      if (product) {
        totalPrice += product.price * cartItem.quantity;
      }
    }
  });
  if (totalPrice > 0) {
    if (totalPriceElem)
      totalPriceElem.innerHTML = totalPrice.toLocaleString("fa-IR");
    if (finalPriceElem)
      finalPriceElem.innerHTML = totalPrice.toLocaleString("fa-IR");
  }
};
// مدریریت کلیک روی دکمه‌های داخل سبد خرید
document.addEventListener("click", async (e) => {
  // دکمه افزایش (+)
  if (e.target.closest(".increase-btn")) {
    const btn = e.target.closest(".increase-btn");
    const productId = btn.getAttribute("data-id");

    const {
      data: { user },
    } = await clientSupabase.auth.getUser();
    if (user) {
      // اگر لاگین است در دیتابیس آبدیت کن
      const { data: existingItem } = await clientSupabase
        .from("carts")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();
      if (existingItem) {
        await clientSupabase
          .from("carts")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);
      }
    } else {
      // اگر مهمان است در لوکال استوریج آبدیت کن
      const cart = await getCart();
      const item = cart.find((i) => i.id === productId);
      if (item) {
        item.quantity += 1;
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      }
    }
    await renderShoppingCart();
    await updateCartBadge();
  }
  // دکمه کاهش (-)
  if (e.target.closest(".decrease-btn")) {
    const btn = e.target.closest(".decrease-btn");
    const productId = btn.getAttribute("data-id");
    const {
      data: { user },
    } = await clientSupabase.auth.getUser();
    if (user) {
      // اگر لاگین است در دیتابیس بررسی و آبدیت کن
      const { data: existingItem } = await clientSupabase
        .from("carts")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();
      if (existingItem) {
        if (existingItem.quantity > 1) {
          await clientSupabase
            .from("carts")
            .update({ quantity: existingItem.quantity - 1 })
            .eq("id", existingItem.id);
        } else {
          productToDeleteId = productId;
          deleteModal.classList.remove("hidden");
        }
      }
    } else {
      // اگر مهمان است در لوکال استوریج آبدیت کن
      const cart = await getCart();
      const item = cart.find((i) => i.id === productId);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
        } else {
          // اگر تعداد یک بود و کاربر کمتر کرد محصول حذف شود
          productToDeleteId = productId;
          deleteModal.classList.remove("hidden");
        }
      }
    }
    await renderShoppingCart();
    await updateCartBadge();
  }
  //   دکمه حذف (سطل زباله)
  if (e.target.closest(".cart-item-remove")) {
    const btn = e.target.closest(".cart-item-remove");
    productToDeleteId = btn.getAttribute("data-id");

    deleteModal.classList.remove("hidden");
  }
});
const deleteShoppingCart = async () => {
  if (!productToDeleteId) {
    return;
  }
  //   تغییر متن دکمه هنگام حذف محصول
  const orginalBtnText = confirmDeleteBtn.innerHTML;
  const orginalMessageText = messageDelete.innerHTML;
  confirmDeleteBtn.innerHTML = "در حال حذف ...";
  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.classList.add("disable");
  cancelDeleteBtn.disabled = true;
  cancelDeleteBtn.classList.add("disable");

  const {
    data: { user },
  } = await clientSupabase.auth.getUser();
  if (user) {
    // حذف سبد خرید از دیتابیس
    await clientSupabase
      .from("carts")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productToDeleteId);
  } else {
    // حذف از لوکال استوریج
    const cart = await getCart();
    const updateCart = cart.filter((i) => i.id !== productToDeleteId);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updateCart));
  }
  await renderShoppingCart();
  await updateCartBadge();

  //   نمایش حذف محصول
  setTimeout(() => {
    messageDelete.innerHTML = "محصول با موفقیت حذف شد";
    confirmDeleteBtn.innerHTML = orginalBtnText;
    confirmDeleteBtn.style.display = "none";
    cancelDeleteBtn.style.display = "none";
    setTimeout(() => {
      hideDeleteModal();
      confirmDeleteBtn.style.display = ""; // اگه block بشه ممکنه بهم بریزه
      cancelDeleteBtn.style.display = "";
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.classList.remove("disable");
      cancelDeleteBtn.disabled = false;
      cancelDeleteBtn.classList.remove("disable");
      messageDelete.innerHTML = orginalMessageText;
    }, 2000);
  }, 2000);
};
const hideDeleteModal = () => {
  deleteModal.classList.add("hidden");
  productToDeleteId = null;
};
document.addEventListener("DOMContentLoaded", renderShoppingCart);
confirmDeleteBtn.addEventListener("click", deleteShoppingCart);
cancelDeleteBtn.addEventListener("click", hideDeleteModal);
//قرار دادن تابع در window سراسری برای استفاده در app.js برای آبدیت محصولات زمانی که کاربر محصولات رو در تب دیگر تغییرم میدهد.
window.renderShoppingCart = renderShoppingCart;
