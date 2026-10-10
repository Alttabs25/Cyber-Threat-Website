import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  starOutline,
  star,
  arrowBackOutline,
  addOutline,
  removeOutline,
  heartOutline,
  heart,
  cartOutline,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import { getProductById, getProductImage } from "../data/products";
import { useCart } from "../context/CartContext";
import "./ProductDetails.css";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id);
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<
    "small" | "regular" | "large"
  >("regular");
  const history = useHistory();

  // Get price based on selected box size
  const getCurrentPrice = () => {
    if (!product) return 0;
    if (product.boxPrices) {
      return product.boxPrices[selectedSize];
    }
    return product.price;
  };

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const goBack = () => {
    history.push("/products");
  };

  const handleAddToCart = () => {
    if (product) {
      const currentPrice = getCurrentPrice();
      addToCart(product, quantity, selectedSize, currentPrice);
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlist(product.id);
    }
  };

  const getIngredientIcon = (ingredient: string): string => {
    const lowerIngredient = ingredient.toLowerCase();
    if (lowerIngredient.includes("flour")) return "🌾";
    if (lowerIngredient.includes("butter")) return "🧈";
    if (
      lowerIngredient.includes("chocolate") &&
      lowerIngredient.includes("chip")
    )
      return "🍫";
    if (lowerIngredient.includes("chocolate")) return "🍫";
    if (lowerIngredient.includes("egg")) return "🥚";
    if (lowerIngredient.includes("sugar")) return "🍬";
    if (lowerIngredient.includes("vanilla")) return "✨";
    if (lowerIngredient.includes("salt")) return "🧂";
    if (lowerIngredient.includes("baking")) return "💚";
    if (lowerIngredient.includes("oat")) return "🌾";
    if (lowerIngredient.includes("raisin")) return "🍇";
    if (lowerIngredient.includes("cinnamon")) return "🌿";
    if (lowerIngredient.includes("molasses")) return "🍯";
    if (lowerIngredient.includes("ginger")) return "🌿";
    if (lowerIngredient.includes("cocoa")) return "🍫";
    if (lowerIngredient.includes("fudge")) return "🍫";
    if (lowerIngredient.includes("peanut")) return "🥜";
    if (lowerIngredient.includes("almond")) return "🌰";
    if (lowerIngredient.includes("pecan")) return "🌰";
    if (lowerIngredient.includes("walnut")) return "🌰";
    if (lowerIngredient.includes("macadamia")) return "🌰";
    if (lowerIngredient.includes("hazelnut")) return "🌰";
    if (lowerIngredient.includes("cream")) return "🥛";
    if (lowerIngredient.includes("lemon")) return "🍋";
    if (lowerIngredient.includes("orange")) return "🍊";
    if (lowerIngredient.includes("cranberr")) return "🔴";
    if (lowerIngredient.includes("pumpkin")) return "🎃";
    if (lowerIngredient.includes("caramel")) return "🍯";
    if (lowerIngredient.includes("nutmeg")) return "🌿";
    if (lowerIngredient.includes("tartar")) return "💫";
    return "🍪";
  };

  if (!product) {
    return (
      <IonPage>
        <IonHeader>
          <Navbar />
        </IonHeader>
        <IonContent fullscreen>
          <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>Product not found</h2>
            <button
              onClick={() => history.push("/")}
              style={{ marginTop: "20px", padding: "10px 20px" }}
            >
              Go Back to Home
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>

      <IonContent fullscreen>
        {/* Back Button Section */}
        <section className="back-nav-section">
          <div className="back-nav-wrap">
            <button onClick={goBack} className="back-btn-sketch">
              <IonIcon icon={arrowBackOutline} />
              <span>Back to Shop</span>
            </button>
          </div>
        </section>

        {/* Product Details Section */}
        <section className="product-details-section">
          <div className="product-details-wrap">
            {/* Product Image */}
            <div className="product-image-area">
              <button
                className="wishlist-btn-large"
                onClick={handleToggleWishlist}
              >
                <IonIcon
                  icon={isInWishlist(product.id) ? heart : heartOutline}
                />
              </button>
              <div className="main-product-image">
                <img
                  src={`/images/cookies/${getProductImage(product.id)}`}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              {[
                "chocolate-chip",
                "butter-cookie",
                "double-chocolate",
                "peanut-butter",
                "red-velvet",
              ].includes(product.id) && (
                <div className="product-badge-sketch">
                  <span>Best Seller</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info-area">
              <div className="product-info-card">
                <h1 className="product-title-sketch">{product.name}</h1>
                <div className="product-rating">
                  <div className="stars-large">
                    <IonIcon icon={star} />
                    <IonIcon icon={star} />
                    <IonIcon icon={star} />
                    <IonIcon icon={star} />
                    <IonIcon icon={star} />
                  </div>
                  <span className="rating-text">(4.9/5.0 - 127 reviews)</span>
                </div>

                <p className="product-description-sketch">
                  {product.description}
                </p>

                <div className="price-section-sketch">
                  <span className="current-price">
                    ₱{getCurrentPrice().toFixed(2)}
                  </span>
                  <span className="old-price">
                    ₱{(getCurrentPrice() * 1.5).toFixed(2)}
                  </span>
                  <span className="discount-badge">33% OFF</span>
                </div>

                {/* Size Selection */}
                <div className="size-selector-sketch">
                  <h3 className="selector-label">Box of:</h3>
                  <div className="size-options">
                    <button
                      className={`size-btn ${
                        selectedSize === "small" ? "active" : ""
                      }`}
                      onClick={() => setSelectedSize("small")}
                    >
                      Small
                      <span className="size-detail">6 cookies</span>
                    </button>
                    <button
                      className={`size-btn ${
                        selectedSize === "regular" ? "active" : ""
                      }`}
                      onClick={() => setSelectedSize("regular")}
                    >
                      Regular
                      <span className="size-detail">12 cookies</span>
                    </button>
                    <button
                      className={`size-btn ${
                        selectedSize === "large" ? "active" : ""
                      }`}
                      onClick={() => setSelectedSize("large")}
                    >
                      Large
                      <span className="size-detail">24 cookies</span>
                    </button>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="quantity-selector-sketch">
                  <h3 className="selector-label">Quantity:</h3>
                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={decreaseQuantity}>
                      <IonIcon icon={removeOutline} />
                    </button>
                    <span className="qty-display">{quantity}</span>
                    <button className="qty-btn" onClick={increaseQuantity}>
                      <IonIcon icon={addOutline} />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons-sketch">
                  <button
                    className="add-to-cart-btn-large"
                    onClick={handleAddToCart}
                  >
                    <IonIcon icon={cartOutline} />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    className="buy-now-btn-sketch"
                    onClick={handleAddToCart}
                  >
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section className="ingredients-section-sketch">
          <div className="section-container">
            <h2 className="section-title-sketch">
              <span className="underline-sketch">Ingredients</span>
            </h2>
            <div className="ingredients-card-sketch">
              <div className="ingredients-grid">
                {product.ingredients &&
                  product.ingredients.map((ingredient, index) => (
                    <div className="ingredient-item" key={index}>
                      <div className="ingredient-icon"></div>
                      <span>{ingredient}</span>
                    </div>
                  ))}
              </div>
              <p className="allergen-info">
                <strong>Allergen Information:</strong>{" "}
                {product.allergens
                  ? `Contains ${product.allergens.join(", ")}.`
                  : "No allergen information available."}
              </p>
            </div>
          </div>
        </section>

        {/* Nutrition Facts Section */}
        <section className="nutrition-section-sketch">
          <div className="section-container">
            <h2 className="section-title-sketch">
              <span className="underline-sketch">Nutrition Facts</span>
            </h2>
            <div className="nutrition-card-sketch">
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <span className="nutrition-label">Serving Size</span>
                  <span className="nutrition-value">1 cookie (50g)</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Calories</span>
                  <span className="nutrition-value">
                    {product.nutritionFacts?.calories || "N/A"}
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Total Fat</span>
                  <span className="nutrition-value">
                    {product.nutritionFacts?.fat || "N/A"}
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Dietary Fiber</span>
                  <span className="nutrition-value">1g</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Sugars</span>
                  <span className="nutrition-value">15g</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Protein</span>
                  <span className="nutrition-value">
                    {product.nutritionFacts?.protein || "N/A"}
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Total Carbs</span>
                  <span className="nutrition-value">
                    {product.nutritionFacts?.carbs || "N/A"}
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Protein</span>
                  <span className="nutrition-value">3g</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="reviews-detail-section">
          <div className="section-container">
            <h2 className="section-title-sketch">
              <span className="underline-sketch">Customer Reviews</span>
            </h2>

            <div className="reviews-summary-card">
              <div className="overall-rating">
                <div className="rating-number">4.9</div>
                <div className="rating-stars-big">
                  <IonIcon icon={star} />
                  <IonIcon icon={star} />
                  <IonIcon icon={star} />
                  <IonIcon icon={star} />
                  <IonIcon icon={star} />
                </div>
                <p className="total-reviews">Based on 127 reviews</p>
              </div>

              <div className="rating-bars">
                <div className="rating-bar-item">
                  <span className="star-count">5</span>
                  <IonIcon icon={star} className="small-star" />
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "85%" }}></div>
                  </div>
                  <span className="bar-percent">85%</span>
                </div>
                <div className="rating-bar-item">
                  <span className="star-count">4</span>
                  <IonIcon icon={star} className="small-star" />
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "10%" }}></div>
                  </div>
                  <span className="bar-percent">10%</span>
                </div>
                <div className="rating-bar-item">
                  <span className="star-count">3</span>
                  <IonIcon icon={star} className="small-star" />
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "3%" }}></div>
                  </div>
                  <span className="bar-percent">3%</span>
                </div>
                <div className="rating-bar-item">
                  <span className="star-count">2</span>
                  <IonIcon icon={star} className="small-star" />
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "1%" }}></div>
                  </div>
                  <span className="bar-percent">1%</span>
                </div>
                <div className="rating-bar-item">
                  <span className="star-count">1</span>
                  <IonIcon icon={star} className="small-star" />
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "1%" }}></div>
                  </div>
                  <span className="bar-percent">1%</span>
                </div>
              </div>
            </div>

            <div className="reviews-list">
              <div className="review-card-detail">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar av-1"></div>
                    <div>
                      <h4 className="reviewer-name">Sarah M.</h4>
                      <div className="review-stars">
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                      </div>
                    </div>
                  </div>
                  <span className="review-date">2 days ago</span>
                </div>
                <p className="review-text">
                  Absolutely delicious! These cookies are the perfect blend of
                  chewy and crispy. The chocolate chips are generous and the
                  flavor is amazing. Will definitely order again!
                </p>
              </div>

              <div className="review-card-detail">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar av-2"></div>
                    <div>
                      <h4 className="reviewer-name">John D.</h4>
                      <div className="review-stars">
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                      </div>
                    </div>
                  </div>
                  <span className="review-date">1 week ago</span>
                </div>
                <p className="review-text">
                  Best cookies I've ever had! Fresh, soft, and packed with
                  chocolate. My whole family loves them. The packaging was great
                  too!
                </p>
              </div>

              <div className="review-card-detail">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar av-3"></div>
                    <div>
                      <h4 className="reviewer-name">Emily R.</h4>
                      <div className="review-stars">
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                        <IonIcon icon={star} />
                        <IonIcon icon={starOutline} />
                      </div>
                    </div>
                  </div>
                  <span className="review-date">2 weeks ago</span>
                </div>
                <p className="review-text">
                  Really good cookies! They arrived fresh and taste homemade.
                  The only reason I'm not giving 5 stars is I wish they were a
                  bit bigger for the price.
                </p>
              </div>
            </div>

            <button className="load-more-btn-sketch">Load More Reviews</button>
          </div>
        </section>

        {/* Sketch Footer */}
        <footer className="sketch-footer">
          <div className="footer-content">
            <div className="footer-col">
              <h4>About Us</h4>
              <p>Baking happiness since 2020</p>
              <p>Fresh cookies made with love</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <a href="#shop">Shop</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Customer Service</h4>
              <a href="#faq">FAQ</a>
              <a href="#shipping">Shipping</a>
              <a href="#returns">Returns</a>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <p>hello@chiphappens.com</p>
              <p>(555) 123-4567</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Chip Happens. All rights reserved.</p>
          </div>
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default ProductDetails;
