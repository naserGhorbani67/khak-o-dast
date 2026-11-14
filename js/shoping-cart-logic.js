export const CART_STORAGE_KEY = "khak_o_dast_cart";

// تابعی برای خواندن سبد خرید از حافظه
export const getCart = () => {
  const cartJSON = localStorage.getItem(CART_STORAGE_KEY);
  if (!cartJSON) {
    return [];
  }
  try {
    return JSON.parse(cartJSON);
  } catch (error) {
    console.error("خطا در خواندن سبد خرید", error);
    return [];
  }
};
// تابعی برای ذخیره سبد خرید در حافظهء (داخلی)
export const saveCart = (cart) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};
// تابع اضافه کردن محصول به سبد خرید
export const addToCart = (productId, productPrice, quantity = 1) => {
  const cart = getCart();
  const existingItemIndex = cart.findIndex((item) => item.id === productId);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: productId,
      price: Number(productPrice),
      quantity: quantity,
    });
  }
  saveCart(cart);
};
// تابع برای آپدیت تعداد روی آیکون سبد خرید
export const updateCartBadge = () => {
  const cartBadge = document.querySelector("#cartBadge");
  if (!cartBadge) return; // اگر آیکون در صفحه نبود، کاری نکن

  const cart = getCart(); // خواندن سبد از حافظه

  // محاسبه مجموع تعداد (چون ممکن است یک محصول با تعداد ۳ در سبد باشد)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // قرار دادن عدد در آیکون
  cartBadge.innerText = totalItems;
  cartBadge.setAttribute("data-count", totalItems); // برای استایل CSS
};
