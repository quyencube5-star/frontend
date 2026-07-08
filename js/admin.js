const adminState = {
  products: [],
  categories: [],
  deletingId: ""
};

const adminEls = {
  statsGrid: document.getElementById("statsGrid"),
  productForm: document.getElementById("productForm"),
  productId: document.getElementById("productId"),
  formTitle: document.getElementById("formTitle"),
  nameInput: document.getElementById("nameInput"),
  categoryInput: document.getElementById("categoryInput"),
  priceInput: document.getElementById("priceInput"),
  stockInput: document.getElementById("stockInput"),
  sizesInput: document.getElementById("sizesInput"),
  imageInput: document.getElementById("imageInput"),
  descriptionInput: document.getElementById("descriptionInput"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  submitBtn: document.getElementById("submitBtn"),
  productTable: document.getElementById("productTable"),
  adminLoading: document.getElementById("adminLoading"),
  adminError: document.getElementById("adminError"),
  reloadBtn: document.getElementById("reloadBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
  deleteProductName: document.getElementById("deleteProductName")
};

function setLoading(isLoading) {
  adminEls.adminLoading.classList.toggle("d-none", !isLoading);
  adminEls.submitBtn.disabled = isLoading;
  return isLoading;
}

function setError(message) {
  adminEls.adminError.textContent = message || "";
  adminEls.adminError.classList.toggle("d-none", !message);
  return message;
}

function showFieldError(input, errorId, message) {
  const error = document.getElementById(errorId);
  input.classList.toggle("is-invalid", Boolean(message));
  error.textContent = message || "";
  return !message;
}

function clearValidation() {
  showFieldError(adminEls.nameInput, "nameError", "");
  showFieldError(adminEls.categoryInput, "categoryError", "");
  showFieldError(adminEls.priceInput, "priceError", "");
  showFieldError(adminEls.stockInput, "stockError", "");
  showFieldError(adminEls.imageInput, "imageError", "");
  return true;
}

function validateForm() {
  clearValidation();
  const name = adminEls.nameInput.value.trim();
  const category = adminEls.categoryInput.value.trim();
  const price = Number(adminEls.priceInput.value);
  const stock = Number(adminEls.stockInput.value);
  const image = adminEls.imageInput.value.trim();
  let isValid = true;

  if (!name) {
    isValid = showFieldError(adminEls.nameInput, "nameError", "Tên sản phẩm không được để trống.") && isValid;
  }

  if (!category) {
    isValid = showFieldError(adminEls.categoryInput, "categoryError", "Vui lòng chọn danh mục.") && isValid;
  }

  if (!price || price <= 0) {
    isValid = showFieldError(adminEls.priceInput, "priceError", "Giá tiền phải lớn hơn 0.") && isValid;
  }

  if (Number.isNaN(stock) || stock < 0) {
    isValid = showFieldError(adminEls.stockInput, "stockError", "Tồn kho phải là số không âm.") && isValid;
  }

  if (!image || !FashionUtils.isValidUrl(image)) {
    isValid = showFieldError(adminEls.imageInput, "imageError", "URL ảnh phải hợp lệ và bắt đầu bằng http hoặc https.") && isValid;
  }

  return isValid;
}

function getFormData() {
  return {
    name: adminEls.nameInput.value.trim(),
    category: adminEls.categoryInput.value.trim(),
    price: Number(adminEls.priceInput.value),
    stock: Number(adminEls.stockInput.value),
    image: adminEls.imageInput.value.trim(),
    description: adminEls.descriptionInput.value.trim(),
    sizes: FashionUtils.splitList(adminEls.sizesInput.value).join(", ")
  };
}

function fillCategorySelect() {
  const options = adminState.categories.map((category) => {
    const name = category.name || category.id;
    return `<option value="${name}">${name}</option>`;
  });
  adminEls.categoryInput.innerHTML = `<option value="">Chọn danh mục</option>${options.join("")}`;
  return options.length;
}

function renderStats() {
  const totalStock = adminState.products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = adminState.products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const lowStock = adminState.products.filter((product) => product.stock <= 8).length;

  adminEls.statsGrid.innerHTML = `
    <div class="col-6"><div class="stat-card shadow-sm"><span>Sản phẩm</span><strong>${adminState.products.length}</strong></div></div>
    <div class="col-6"><div class="stat-card shadow-sm"><span>Tồn kho</span><strong>${totalStock}</strong></div></div>
    <div class="col-6"><div class="stat-card shadow-sm"><span>Sắp hết</span><strong>${lowStock}</strong></div></div>
    <div class="col-6"><div class="stat-card shadow-sm"><span>Giá trị</span><strong>${FashionUtils.formatMoney(inventoryValue)}</strong></div></div>
  `;
}

function renderProductTable() {
  if (adminState.products.length === 0) {
    adminEls.productTable.innerHTML = `<tr><td colspan="5" class="text-center text-secondary py-4">Chưa có sản phẩm.</td></tr>`;
    return 0;
  }

  adminEls.productTable.innerHTML = adminState.products.map((product) => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          <img class="table-img" src="${product.image}" alt="${product.name}">
          <div>
            <strong>${product.name}</strong>
            <div class="small text-secondary">${product.description || "Chưa có mô tả"}</div>
          </div>
        </div>
      </td>
      <td><span class="badge text-bg-light">${product.category}</span></td>
      <td>${FashionUtils.formatMoney(product.price)}</td>
      <td>${product.stock}</td>
      <td class="text-end">
        <button class="btn btn-outline-secondary btn-sm" type="button" data-edit="${product.id}">Sửa</button>
        <button class="btn btn-outline-danger btn-sm" type="button" data-delete="${product.id}">Xóa</button>
      </td>
    </tr>
  `).join("");

  return adminState.products.length;
}

function renderAdmin() {
  renderStats();
  renderProductTable();
}

function loadAdminData() {
  setLoading(true);
  setError("");

  return FashionApi.getCategories()
    .then((categories) => {
      adminState.categories = categories;
      fillCategorySelect();
      return FashionApi.getProducts();
    })
    .then((products) => {
      adminState.products = products;
      renderAdmin();
      $("#productTable").hide().fadeIn(220);
    })
    .catch((error) => {
      setError(`${error.message}. Hãy kiểm tra API_BASE_URL và 2 resource products/categories trên MockAPI.`);
    })
    .finally(() => {
      setLoading(false);
    });
}

function resetForm() {
  adminEls.productForm.reset();
  adminEls.productId.value = "";
  adminEls.formTitle.textContent = "Thêm sản phẩm";
  clearValidation();
  return true;
}

function saveProduct(event) {
  event.preventDefault();

  if (!validateForm()) {
    FashionUtils.showToast("Vui lòng kiểm tra lại thông tin nhập.");
    return false;
  }

  const product = getFormData();
  const id = adminEls.productId.value;
  const action = id ? FashionApi.updateProduct(id, product) : FashionApi.createProduct(product);

  setLoading(true);
  action
    .then(() => {
      FashionUtils.showToast(id ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm.");
      resetForm();
      return loadAdminData();
    })
    .catch((error) => {
      setError(error.message);
      FashionUtils.showToast("Lưu sản phẩm thất bại.");
    })
    .finally(() => {
      setLoading(false);
    });

  return true;
}

function editProduct(productId) {
  const product = adminState.products.find((item) => String(item.id) === String(productId));
  if (!product) return false;

  adminEls.productId.value = product.id;
  adminEls.formTitle.textContent = "Sửa sản phẩm";
  adminEls.nameInput.value = product.name;
  adminEls.categoryInput.value = product.category;
  adminEls.priceInput.value = product.price;
  adminEls.stockInput.value = product.stock;
  adminEls.sizesInput.value = product.sizes.join(", ");
  adminEls.imageInput.value = product.image;
  adminEls.descriptionInput.value = product.description;
  clearValidation();
  window.scrollTo({ top: 0, behavior: "smooth" });
  return true;
}

function askDeleteProduct(productId) {
  const product = adminState.products.find((item) => String(item.id) === String(productId));
  if (!product) return false;

  adminState.deletingId = product.id;
  adminEls.deleteProductName.textContent = product.name;
  bootstrap.Modal.getOrCreateInstance(document.querySelector("#deleteModal")).show();
  return true;
}

function confirmDeleteProduct() {
  if (!adminState.deletingId) return false;

  setLoading(true);
  FashionApi.deleteProduct(adminState.deletingId)
    .then(() => {
      FashionUtils.showToast("Đã xóa sản phẩm.");
      bootstrap.Modal.getOrCreateInstance(document.querySelector("#deleteModal")).hide();
      adminState.deletingId = "";
      return loadAdminData();
    })
    .catch((error) => {
      setError(error.message);
      FashionUtils.showToast("Xóa sản phẩm thất bại.");
    })
    .finally(() => {
      setLoading(false);
    });

  return true;
}

function bindAdminEvents() {
  adminEls.productForm.addEventListener("submit", saveProduct);
  adminEls.cancelEditBtn.addEventListener("click", resetForm);
  adminEls.reloadBtn.addEventListener("click", loadAdminData);
  adminEls.confirmDeleteBtn.addEventListener("click", confirmDeleteProduct);

  adminEls.productTable.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (editButton) {
      editProduct(editButton.dataset.edit);
    } else if (deleteButton) {
      askDeleteProduct(deleteButton.dataset.delete);
    }
  });

  $("#nameInput").on("input", () => showFieldError(adminEls.nameInput, "nameError", ""));
  $("#imageInput").on("input", () => showFieldError(adminEls.imageInput, "imageError", ""));
}

bindAdminEvents();
loadAdminData();
