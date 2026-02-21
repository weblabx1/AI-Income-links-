// State management
let cart = JSON.parse(localStorage.getItem('headshop_cart')) || [];

// Fetch and display featured products
async function loadFeaturedProducts() {
    const grid = document.getElementById('featured-products');
    if (!grid) return;

    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        const featured = products.filter(p => p.featured);

        grid.innerHTML = featured.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <!-- Image placeholder logic -->
                    <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/250x200?text=${product.name}'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    <br>
                    <button class="btn-primary" onclick="addToCart('${product.id}')">Adicionar ao Carrinho</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading products:", error);
        grid.innerHTML = "<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>";
    }
}

// Cart functionality
function addToCart(productId) {
    // In a real app, you'd fetch the product details again or find in state
    // For now, we'll fetch all and find
    fetch('/api/products')
        .then(res => res.json())
        .then(products => {
            const product = products.find(p => p.id === productId);
            if (product) {
                cart.push(product);
                localStorage.setItem('headshop_cart', JSON.stringify(cart));
                updateCartCount();
                alert(`${product.name} adicionado ao carrinho!`);
            }
        });
}

function updateCartCount() {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        countSpan.textContent = cart.length;
    }
}

// Auto-apply QURA coupon logic
function checkQuraContext() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ref') === 'qura' || window.location.hash === '#qura') {
        localStorage.setItem('headshop_coupon', 'PCQURA');
        console.log("QURA coupon automatically applied!");
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    updateCartCount();
    checkQuraContext();
});
