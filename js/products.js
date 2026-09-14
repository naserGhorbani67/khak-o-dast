// ---------- داده محصولات ----------
// نکته: بعداً می‌تونید این آرایه رو با داده واقعی (یا fetch از یک JSON/API) جایگزین کنید.
const PRODUCTS = [
  {
    id: 1,
    name: "پارچ آب سفالی بزرگ",
    category: "کوزه",
    src: "./imges/images-parch.jpg",
    price: 890000,
  },
  {
    id: 2,
    name: "کوزه و گلدان ساده",
    category: "کوزه",
    src: "./imges/koozevagoldan.jpg",
    price: 620000,
  },
  {
    id: 3,
    name: " خمره سفالی پهن",
    category: "کوزه",
    price: 450000,
    src: "./imges/khomre-square-final.webp",
  },
  {
    id: 4,
    name: "گلدان کوچک رومیزی",
    category: "گلدان",
    src: "./imges/goldan va kooze.jpg",
    price: 210000,
  },
  {
    id: 5,
    name: "گلدان بزرگ باغچه‌ای",
    category: "گلدان",
    src: "./imges/goldan-baghchei.webp",
    price: 980000,
  },
  {
    id: 6,
    name: "مجسمه گِلی «مادر و کودک»",
    category: "مجسمه",
    src: "./imges/kate-baby-2.jpg",
    price: 1200000,
  },
  {
    id: 7,
    name: "مجسمه چهره انسان  ",
    category: "مجسمه",
    src: "./imges/human-face.webp",
    price: 340000,
  },
  {
    id: 8,
    name: "ست کاسه و بشقاب سفالی",
    category: "ظروف",
    src: "./imges/boshghab_kasse.jpg",
    price: 670000,
  },
  {
    id: 9,
    name: "فنجان سرامیکی طرح دار",
    category: "ظروف",
    src: "./imges/fenjan2.jpg",
    price: 180000,
  },
  {
    id: 10,
    name: "کاسه سرو سالاد لعاب سبز",
    category: "ظروف",
    src: "./imges/converted.webp",
    price: 390000,
  },
  {
    id: 11,
    name: "آویز دیواری طرح ماه اسفند  ",
    category: "ظروف",
    src: "./imges/aviz-divari.webp",
    price: 540000,
  },
  {
    id: 12,
    name: "لیوان لعابی طرح دار",
    category: "ظروف",
    src: "./imges/livan.webp",
    price: 310000,
  },
  {
    id: 13,
    name: "مجسمه نیم تنه انسان ",
    category: "مجسمه",
    src: "./imges/oldman-face.webp",
    price: 460000,
  },
  {
    id: 14,
    name: "ست لیوان و پارچ سفالی  ",
    category: "ظروف",
    src: "./imges/livanvaparch.webp",
    price: 500000,
  },
];

const CATEGORY_ICONS = {
  کوزه: '<path d="M30 30 Q28 20 50 18 Q72 20 70 30 L66 80 Q64 92 50 92 Q36 92 34 80 Z" fill="#FBF6EC" opacity="0.9"/>',
  گلدان:
    '<ellipse cx="50" cy="55" rx="26" ry="20" fill="#FBF6EC" opacity="0.9"/><rect x="40" y="30" width="20" height="14" rx="3" fill="#FBF6EC" opacity="0.9"/>',
  مجسمه:
    '<circle cx="50" cy="40" r="14" fill="#FBF6EC" opacity="0.9"/><path d="M36 54 Q50 92 64 54 Z" fill="#FBF6EC" opacity="0.9"/>',
  ظروف: '<ellipse cx="50" cy="60" rx="30" ry="10" fill="#FBF6EC" opacity="0.9"/><path d="M25 60 Q50 40 75 60" stroke="#FBF6EC" stroke-width="4" fill="none" opacity="0.9"/>',
};

const PAGE_SIZE = 8;

const state = {
  category: "همه",
  query: "",
  page: 1,
};

const grid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const resultsMeta = document.getElementById("resultsMeta");
const pagination = document.getElementById("pagination");
const chips = document.querySelectorAll(".chip");
const searchInput = document.getElementById("searchInput");

function formatPrice(n) {
  return n.toLocaleString("fa-IR");
}

function getFiltered() {
  return PRODUCTS.filter((p) => {
    const matchesCategory =
      state.category === "همه" || p.category === state.category;
    const matchesQuery = p.name.includes(state.query.trim());
    return matchesCategory && matchesQuery;
  });
}

function render() {
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);

  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  // متن نتایج
  resultsMeta.innerHTML = filtered.length
    ? `نمایش <strong>${pageItems.length}</strong> مورد از <strong>${filtered.length}</strong> محصول`
    : "";

  // کارت‌ها

  grid.innerHTML = pageItems
    .map(
      (p) => `
    <div class="product-card">
      <div class="product-image">
        ${
          p.src
            ? `<img src="${p.src}" alt="${p.name}" loading="lazy" />`
            : `<svg viewBox="0 0 100 100" fill="none">${CATEGORY_ICONS[p.category] || ""}</svg>`
        }
      </div>
      <div class="product-name">${p.name}</div>
      <div class="product-meta">
        <span> ${p.category}</span>
        <span class="product-price">${formatPrice(p.price)} ت</span>
      </div>
    </div>
  `,
    )
    .join("");

  emptyState.classList.toggle("hidden", filtered.length !== 0);
  grid.style.display = filtered.length ? "grid" : "none";

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn nav-arrow" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>‹ قبلی</button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
  }

  html += `<button class="page-btn nav-arrow" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""}>بعدی ›</button>`;

  pagination.innerHTML = html;

  pagination.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.page = Number(btn.dataset.page);
      render();
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ---------- رویدادها ----------
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    state.category = chip.dataset.category;
    state.page = 1;
    render();
  });
});

let debounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    state.query = searchInput.value;
    state.page = 1;
    render();
  }, 200);
});

// منوی موبایل (مشترک با صفحه اصلی)
// const navToggle = document.getElementById("navToggle");
// const navLinks = document.querySelector(".nav-links");
// if (navToggle){
//   navToggle.addEventListener("click", () => {
//     const open = navLinks.style.display === "flex";
//     navLinks.style.display = open ? "none" : "flex";
//     navLinks.style.cssText += open
//       ? ""
//       : "position:fixed; top:64px; right:20px; left:20px; background:#FBF6EC; flex-direction:column; padding:20px; border:1px solid var(--line); border-radius:10px; gap:18px; z-index:99;";
//   });
// }

render();
