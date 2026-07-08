const state = {
  products: [],
  categories: [],
  cart: []
};

const els = {
  productGrid: document.getElementById("productGrid"),
  productCount: document.getElementById("productCount"),
  productLoading: document.getElementById("productLoading"),
  productError: document.getElementById("productError"),
  categoryFilter: document.getElementById("categoryFilter"),
  sizeFilter: document.getElementById("sizeFilter"),
  searchInput: document.getElementById("searchInput"),
  resetFilters: document.getElementById("resetFilters"),
  cartItems: document.getElementById("cartItems"),
  cartCount: document.getElementById("cartCount"),
  cartSubtotal: document.getElementById("cartSubtotal"),
  cartShipping: document.getElementById("cartShipping"),
  cartTotal: document.getElementById("cartTotal"),
  checkoutBtn: document.getElementById("checkoutBtn")
};

function setLoading(isLoading) {
  if (isLoading) {
    els.productLoading.classList.remove("d-none");
    return true;
  }
  els.productLoading.classList.add("d-none");
  return false;
}

function setError(message) {
  if (!message) {
    els.productError.classList.add("d-none");
    els.productError.textContent = "";
    return "";
  }
  els.productError.textContent = message;
  els.productError.classList.remove("d-none");
  return message;
}

function fillSelect(select, options) {
  let html = "";
  let index = 0;
  while (index < options.length) {
    html += `<option value="${options[index].id}">${options[index].name}</option>`;
    index += 1;
  }
  select.innerHTML = html;
  return html;
}

function getCategoryOptions() {
  if (state.categories.length > 0) {
    return state.categories.map((category) => ({
      id: category.name || category.id,
      name: category.name || category.id
    }));
  }

  const names = [...new Set(state.products.map((product) => product.category).filter(Boolean))];
  return names.map((name) => ({ id: name, name }));
}

function initFilters() {
  const sizes = [...new Set(state.products.flatMap((product) => product.sizes))];
  fillSelect(els.categoryFilter, [{ id: "all", name: "Tất cả danh mục" }, ...getCategoryOptions()]);
  fillSelect(els.sizeFilter, [{ id: "all", name: "Tất cả size" }, ...sizes.map((size) => ({ id: size, name: size }))]);
}

function getFilteredProducts() {
  const query = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const size = els.sizeFilter.value;

  return state.products.filter((product) => {
    const matchesSearch = !query || `${product.name} ${product.description}`.toLowerCase().includes(query);
    const matchesCategory = category === "all" || product.category === category;
    const matchesSize = size === "all" || product.sizes.includes(size);

    if (matchesSearch && matchesCategory && matchesSize) {
      return true;
    }
    return false;
  });
}

