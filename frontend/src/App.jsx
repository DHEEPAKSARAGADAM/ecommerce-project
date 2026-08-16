import { useEffect, useState } from "react";
import { getProducts, createOrder } from "./services/productService";
import "./App.css";

function App() {

  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState("products");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [orderSuccess, setOrderSuccess] = useState(null);

  const [customerName, setCustomerName] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("UPI");


  // ==========================================
  // LOAD ALL PRODUCTS
  // ==========================================

  const loadProducts = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(data);

    } catch (error) {

      console.error("Error loading products:", error);

      setError("Failed to load products");

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    loadProducts();

  }, []);


  // ==========================================
  // SAVE CART TO LOCAL STORAGE
  // ==========================================

  useEffect(() => {

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

  }, [cart]);


  // ==========================================
  // SEARCH PRODUCTS
  // ==========================================

  const searchProducts = async () => {

    if (searchTerm.trim() === "") {

      loadProducts();

      return;
    }

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/products/search?name=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {

        throw new Error("Search failed");

      }

      const data = await response.json();

      setProducts(data);

    } catch (error) {

      console.error(
        "Error searching products:",
        error
      );

      setError("Failed to search products");

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (product) => {

    const existingProduct = cart.find(
      item => item.id === product.id
    );

    if (existingProduct) {

      if (existingProduct.quantity >= product.stock) {

        alert("No more stock available");

        return;
      }

      setCart(
        cart.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        )
      );

    } else {

      setCart([
        ...cart,
        {
          ...product,
          quantity: 1
        }
      ]);

    }
  };


  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  const increaseQuantity = (id) => {

    setCart(
      cart.map(item => {

        if (item.id === id) {

          if (item.quantity >= item.stock) {

            alert("Maximum available stock reached");

            return item;
          }

          return {
            ...item,
            quantity: item.quantity + 1
          };
        }

        return item;

      })
    );
  };


  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  const decreaseQuantity = (id) => {

    setCart(
      cart
        .map(item => {

          if (item.id === id) {

            return {
              ...item,
              quantity: item.quantity - 1
            };
          }

          return item;

        })
        .filter(item => item.quantity > 0)
    );
  };


  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  const removeFromCart = (id) => {

    setCart(
      cart.filter(item => item.id !== id)
    );

  };


  // ==========================================
  // CART COUNT
  // ==========================================

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );


  // ==========================================
  // CART TOTAL
  // ==========================================

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
      item.quantity,
    0
  );


  // ==========================================
  // GO TO CHECKOUT
  // ==========================================

  const goToCheckout = () => {

    if (cart.length === 0) {

      alert("Your cart is empty");

      return;
    }

    setPage("checkout");

  };


  // ==========================================
  // PLACE ORDER
  // ==========================================

  const placeOrder = async (event) => {

    event.preventDefault();

    if (cart.length === 0) {

      alert("Your cart is empty");

      return;
    }

    try {

      setError("");

      const order = {

        customerName,
        phone,
        address,
        paymentMethod,

        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))

      };

      const result = await createOrder(order);

      setOrderSuccess(result);

      setCart([]);

      localStorage.removeItem("cart");

      setCustomerName("");

      setPhone("");

      setAddress("");

      setPaymentMethod("UPI");

      setPage("success");

      await loadProducts();

    } catch (error) {

      console.error(error);

      alert(error.message);

    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="app">


      {/* HEADER */}

      <header className="header">

        <div
          className="logo"
          onClick={() => setPage("products")}
        >
          🛒 My Ecommerce Store
        </div>


        <nav>

          <button
            onClick={() => setPage("products")}
          >
            Products
          </button>


          <button
            className="cart-button"
            onClick={() => setPage("cart")}
          >

            🛒 Cart

            {cartCount > 0 && (

              <span className="cart-count">
                {cartCount}
              </span>

            )}

          </button>

        </nav>

      </header>


      <main>


        {/* ====================================
            PRODUCTS PAGE
        ==================================== */}

        {page === "products" && (

          <section>


            {/* HERO */}

            <div className="hero">

              <h1>
                My Ecommerce Store
              </h1>

              <p>
                Find the products you love.
              </p>

            </div>


            {/* =================================
                SEARCH B
            ================================= */}
            <h1>SEARCH TEST</h1>

            <div className="search-box">

              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    searchProducts();

                  }

                }}
              />


              <button
                onClick={searchProducts}
              >
                Search
              </button>

            </div>


            {/* LOADING */}

            {loading && (

              <p className="message">
                Loading products...
              </p>

            )}


            {/* ERROR */}

            {error && (

              <p className="error">
                {error}
              </p>

            )}


            {/* PRODUCTS */}

            {!loading && !error && (

              products.length === 0 ? (

                <p className="message">
                  No products found.
                </p>

              ) : (

                <div className="product-grid">

                  {products.map(product => (

                    <div
                      className="product-card"
                      key={product.id}
                    >


                      {/* IMAGE */}

                      <div className="product-image">

                        {product.imageUrl ? (

                          <img
                            src={product.imageUrl}
                            alt={product.name}
                          />

                        ) : (

                          <div className="no-image">
                            No Image
                          </div>

                        )}

                      </div>


                      {/* CONTENT */}

                      <div className="product-content">

                        <h2>
                          {product.name}
                        </h2>


                        <p className="description">
                          {product.description}
                        </p>


                        <div className="product-bottom">

                          <span className="price">

                            ₹
                            {Number(
                              product.price
                            ).toLocaleString("en-IN")}

                          </span>


                          <span className="stock">

                            Stock: {product.stock}

                          </span>

                        </div>


                        <button
                          className="add-button"
                          disabled={product.stock === 0}
                          onClick={() =>
                            addToCart(product)
                          }
                        >

                          {product.stock === 0
                            ? "Out of Stock"
                            : "Add to Cart"}

                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )

            )}

          </section>

        )}


        {/* ====================================
            CART PAGE
        ==================================== */}

        {page === "cart" && (

          <section className="page">

            <h1>
              Your Cart
            </h1>


            {cart.length === 0 ? (

              <div className="empty-cart">

                <h2>
                  Your cart is empty 🛒
                </h2>


                <button
                  onClick={() =>
                    setPage("products")
                  }
                >
                  Continue Shopping
                </button>

              </div>

            ) : (

              <>

                <div className="cart-list">

                  {cart.map(item => (

                    <div
                      className="cart-item"
                      key={item.id}
                    >

                      <img
                        src={item.imageUrl}
                        alt={item.name}
                      />


                      <div className="cart-info">

                        <h2>
                          {item.name}
                        </h2>


                        <p>
                          ₹
                          {Number(
                            item.price
                          ).toLocaleString("en-IN")}
                        </p>


                        <div className="quantity">

                          <button
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                          >
                            −
                          </button>


                          <span>
                            {item.quantity}
                          </span>


                          <button
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>


                      <div className="cart-right">

                        <strong>

                          ₹
                          {(
                            Number(item.price) *
                            item.quantity
                          ).toLocaleString("en-IN")}

                        </strong>


                        <button
                          className="remove-button"
                          onClick={() =>
                            removeFromCart(item.id)
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  ))}

                </div>


                <div className="cart-summary">

                  <h2>
                    Order Summary
                  </h2>


                  <div>

                    <span>
                      Items
                    </span>

                    <span>
                      {cartCount}
                    </span>

                  </div>


                  <div className="total">

                    <span>
                      Total
                    </span>

                    <span>
                      ₹
                      {cartTotal.toLocaleString("en-IN")}
                    </span>

                  </div>


                  <button
                    className="checkout-button"
                    onClick={goToCheckout}
                  >
                    Proceed to Checkout
                  </button>

                </div>

              </>

            )}

          </section>

        )}


        {/* ====================================
            CHECKOUT PAGE
        ==================================== */}

        {page === "checkout" && (

          <section className="page">

            <h1>
              Checkout
            </h1>


            <div className="checkout-layout">


              <form
                className="checkout-form"
                onSubmit={placeOrder}
              >

                <h2>
                  Delivery Details
                </h2>


                <label>
                  Full Name
                </label>

                <input
                  value={customerName}
                  onChange={e =>
                    setCustomerName(e.target.value)
                  }
                  placeholder="Enter your name"
                  required
                />


                <label>
                  Phone
                </label>

                <input
                  value={phone}
                  onChange={e =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter phone number"
                  required
                />


                <label>
                  Address
                </label>

                <textarea
                  value={address}
                  onChange={e =>
                    setAddress(e.target.value)
                  }
                  placeholder="Enter delivery address"
                  rows="4"
                  required
                />


                <h2>
                  Payment Method
                </h2>


                <div className="payment-options">


                  <label className="payment-option">

                    <input
                      type="radio"
                      value="UPI"
                      checked={
                        paymentMethod === "UPI"
                      }
                      onChange={e =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                    />

                    <span>
                      📱 UPI
                    </span>

                  </label>


                  <label className="payment-option">

                    <input
                      type="radio"
                      value="CARD"
                      checked={
                        paymentMethod === "CARD"
                      }
                      onChange={e =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                    />

                    <span>
                      💳 Card
                    </span>

                  </label>


                  <label className="payment-option">

                    <input
                      type="radio"
                      value="NET_BANKING"
                      checked={
                        paymentMethod === "NET_BANKING"
                      }
                      onChange={e =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                    />

                    <span>
                      🏦 Net Banking
                    </span>

                  </label>


                  <label className="payment-option">

                    <input
                      type="radio"
                      value="COD"
                      checked={
                        paymentMethod === "COD"
                      }
                      onChange={e =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                    />

                    <span>
                      💵 Cash on Delivery
                    </span>

                  </label>

                </div>


                <button
                  type="submit"
                  className="place-order-button"
                >
                  Place Order
                </button>

              </form>


              <div className="checkout-summary">

                <h2>
                  Your Order
                </h2>


                {cart.map(item => (

                  <div
                    className="checkout-item"
                    key={item.id}
                  >

                    <span>
                      {item.name} × {item.quantity}
                    </span>


                    <strong>

                      ₹
                      {(
                        Number(item.price) *
                        item.quantity
                      ).toLocaleString("en-IN")}

                    </strong>

                  </div>

                ))}


                <hr />


                <div className="checkout-total">

                  <span>
                    Total
                  </span>


                  <strong>

                    ₹
                    {cartTotal.toLocaleString("en-IN")}

                  </strong>

                </div>

              </div>

            </div>

          </section>

        )}


        {/* ====================================
            SUCCESS PAGE
        ==================================== */}

        {page === "success" &&
          orderSuccess && (

            <section className="success-page">

              <div className="success-card">

                <div className="success-icon">
                  ✓
                </div>


                <h1>
                  Order Confirmed!
                </h1>


                <p>
                  Thank you, {orderSuccess.customerName}.
                </p>


                <p>
                  Your order has been successfully placed.
                </p>


                <div className="order-details">

                  <p>
                    <strong>
                      Order ID:
                    </strong>{" "}
                    #{orderSuccess.orderId}
                  </p>


                  <p>
                    <strong>
                      Payment:
                    </strong>{" "}
                    {orderSuccess.paymentMethod}
                  </p>


                  <p>
                    <strong>
                      Total:
                    </strong>{" "}
                    ₹
                    {Number(
                      orderSuccess.totalAmount
                    ).toLocaleString("en-IN")}
                  </p>


                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {orderSuccess.status}
                  </p>

                </div>


                <button
                  onClick={() =>
                    setPage("products")
                  }
                >
                  Continue Shopping
                </button>

              </div>

            </section>

          )}

      </main>

    </div>

  );
}

export default App;