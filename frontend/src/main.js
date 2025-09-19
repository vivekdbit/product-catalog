const API_BASE = "/api/v1";

let currentPage = 1;
let currentFilters = {};

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  await loadFilterOptions();
  await loadProducts();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Search input with debounce
  let searchTimeout;
  document.getElementById("search").addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = e.target.value;
      currentPage = 1;
      loadProducts();
    }, 500);
  });

  // Filter selects
  ["category", "brand", "sort_by"].forEach((id) => {
    document.getElementById(id).addEventListener("change", (e) => {
      if (id === "sort_by") {
        const [field, order] = e.target.value.split(":");
        currentFilters.sort_by = field;
        currentFilters.sort_order = order;
      } else {
        currentFilters[id] = e.target.value;
      }
      currentPage = 1;
      loadProducts();
    });
  });

  // Price inputs with debounce
  let priceTimeout;
  ["min_price", "max_price"].forEach((id) => {
    document.getElementById(id).addEventListener("input", (e) => {
      clearTimeout(priceTimeout);
      priceTimeout = setTimeout(() => {
        currentFilters[id] = e.target.value;
        currentPage = 1;
        loadProducts();
      }, 1000);
    });
  });

  // Generate data button
  document
    .getElementById("generate-data")
    .addEventListener("click", generateSampleData);
}

// Load filter options
async function loadFilterOptions() {
  try {
    const response = await fetch(`${API_BASE}/products/filters/options`);
    const result = await response.json();

    if (result.success) {
      const { categories, brands } = result.data;

      // Populate category select
      const categorySelect = document.getElementById("category");
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });

      // Populate brand select
      const brandSelect = document.getElementById("brand");
      brands.forEach((brand) => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading filter options:", error);
  }
}

// Load products
async function loadProducts() {
  showLoading(true);

  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: 12,
      ...currentFilters,
    });

    // Remove empty values
    for (const [key, value] of params.entries()) {
      if (!value) {
        params.delete(key);
      }
    }

    const response = await fetch(`${API_BASE}/products?${params}`);
    const result = await response.json();

    if (result.success) {
      displayProducts(result.data.products);
      displayPagination(result.data.pagination);
    } else {
      showError("Failed to load products");
    }
  } catch (error) {
    console.error("Error loading products:", error);
    showError("Failed to load products");
  } finally {
    showLoading(false);
  }
}

// Display products
function displayProducts(products) {
  const grid = document.getElementById("products-grid");

  if (products.length === 0) {
    grid.innerHTML =
      '<div class="no-products">No products found. Try adjusting your filters or <button onclick="generateSampleData()" class="btn btn-secondary">generate sample data</button>.</div>';
    return;
  }

  grid.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <img src="${product.image_url}" alt="${
        product.name
      }" class="product-image" loading="lazy">
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description || ""}</p>
        <div class="product-meta">
          <span class="product-category">${product.category}</span>
          <span class="product-brand">${product.brand}</span>
        </div>
        <div class="product-footer">
          <span class="product-price">${parseFloat(product.price).toFixed(
            2
          )}</span>
          <div class="product-rating">
            <span>⭐ ${parseFloat(product.rating || 0).toFixed(1)}</span>
            <span>(${product.review_count || 0})</span>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// Display pagination
function displayPagination(pagination) {
  const paginationEl = document.getElementById("pagination");

  if (pagination.total_pages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  const { current_page, total_pages, has_previous_page, has_next_page } =
    pagination;

  let paginationHTML = `
    <button ${!has_previous_page ? "disabled" : ""} onclick="goToPage(${
    current_page - 1
  })">
      « Previous
    </button>
  `;

  // Page numbers
  const startPage = Math.max(1, current_page - 2);
  const endPage = Math.min(total_pages, current_page + 2);

  if (startPage > 1) {
    paginationHTML += `<button onclick="goToPage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span>...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="${
        i === current_page ? "current-page" : ""
      }" onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }

  if (endPage < total_pages) {
    if (endPage < total_pages - 1) {
      paginationHTML += `<span>...</span>`;
    }
    paginationHTML += `<button onclick="goToPage(${total_pages})">${total_pages}</button>`;
  }

  paginationHTML += `
    <button ${!has_next_page ? "disabled" : ""} onclick="goToPage(${
    current_page + 1
  })">
      Next »
    </button>
  `;

  paginationEl.innerHTML = paginationHTML;
}

// Navigate to page
function goToPage(page) {
  currentPage = page;
  loadProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Generate sample data
async function generateSampleData() {
  const button = document.getElementById("generate-data");
  const originalText = button.textContent;

  button.textContent = "Generating...";
  button.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/products/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count: 1000 }),
    });

    const result = await response.json();

    if (result.success) {
      await loadFilterOptions(); // Reload filter options
      await loadProducts(); // Reload products
      showSuccess("Sample data generated successfully!");
    } else {
      showError("Failed to generate sample data");
    }
  } catch (error) {
    console.error("Error generating sample data:", error);
    showError("Failed to generate sample data");
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Utility functions
function showLoading(show) {
  const loading = document.getElementById("loading");
  const grid = document.getElementById("products-grid");

  if (show) {
    loading.classList.remove("hidden");
    grid.style.opacity = "0.5";
  } else {
    loading.classList.add("hidden");
    grid.style.opacity = "1";
  }
}

function showError(message) {
  alert(`Error: ${message}`);
}

function showSuccess(message) {
  alert(`Success: ${message}`);
}

// Make functions global for onclick handlers
window.goToPage = goToPage;
window.generateSampleData = generateSampleData;
