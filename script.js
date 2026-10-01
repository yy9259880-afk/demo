/* =========================================================
   NIXO — Premium E-commerce Demo
   Built by NEXORA
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const CART_STORAGE_KEY = "nixoCart";

const NIXO_INSTAGRAM = "https://www.instagram.com/nixo_c.o/";

/* =========================================================
   PRODUCTS
   ========================================================= */

const products = [
  {
    id: "nixo-classic-black",
    name: "NIXO Classic Black",
    price: 299,
    category: "Men",
    description:
      "A timeless black watch designed for everyday elegance.",
  },
  {
    id: "nixo-silver-one",
    name: "NIXO Silver One",
    price: 349,
    category: "Men",
    description:
      "Clean silver design with a refined modern finish.",
  },
  {
    id: "nixo-rose",
    name: "NIXO Rose",
    price: 279,
    category: "Women",
    description:
      "A delicate rose-tone watch made to complete every look.",
  },
  {
    id: "nixo-minimal",
    name: "NIXO Minimal",
    price: 319,
    category: "Women",
    description:
      "Minimal design, subtle details and effortless style.",
  },
];

/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/* =========================================================
   STATE
   ========================================================= */

let cart = loadCart();

let currentQuickViewProduct = null;

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initSearch();
  initCart();
  initProductCards();
  initQuickView();
  initMobileMenu();
  initScrollBehavior();
  initEscapeKey();
  renderCart();
  updateCartCount();
  setupProductData();
});

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsed = JSON.parse(savedCart);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.warn("Could not load cart:", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("Could not save cart:", error);
  }
}

/* =========================================================
   PRODUCT DATA
   ========================================================= */

function setupProductData() {
  const cards = $$(".product-card");

  cards.forEach((card, index) => {
    const product = products[index];

    if (!product) {
      return;
    }

    card.dataset.productId = product.id;
    card.dataset.name = product.name;
    card.dataset.price = product.price;
    card.dataset.category = product.category;
  });
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function initNavigation() {
  const searchBtn = $("#searchBtn");
  const cartBtn = $("#cartBtn");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      openSearch();
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      openCart();
    });
  }

  $$(".nav-link, .mobile-nav-link, [data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) {
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      closeMobileMenu();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
}

/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  const mobileClose = $("#mobileClose");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      openMobileMenu();
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener("click", () => {
      closeMobileMenu();
    });
  }

  if (mobileMenu) {
    mobileMenu.addEventListener("click", (event) => {
      if (event.target === mobileMenu) {
        closeMobileMenu();
      }
    });
  }
}

function openMobileMenu() {
  const mobileMenu = $("#mobileMenu");

  if (!mobileMenu) {
    return;
  }

  mobileMenu.classList.add("active");
  document.body.classList.add("no-scroll");
}

function closeMobileMenu() {
  const mobileMenu = $("#mobileMenu");

  if (!mobileMenu) {
    return;
  }

  mobileMenu.classList.remove("active");

  if (!isOverlayOpen()) {
    document.body.classList.remove("no-scroll");
  }
}

/* =========================================================
   SEARCH
   ========================================================= */

function initSearch() {
  const searchModal = $("#searchModal");
  const searchClose = $("#searchClose");
  const searchInput = $("#searchInput");

  if (searchClose) {
    searchClose.addEventListener("click", () => {
      closeSearch();
    });
  }

  if (searchModal) {
    searchModal.addEventListener("click", (event) => {
      if (event.target === searchModal) {
        closeSearch();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      performSearch(searchInput.value);
    });
  }
}

function openSearch() {
  const searchModal = $("#searchModal");
  const searchInput = $("#searchInput");

  if (!searchModal) {
    return;
  }

  searchModal.classList.add("active");
  document.body.classList.add("no-scroll");

  if (searchInput) {
    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }

  performSearch("");
}

function closeSearch() {
  const searchModal = $("#searchModal");

  if (!searchModal) {
    return;
  }

  searchModal.classList.remove("active");

  if (!isOverlayOpen()) {
    document.body.classList.remove("no-scroll");
  }
}

function performSearch(query) {
  const resultsContainer = $("#searchResults");

  if (!resultsContainer) {
    return;
  }

  const normalizedQuery = query.trim().toLowerCase();

  let matches = products;

  if (normalizedQuery) {
    matches = products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }

  if (!matches.length) {
    resultsContainer.innerHTML = `
      <div class="search-empty">
        <p>No products found.</p>
        <span>Try another search.</span>
      </div>
    `;

    return;
  }

  resultsContainer.innerHTML = matches
    .map((product) => {
      return `
        <button
          type="button"
          class="search-result"
          data-search-product="${escapeHTML(product.id)}"
        >
          <div class="search-result-image">
            <span>NIXO</span>
          </div>

          <div class="search-result-info">
            <span class="search-result-category">
              ${escapeHTML(product.category)}
            </span>

            <strong>
              ${escapeHTML(product.name)}
            </strong>

            <span>
              ${formatPrice(product.price)}
            </span>
          </div>
        </button>
      `;
    })
    .join("");

  $$(".search-result", resultsContainer).forEach((result) => {
    result.addEventListener("click", () => {
      const productId = result.dataset.searchProduct;
      const product = getProductById(productId);

      if (!product) {
        return;
      }

      closeSearch();
      openProductModal(product);
    });
  });
}

/* =========================================================
   PRODUCT CARDS
   ========================================================= */

function initProductCards() {
  $$(".product-card").forEach((card) => {
    const quickViewButton = $(".quick-view", card);
    const addCartButton = $(".add-cart", card);

    if (quickViewButton) {
      quickViewButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const product = getProductFromCard(card);

        if (product) {
          openProductModal(product);
        }
      });
    }

    if (addCartButton) {
      addCartButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const product = getProductFromCard(card);

        if (product) {
          addToCart(product);
          animateAddButton(addCartButton);
        }
      });
    }

    card.addEventListener("click", (event) => {
      if (
        event.target.closest(".quick-view") ||
        event.target.closest(".add-cart") ||
        event.target.closest("button") ||
        event.target.closest("a")
      ) {
        return;
      }

      const product = getProductFromCard(card);

      if (product) {
        openProductModal(product);
      }
    });
  });
}

