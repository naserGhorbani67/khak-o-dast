import { clientSupabase } from "./auth.js";

// کلید مخصوص مهمان‌ها در لوکال استوریج
export const GUEST_CART_KEY = "khak_o_dast_cart_guest";

// تابع کمکی گرفتن سبد خرید
export const getCart = async () => {
  const {
    data: { user },
  } = await clientSupabase.auth.getUser();
  if (user) {
    // اگر کاربر لاگین است سبد خرید را از دیتابیس میخوانیم
    const { data: dbCart, error } = await clientSupabase
      .from("carts")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      console.error("خطا در خواندن سبد از دیتابیس", error);
      return [];
    }
    return dbCart.map((item) => ({
      id: item.product_id,
      quantity: item.quantity,
    }));
  } else {
    // اگر کاربر مهمان است سبد خرید را از لوکال استوریج میخوانیم
    const cartJSON = localStorage.getItem(GUEST_CART_KEY);
    if (!cartJSON) {
      return [];
    }
    try {
      return JSON.parse(cartJSON);
    } catch (error) {
      console.error("خطا در خواندن سبد خرید مهمان", error);
      return [];
    }
  }
};
// تابع کمکی ذخیره سبد خرید (فقط برای مهمان)
const saveGuestCart = (cart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};
// تابع اصلی افزودن به سبد خرید
export const addToCart = async (productId, quantity = 1) => {
  const {
    data: { user },
  } = await clientSupabase.auth.getUser();
  if (user) {
    // بخش کاربر لاگین شده (دیتابیس)
    // چک میکنیم که آیا این محصول از قبل در سبد کاربر هست یا نه
    const { data: existingItem, error: findError } = await clientSupabase
      .from("carts")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle(); // اگر یافت نشد خطا نده

    if (findError) {
      console.error("خطا در جست و جوی سبد", findError);
      return;
    }
    if (existingItem) {
      // اگر وجود داشت تعداش را زیاد می کنیم
      const { error: updateError } = await clientSupabase
        .from("carts")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id);
      if (updateError) console.error("خطا", updateError);
    } else {
      // اگر وجود نداشت محصول جدید اضافه می‌کنیم
      const { error: insertError } = await clientSupabase
        .from("carts")
        .insert([
          { user_id: user.id, product_id: productId, quantity: quantity },
        ]);
      if (insertError) console.error("خطا", insertError);
    }
  } else {
    // بخش کاربر مهمان (لوکال استوریج)
    const cart = await getCart(); // خواندن از حافظه
    const existingItemIndex = cart.findIndex(
      (item) => String(item.id) === String(productId),
    );
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({ id: String(productId), quantity: quantity });
    }
    saveGuestCart(cart);
  }
  console.log("محصول به سبد خرید اضافه شد");
};
// ==========================================
// ۴. تابع کمکی: آپدیت نشانگر تعداد در هدر
// ==========================================
export const updateCartBadge = async () => {
  const cartBadge = document.querySelector("#cartBadge");
  if (!cartBadge) return;

  // اینجا ما فقط به تعداد کل محصولات در سبد (چه مهمان چه کاربر) نیاز داریم
  const cart = await getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartBadge.innerText = totalItems;
  cartBadge.setAttribute("data-count", totalItems);
};
