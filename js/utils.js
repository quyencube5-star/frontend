const FashionUtils = (() => {
  const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  });

  function formatMoney(value) {
    return currency.format(Number(value) || 0);
  }

  function splitList(value) {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function isValidUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
      return false;
    }
  }

  function normalizeProduct(rawProduct) {
    const sizes = Array.isArray(rawProduct.sizes)
      ? rawProduct.sizes
      : splitList(rawProduct.sizes || rawProduct.size || "");

    return {
      id: rawProduct.id,
      name: rawProduct.name || "",
      price: Number(rawProduct.price) || 0,
      category: rawProduct.category || "",
      image: rawProduct.image || "",
      description: rawProduct.description || "",
      stock: Number(rawProduct.stock) || 0,
      sizes: sizes.length ? sizes : ["Free"],
      createdAt: rawProduct.createdAt || ""
    };
  }

  function showToast(message) {
    const toastElement = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    if (!toastElement || !toastMessage) return;

    toastMessage.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toastElement, { delay: 2600 }).show();
  }

  return {
    formatMoney,
    isValidUrl,
    normalizeProduct,
    showToast,
    splitList
  };
})();