function getProductFromCard(card) {
  if (!card) {
    return null;
  }

  const productId = card.dataset.productId;

  if (productId) {
    const product = getProductById(productId);

    if (product) {
      return product;
    }
  }

  const name = card.dataset.name;
  const price = Number(card.dataset.price);
  const category = card.dataset.category;

  if (!name || !price) {
    return null;
  }

  return {
    id: slugify(name),
    name,
    price,
    category: category || "Collection",
    description: "Premium NIXO watch.",
  };
}

function getProductById(id) {
  return products.find((product) => product.id === id);
}

/* =========================================================
   QUICK VIEW / PRODUCT MODAL
   ========================================================= */

function initQuickView() {
  const productModal = $("#productModal");
  const productClose = $("#productClose");
  const modalAdd = $("#modalAdd");

  if (productClose) {
    productClose.addEventListener("click", () => {
      closeProductModal();
    });
  }

  if (productModal) {
    productModal.addEventListener("click", (event) => {
      if (event.target === productModal) {
        closeProductModal();
      }
    });
  }

  if (modalAdd) {
    modalAdd.addEventListener("click", () => {
      if (!currentQuickViewProduct) {
        return;
      }

      addToCart(currentQuickViewProduct);

      const originalText = modalAdd.textContent;

      modalAdd.textContent = "ADDED ✓";

      setTimeout(() => {
        modalAdd.textContent = originalText || "ADD TO CART";
      }, 1200);
    });
  }
}

function openProductModal(product) {
  const productModal = $("#productModal");

  if (!productModal || !product) {
    return;
  }

  currentQuickViewProduct = product;

  const modalCategory = $("#modalCategory");
  const modalName = $("#modalName");
  const modalPrice = $("#modalPrice");

  if (modalCategory) {
    modalCategory.textContent = product.category;
  }

  if (modalName) {
    modalName.textContent = product.name;
  }

  if (modalPrice) {
    modalPrice.textContent = formatPrice(product.price);
  }

  const modalDescription = $("#modalDescription");

  if (modalDescription) {
    modalDescription.textContent = product.description;
  }

  productModal.classList.add("active");
  document.body.classList.add("no-scroll");
}

function closeProductModal() {
  const productModal = $("#productModal");

  if (!productModal) {
    return;
  }

  productModal.classList.remove("active");

  if (!isOverlayOpen()) {
    document.body.classList.remove("no-scroll");
  }

  currentQuickViewProduct = null;
}

/* =========================================================
   CART
   ========================================================= */

