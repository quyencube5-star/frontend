const FashionApi = (() => {
  // Thay URL này bằng endpoint MockAPI của bạn, ví dụ:
  // https://64abc123456789.mockapi.io/api/v1
  const API_BASE_URL = "https://6a4e5a20e785c9ef536cb3b3.mockapi.io";

  function buildUrl(resource, id) {
    const cleanBase = API_BASE_URL.replace(/\/$/, "");
    return id ? `${cleanBase}/${resource}/${id}` : `${cleanBase}/${resource}`;
  }

  function request(resource, options = {}, id = "") {
    return fetch(buildUrl(resource, id), {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API lỗi ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        throw new Error(error.message || "Không thể kết nối MockAPI.");
      });
  }

  function getProducts() {
    return request("products").then((products) => products.map(FashionUtils.normalizeProduct));
  }

  function createProduct(product) {
    return request("products", {
      method: "POST",
      body: JSON.stringify(product)
    });
  }

  function updateProduct(id, product) {
    return request("products", {
      method: "PUT",
      body: JSON.stringify(product)
    }, id);
  }

  function deleteProduct(id) {
    return request("products", {
      method: "DELETE"
    }, id);
  }

  function getCategories() {
    return $.ajax({
      url: buildUrl("categories"),
      method: "GET",
      dataType: "json"
    }).then((categories) => categories);
  }

  return {
    API_BASE_URL,
    createProduct,
    deleteProduct,
    getCategories,
    getProducts,
    updateProduct
  };
})();