function renderProducts() {
  const products = getFilteredProducts();
  els.productCount.textContent = `${products.length} sản phẩm`;

  if (products.length === 0) {
    els.productGrid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-secondary mb-0">Không có sản phẩm phù hợp.</div>
      </div>
    `;
    return products;
  }

  els.productGrid.innerHTML = products.map((product) => `
    <div class="col-12 col-md-6 col-lg-4">
      <article class="card h-100 border-0 shadow-sm product-card">
        <img class="card-img-top product-img" src="${product.image}" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <span class="badge text-bg-danger">${product.category}</span>
            <span class="badge text-bg-light">Tồn ${product.stock}</span>
          </div>
          <h3 class="h5 fw-bold">${product.name}</h3>
          <p class="card-text text-secondary">${product.description || "Chưa có mô tả."}</p>
          <div class="mb-3">${product.sizes.map((size) => `<span class="badge text-bg-light me-1">${size}</span>`).join("")}</div>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <strong>${FashionUtils.formatMoney(product.price)}</strong>
            <button class="btn btn-danger btn-sm" type="button" data-add="${product.id}">Thêm</button>
          </div>
        </div>
      </article>
    </div>
  `).join("");

  return products;
}

function findProduct(productId) {
  return state.products.find((product) => String(product.id) === String(productId));
}

function addToCart(productId) {
  const product = findProduct(productId);
  if (!product) return false;

  if (product.stock <= 0) {
    FashionUtils.showToast("Sản phẩm đã hết hàng.");
    return false;
  }

  const existing = state.cart.find((item) => String(item.id) === String(productId));
  if (existing) {
    if (existing.quantity >= product.stock) {
      FashionUtils.showToast("Số lượng đã bằng tồn kho.");
      return false;
    }
    existing.quantity += 1;
  } else {
    state.cart.push({ id: product.id, quantity: 1 });
  }

  renderCart();
  FashionUtils.showToast("Đã thêm vào giỏ hàng.");
  return true;
}

function updateQuantity(productId, delta) {
  const product = findProduct(productId);
  const cartItem = state.cart.find((item) => String(item.id) === String(productId));
  if (!product || !cartItem) return false;

  cartItem.quantity += delta;
  if (cartItem.quantity <= 0) {
    state.cart = state.cart.filter((item) => String(item.id) !== String(productId));
  } else if (cartItem.quantity > product.stock) {
    cartItem.quantity = product.stock;
  }

  renderCart();
  return true;
}

function renderCart() {
  let subtotal = 0;

  if (state.cart.length === 0) {
    $("#cartItems").html(`<div class="alert alert-secondary mb-0">Giỏ hàng đang trống.</div>`);
  } else {
    let html = "";
    for (let i = 0; i < state.cart.length; i += 1) {
      const cartItem = state.cart[i];
      const product = findProduct(cartItem.id);
      if (product) {
        subtotal += product.price * cartItem.quantity;
        html += `
          <div class="list-group-item d-flex align-items-center gap-3">
            <img class="cart-thumb" src="${product.image}" alt="${product.name}">
            <div class="flex-grow-1">
              <strong>${product.name}</strong>
              <div class="text-secondary small">${FashionUtils.formatMoney(product.price)}</div>
            </div>
            <div class="btn-group btn-group-sm" role="group" aria-label="Số lượng">
              <button class="btn btn-outline-secondary" type="button" data-qty="${product.id}" data-delta="-1">-</button>
              <span class="btn btn-light disabled">${cartItem.quantity}</span>
              <button class="btn btn-outline-secondary" type="button" data-qty="${product.id}" data-delta="1">+</button>
            </div>
          </div>
        `;
      }
    }
    $("#cartItems").html("").append(html);
  }

  const shipping = subtotal > 0 && subtotal < 900000 ? 30000 : 0;
  els.cartCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  els.cartSubtotal.textContent = FashionUtils.formatMoney(subtotal);
  els.cartShipping.textContent = FashionUtils.formatMoney(shipping);
  els.cartTotal.textContent = FashionUtils.formatMoney(subtotal + shipping);
  return subtotal + shipping;
}

function loadProducts() {
  setLoading(true);
  setError("");

  return FashionApi.getProducts()
    .then((products) => {
      state.products = products;
      return FashionApi.getCategories();
    })
    .then((categories) => {
      state.categories = categories;
      initFilters();
      renderProducts();
      $("#productGrid").attr("data-loaded", "true").hide().fadeIn(250);
    })
    .catch((error) => {
      setError(`${error.message}. Hãy kiểm tra API_BASE_URL trong js/api.js và resource MockAPI.`);
    })
    .finally(() => {
      setLoading(false);
    });
}

function bindEvents() {
  els.searchInput.addEventListener("input", renderProducts);
  els.categoryFilter.addEventListener("change", renderProducts);
  els.sizeFilter.addEventListener("change", renderProducts);
  els.resetFilters.addEventListener("click", () => {
    $("#searchInput").val("");
    $("#categoryFilter").val("all");
    $("#sizeFilter").val("all");
    renderProducts();
  });

  els.productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(button.dataset.add);
  });

  els.cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-qty]");
    if (button) updateQuantity(button.dataset.qty, Number(button.dataset.delta));
  });

  els.checkoutBtn.addEventListener("click", () => {
    if (state.cart.length === 0) {
      FashionUtils.showToast("Giỏ hàng đang trống.");
      return;
    }
    state.cart = [];
    renderCart();
    FashionUtils.showToast("Đặt hàng mẫu thành công.");
  });

  $("#openCartBtn").on("click", () => {
    $("#cartPanel").hide().slideDown(180);
  });

  $("#resetFilters").click(() => {
    $("#productGrid").hide().fadeIn(180);
  });
}

bindEvents();
renderCart();
loadProducts();