function initCart() {
  const cartOverlay = $("#cartOverlay");
  const cartClose = $("#cartClose");
  const checkoutBtn = $("#checkoutBtn");
  const emptyCartShop = $("#emptyCartShop");

  if (cartClose) {
    cartClose.addEventListener("click", () => {
      closeCart();
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", (event) => {
      if (event.target === cartOverlay) {
        closeCart();
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      checkout();
    });
  }

  if (emptyCartShop) {
    emptyCartShop.addEventListener("click", () => {
      closeCart();

      const productsSection =
        $("#shop") ||
        $("#products") ||
        $("#collection") ||
        $("#featured");

      if (productsSection) {
        setTimeout(() => {
          productsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 150);
      }
    });
  }
}

function openCart() {
  const cartOverlay = $("#cartOverlay");

  if (!cartOverlay) {
    return;
  }

  renderCart();

  cartOverlay.classList.add("active");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  const cartOverlay = $("#cartOverlay");

  if (!cartOverlay) {
    return;
  }

  cartOverlay.classList.remove("active");

  if (!isOverlayOpen()) {
    document.body.classList.remove("no-scroll");
  }
}

function addToCart(product) {
  if (!product) {
    return;
  }

  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      category: product.category,
      quantity: 1,
    });
  }

  saveCart();
  updateCartCount();
  renderCart();

  showToast(`${product.name} added to cart`);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);

  saveCart();
  updateCartCount();
  renderCart();
}

function increaseQuantity(productId) {
  const item = cart.find((product) => product.id === productId);

  if (!item) {
    return;
  }

  item.quantity += 1;

  saveCart();
  updateCartCount();
  renderCart();
}

function decreaseQuantity(productId) {
  const item = cart.find((product) => product.id === productId);

  if (!item) {
    return;
  }

  item.quantity -= 1;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCartCount();
  renderCart();
}

function clearCart() {
  cart = [];

  saveCart();
  updateCartCount();
  renderCart();
}

function getCartCount() {
  return cart.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    return total + Number(item.price) * Number(item.quantity || 0);
  }, 0);
}

function updateCartCount() {
  const cartCount = $("#cartCount");

  if (!cartCount) {
    return;
  }

  const count = getCartCount();

  cartCount.textContent = count;

  if (count > 0) {
    cartCount.classList.add("active");
  } else {
    cartCount.classList.remove("active");
  }
}

