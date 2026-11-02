import { clientSupabase } from "./auth.js";
const displayName = document.querySelector("#profile-display-name");
const displayEmail = document.querySelector("#profile-display-email");
const cardName = document.querySelector("#card-name");
const cardEmail = document.querySelector("#card-email");
const cardPhon = document.querySelector("#card-phone");

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
    const phone = user.user_metadata?.phone || "ثبت نشده";

    if (displayName) displayName.innerText = fullName;
    if (displayEmail) displayEmail.innerText = email;
    if (cardName) cardName.innerText = fullName;
    if (cardEmail) cardEmail.innerText = email;
    if (cardPhon) cardPhon.innerText = phone;
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

document.addEventListener("DOMContentLoaded", () => {
  loadProfileData();
});
