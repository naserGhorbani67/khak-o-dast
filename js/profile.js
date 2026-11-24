import { clientSupabase } from "./auth.js";
// users information elems
const displayName = document.querySelector("#profile-display-name");
const displayEmail = document.querySelector("#profile-display-email");
const cardName = document.querySelector("#card-name");
const cardEmail = document.querySelector("#card-email");
const cardPhon = document.querySelector("#card-phone");
// orders information elems
const ordersContainer = document.querySelector("#orders-container");
const emptyOrdersState = document.querySelector("#empty-orders-state");
const messageEmptyOrdersState = document.querySelector("#empty-orders-state p");
// address information elems
const addressContainer = document.querySelector("#address-container");
const emptyAddressState = document.querySelector("#empty-address-state");
const messageEmptyAddressState = document.querySelector(
  "#empty-address-state p",
);

const loadProfileData = async () => {
  try {
    if (!navigator.onLine) {
      throw new Error("آفلاین");
    }
    const {
      data: { user },
      error,
    } = await clientSupabase.auth.getUser();
    if (error) throw error;
    // route protection محافظت از صفحه
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    const fullName = user.user_metadata?.full_name || "کاربر عزیز";
    const email = user.email || " ایمیل ثبت نشده";

    // گرفتن شماره تماس از آخرین سفارش ثبت‌شده
    let phone = "ثبت‌ نشده";
    const { data: latestOrders, error: orderError } = await clientSupabase
      .from("orders")
      .select("phone")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!orderError && latestOrders && latestOrders.length > 0) {
      if (latestOrders[0]) {
        phone = latestOrders[0].phone;
      }
    }

    if (displayName) displayName.innerText = fullName;
    if (displayEmail) displayEmail.innerText = email;
    if (cardName) cardName.innerText = fullName;
    if (cardEmail) cardEmail.innerText = email;
    if (cardPhon) cardPhon.innerText = phone;
    await loadUserOrders(user.id);
  } catch (error) {
    console.error("خطا در بارگذاری اطلاعات پروفایل", error.message);
    if (error.message === "Auth session missing!") {
      window.location.href = "login.html";
    }
    if (!navigator.onLine) {
      return;
    }
  }
};
// تابع دریافت و نمایش سفارش‌ها
const loadUserOrders = async (userId) => {
  try {
    const { data: orders, error } = await clientSupabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    // اگر کاربر سفارشی نداشت
    if (!orders || orders.length === 0) {
      if (emptyOrdersState) emptyOrdersState.style.display = "flex";
      if (emptyAddressState) emptyAddressState.style.display = "flex";
      messageEmptyOrdersState.innerText = "هنوز هیچ سفارشی ثبت نکرده‌اید.";
      messageEmptyAddressState.innerText = "هنوز هیچ آدرسی ثبت نکرده‌اید.";
      return;
    }
    // اگر کاربر سفارش داشت
    if (emptyOrdersState) emptyOrdersState.style.display = "none";

    let ordersHTML = "";
    orders.forEach((order) => {
      const orderDate = new Date(order.created_at).toLocaleString("fa-IR");
      const totalPrice = order.total_price.toLocaleString("fa-IR");
      // تعیین وضعیت و کلاس مربوطه
      let statusText = "در حال پردازش";
      let statusClass = "status-pending";
      if (order.status === "paid") {
        statusText = "پرداخت شده";
        statusClass = "status-paid";
      } else if (order.status === "shipped") {
        statusText = "ارسال شده";
        statusClass = "status-shipped";
      }

      ordersHTML += `
      <div class="order-card">
          <div class="order-card-header">
            <span>کد سفارش: ${order.id.slice(0, 8)}</span>
            <span class="order-status ${statusClass}">${statusText}</span>
          </div>
          <div class="order-card-body">
            <span>تاریخ: ${orderDate}</span>
            <span>مبلغ: ${totalPrice} تومان</span>
          </div>
          <div class="order-card-footer">
          <a href="order-details.html?id=${order.id}" class="btn-view-details">مشاهده جزئیات</a>
          </div>
        </div>
      `;
    });
    // تزریق به HTML
    if (ordersContainer) {
      ordersContainer.innerHTML = ordersHTML;
    }

    // دریافت و نمایش آدرس‌های یکتای کاربر
    let addresses = [];
    orders.forEach((order) => {
      // اگر آدرس وجود داشت و قبلا به لیست اضافه نشده بود
      if (
        order.address &&
        !addresses.some((a) => order.address === a.address)
      ) {
        addresses.push({
          recipientName: order.recipient_name,
          phone: order.phone,
          address: order.address,
          postalCode: order.postal_code,
        });
      }
    });
    let addressHTML = "";
    // اگر هیچ آدرسی نبود
    if (addresses.length === 0) {
      if (emptyAddressState) emptyAddressState.style.display = "flex";
      messageEmptyAddressState.innerText = "هنوز هیچ آدرسی ثبت نکرده‌اید ";
    } else {
      if (emptyAddressState) emptyAddressState.style.display = "none";
      addresses.forEach((addr) => {
        addressHTML += `
        <div class="address-card">
          <div class="address-card-header">
            <span>${addr.recipientName}</span>
            <span>${addr.phone}</span>
          </div>
          <div class="address-card-body">
            <p>${addr.address}</p>
            <p>کد پستی: ${addr.postalCode}</p>
          </div>
        </div>
        `;
      });
      if (addressContainer) {
        addressContainer.innerHTML = addressHTML;
      }
    }
  } catch {
    console.error("خطا در دریافت سفارش‌ها:", error);
  }
};
document.addEventListener("DOMContentLoaded", () => {
  loadProfileData();
});
