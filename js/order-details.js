import { clientSupabase } from "./auth.js";

// انتخاب المان‌ها
const loadingState = document.querySelector("#loadingState");
const loadingStateMessage = document.querySelector("#loadingState p");
const orderContent = document.querySelector("#orderContent");
const orderItemsList = document.querySelector("#orderItemsList");

// اطلاعات کلی
const orderIdDisplay = document.querySelector("#orderIdDisplay");
const orderDateDisplay = document.querySelector("#orderDateDisplay");
const orderStatusDisplay = document.querySelector("#orderStatusDisplay");
const orderTotalPrice = document.querySelector("#orderTotalPrice");

// اطلاعات ارسال
const recipientName = document.querySelector("#recipientName");
const recipientPhone = document.querySelector("#recipientPhone");
const recipientPostalCode = document.querySelector("#recipientPostalCode");
const recipientAddress = document.querySelector("#recipientAddress");

const loadOrderDetails = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");
  if (!orderId) {
    window.location.href = "profile.html";
    return;
  }
  try {
    const { data: orderData, error: orderError } = await clientSupabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (orderError) throw orderError;
    if (!orderData) throw new Error("سفارش مورد نظر یافت نشد");

    //پرکردن اطلاعات کلی
    orderIdDisplay.innerText = orderData.id.slice(0, 8);
    const orderDate = new Date(orderData.created_at).toLocaleString("fa-IR");
    orderDateDisplay.innerText = orderDate;
    orderTotalPrice.innerText =
      orderData.total_price.toLocaleString("fa-IR") + "تومان";
    //   وضعیت سفارش
    let statusText = "در حال پردازش";
    let statusClass = "status-pending";
    if (orderData.status === "paid") {
      statusText = "پرداخت‌ شده";
      statusClass = "status-paid";
    }
    if (orderData.status === "shipped") {
      statusText = "ارسال شده";
      statusClass = "status-shipped";
    }
    orderStatusDisplay.innerText = statusText;
    orderStatusDisplay.classList.add(statusClass);
    // پرکردن اطلاعات ارسال
    recipientName.innerText = orderData.recipient_name;
    recipientPhone.innerText = orderData.phone;
    recipientPostalCode.innerText = orderData.postal_code;
    recipientAddress.innerText = orderData.address;

    // گرفتن محصولات هر سفارش از جدول order_items
    const { data: itemsData, error: itemsError } = await clientSupabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    if (itemsError) throw itemsError;

    // گرفتن اطلاعات محصولات (عکس و اسم) از جدول product
    let itemsHTML = "";
    if (itemsData && itemsData.length > 0) {
      const productIds = itemsData.map((item) => item.product_id);
      const { data: productsData, error: productsError } = await clientSupabase
        .from("products")
        .select("id,name,image_url")
        .in("id", productIds);
      if (productsError) throw productsError;

      // ساخت HTML برای هر محصول
      itemsData.forEach((item) => {
        const product = productsData.find((p) => p.id === item.product_id);
        const productName = product ? product.name : "محصول نامشخص";
        const productImage = product ? product.image_url : "";

        const itemTotal = (item.price * item.quantity).toLocaleString("fa-IR");
        const unitPrice = item.price.toLocaleString("fa-IR");

        itemsHTML += `
        <div class="order-item-row">
            <img src="${productImage}" alt="${productName}" class="item-image" />
            <div class="item-details">
              <span class="item-name">${productName}</span>
              <span class="item-meta">${item.quantity} عدد × ${unitPrice} تومان</span>
            </div>
            <div class="item-total-price">${itemTotal} تومان</div>
        </div>
        `;
      });
      orderItemsList.innerHTML = itemsHTML;

      // مخفی کردن لودینگ و نمایش محتوا
      loadingState.classList.add("hidden");
      orderContent.classList.remove("hidden");
    }
  } catch (error) {
    console.error("خطا در دریافت جزئیات فاکتور", error);
    loadingStateMessage.innerText =
      "خطا در دریافت اطلاعات! لطفا دوباره تلاش کنید";
  }
};
document.addEventListener("DOMContentLoaded", loadOrderDetails);
