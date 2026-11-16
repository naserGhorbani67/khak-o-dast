import { clientSupabase } from "./auth.js";
import { addToCart, updateCartBadge } from "./shoping-cart-logic.js";
const mainImage = document.querySelector("#mainImage");
const productName = document.querySelector("#productName");
const productPrice = document.querySelector("#productPrice");
const productDescription = document.querySelector("#productDescription");
const breadcrumbCategory = document.querySelector("#breadcrumbCategory");
//دکمه های افزایش و کاهش تعداد محصول
const increaseQtyBtn = document.querySelector("#increaseQty");
const decreaseQtyBtn = document.querySelector("#decreaseQty");
const quantityDisplay = document.querySelector("#quantityDisplay");
const addToCartBtn = document.querySelector("#addToCartBtn");

const initProductDetailPage = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.location.href = "products.html";
    return;
  }
  try {
    const { data: product, error } = await clientSupabase
      .from("products") //نام جدول
      .select("*") //همه ستون ها را بگیر
      .eq("id", productId) // جایی که ستون id برابر با آیدی ما باشد
      .single(); //فقط یک محصول را برگردان
    if (error) throw error;

    if (!product) {
      console.log("محصولی با این آیدی یافت نشد!");
      window.location.href = "products.html";
      return;
    }
    // قراردادن اطلاعات محصولات در آن المان‌ها
    if (mainImage && product.image_url) {
      mainImage.src = product.image_url;
      mainImage.alt = product.name;
    }
    if (productName) {
      productName.innerText = product.name;
    }
    if (productPrice) {
      productPrice.innerText = product.price.toLocaleString("fa-IR");
    }
    if (productDescription) {
      productDescription.innerText =
        product.description || "توضیحاتی برای این محصول ثبت نشده است";
    }
    if (breadcrumbCategory) {
      breadcrumbCategory.innerText = product.category;
    }
    // ==========================================
    // بخش مدیریت دکمه‌های تعداد و خرید
    // ==========================================

    // متغیری برای نگه داشتن تعداد فعلی (پیش‌فرض ۱)
    let quantity = 1;

    // ۲. عملکرد دکمه کاهش (-)
    decreaseQtyBtn?.addEventListener("click", () => {
      if (quantity > 1) {
        quantity--;
        quantityDisplay.innerText = quantity;
      }
    });

    // ۳. عملکرد دکمه افزایش (+)
    increaseQtyBtn?.addEventListener("click", () => {
      quantity++;
      quantityDisplay.innerText = quantity;
    });

    // ۴. عملکرد دکمه افزودن به سبد خرید
    addToCartBtn?.addEventListener("click", async () => {
      await addToCart(product.id, quantity);
      await updateCartBadge();

      // بازخورد بصری به کاربر
      const originalText = addToCartBtn.innerHTML;
      addToCartBtn.innerHTML = '<i class="fa-solid fa-check"></i>   اضافه شد';
      addToCartBtn.disabled = true;
      addToCartBtn.classList.add("disable");
      setTimeout(() => {
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.disabled = false;
        addToCartBtn.classList.remove("disable");
      }, 2000);
    });
    console.log("اطلاعات محصول", product);
  } catch (error) {
    console.error("خطا در دریافت اطلاعات محصول", error.message);
    alert("خطا در دریافت اطلاعات محصول");
    window.location.href = "products.html";
  }
};

document.addEventListener("DOMContentLoaded", initProductDetailPage);