function renderCart() {
  const cartItems = $("#cartItems");
  const cartTotal = $("#cartTotal");
  const checkoutBtn = $("#checkoutBtn");

  if (!cartItems) {
    return;
  }

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">⌚</div>

        <h3>Your cart is empty</h3>

        <p>
          Discover the NIXO collection and find your next watch.
        </p>
      </div>
    `;

    if (cartTotal) {
      cartTotal.textContent = formatPrice(0);
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = true;
    }

    return;
  }

  cartItems.innerHTML = cart
    .map((item) => {
      return `
        <div class="cart-item" data-cart-id="${escapeHTML(item.id)}">

          <div class="cart-item-image">
            <span>NIXO</span>
          </div>

          <div class="cart-item-info">

            <div class="cart-item-top">
              <div>
                <span class="cart-item-category">
                  ${escapeHTML(item.category || "Collection")}
                </span>

                <h4>
                  ${escapeHTML(item.name)}
                </h4>
              </div>

              <button
                type="button"
                class="cart-remove"
                data-remove-cart="${escapeHTML(item.id)}"
                aria-label="Remove item"
              >
                ×
              </button>
            </div>

            <div class="cart-item-bottom">

              <strong>
                ${formatPrice(item.price)}
              </strong>

              <div class="cart-quantity">

                <button
                  type="button"
                  data-decrease="${escapeHTML(item.id)}"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>
                  ${item.quantity}
                </span>

                <button
                  type="button"
                  data-increase="${escapeHTML(item.id)}"
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

            </div>

          </div>

        </div>
      `;
    })
    .join("");

  if (cartTotal) {
    cartTotal.textContent = formatPrice(getCartTotal());
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = false;
  }

  bindCartActions();
}

function bindCartActions() {
  $$("[data-remove-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.removeCart;

      removeFromCart(productId);
    });
  });

  $$("[data-increase]").forEach((button) => {
    button.addEventListener("click", () => {
      increaseQuantity(button.dataset.increase);
    });
  });

  $$("[data-decrease]").forEach((button) => {
    button.addEventListener("click", () => {
      decreaseQuantity(button.dataset.decrease);
    });
  });
}

/* =========================================================
   CHECKOUT / ORDER
   ========================================================= */

function checkout() {
  if (!cart.length) {
    showToast("Your cart is empty.");
    return;
  }

  const orderLines = cart
    .map((item) => {
      return `${item.name} x${item.quantity} — ${formatPrice(
        item.price * item.quantity
      )}`;
    })
    .join("\n");

  const total = formatPrice(getCartTotal());

  const message =
    `NIXO ORDER DEMO\n\n` +
    `${orderLines}\n\n` +
    `Total: ${total}`;

  /*
   * DEMO FLOW
   *
   * Since this is a NEXORA demo website,
   * the order can be redirected to NIXO Instagram.
   */

  const confirmed = window.confirm(
    `${message}\n\nContinue to NIXO Instagram to place the order?`
  );

  if (!confirmed) {
    return;
  }

  window.open(NIXO_INSTAGRAM, "_blank", "noopener,noreferrer");
}

/* =========================================================
   BUTTON ANIMATION
   ========================================================= */

function animateAddButton(button) {
  if (!button) {
    return;
  }

  const originalText =
    button.dataset.originalText || button.textContent.trim();

  button.dataset.originalText = originalText;

  button.textContent = "ADDED ✓";
  button.classList.add("added");

  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("added");
  }, 1200);
}

/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {
  let toast = $("#nixoToast");

  if (!toast) {
    toast = document.createElement("div");

    toast.id = "nixoToast";

    toast.innerHTML = `
      <span class="nixo-toast-message"></span>
    `;

    document.body.appendChild(toast);

    injectToastStyles();
  }

  const messageElement = $(".nixo-toast-message", toast);

  if (messageElement) {
    messageElement.textContent = message;
  }

  toast.classList.add("show");

  clearTimeout(window.nixoToastTimer);

  window.nixoToastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function injectToastStyles() {
  if ($("#nixo-toast-styles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "nixo-toast-styles";

  style.textContent = `
    #nixoToast {
      position: fixed;
      left: 50%;
      bottom: 28px;
      transform: translate(-50%, 20px);
      opacity: 0;
      pointer-events: none;
      z-index: 99999;
      background: #111;
      color: #fff;
      border: 1px solid rgba(255,255,255,.15);
      padding: 13px 18px;
      border-radius: 999px;
      font-size: 13px;
      letter-spacing: .02em;
      box-shadow: 0 15px 40px rgba(0,0,0,.3);
      transition:
        opacity .25s ease,
        transform .25s ease;
    }

    #nixoToast.show {
      opacity: 1;
      transform: translate(-50%, 0);
    }

    #nixoToast .nixo-toast-message {
      white-space: nowrap;
    }

    .cart-quantity {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cart-quantity button {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.15);
      background: transparent;
      color: inherit;
      cursor: pointer;
    }

    .cart-remove {
      border: 0;
      background: transparent;
      color: inherit;
      font-size: 22px;
      cursor: pointer;
      opacity: .6;
    }

    .cart-remove:hover {
      opacity: 1;
    }

    .search-result {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 14px;
      text-align: left;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 12px;
      border-radius: 12px;
    }

    .search-result:hover {
      background: rgba(255,255,255,.06);
    }

    .search-result-image {
      width: 58px;
      height: 58px;
      flex: 0 0 58px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #151515;
      font-size: 9px;
      letter-spacing: .12em;
    }

    .search-result-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .search-result-info strong {
      font-size: 14px;
    }

    .search-result-info > span:last-child {
      font-size: 13px;
      opacity: .65;
    }

    .search-result-category {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .12em;
      opacity: .5;
    }

    .search-empty {
      text-align: center;
      padding: 40px 20px;
      opacity: .7;
    }

    .empty-cart {
      text-align: center;
      padding: 50px 20px;
      opacity: .75;
    }

    .empty-cart-icon {
      font-size: 34px;
      margin-bottom: 15px;
    }

    .empty-cart h3 {
      margin-bottom: 8px;
    }

    .empty-cart p {
      font-size: 13px;
      line-height: 1.6;
    }

    #modalAdd:disabled,
    #checkoutBtn:disabled {
      opacity: .45;
      cursor: not-allowed;
    }
  `;

  document.head.appendChild(style);
}

/* =========================================================
   SCROLL BEHAVIOR
   ========================================================= */

function initScrollBehavior() {
  const header = document.querySelector("header");

  if (!header) {
    return;
  }

  let lastScrollY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 30) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      lastScrollY = currentScrollY;
    },
    {
      passive: true,
    }
  );
}

/* =========================================================
   ESCAPE KEY
   ========================================================= */

function initEscapeKey() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeSearch();
    closeCart();
    closeProductModal();
    closeMobileMenu();
  });
}

/* =========================================================
   OVERLAY CHECK
   ========================================================= */

function isOverlayOpen() {
  const overlays = [
    "#searchModal",
    "#cartOverlay",
    "#productModal",
    "#mobileMenu",
  ];

  return overlays.some((selector) => {
    const element = $(selector);

    if (!element) {
      return false;
    }

    return element.classList.contains("active");
  });
}

/* =========================================================
   UTILITIES
   ========================================================= */

function formatPrice(price) {
  const numericPrice = Number(price) || 0;

  return `${numericPrice.toLocaleString("fr-MA")} MAD`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   GLOBAL HELPERS
   ========================================================= */

window.NIXO = {
  products,
  getCart: () => [...cart],
  addToCart,
  removeFromCart,
  clearCart,
  openCart,
  closeCart,
  openSearch,
  closeSearch,
  openProductModal,
  closeProductModal,
};

/* =========================================================
   END
   ========================================================= */