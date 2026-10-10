import React, { useState } from "react";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  heartOutline,
  heart,
  filterOutline,
  gridOutline,
  reorderTwoOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import {
  categories,
  getProductsByCategory,
  getProductImage,
  Product,
} from "../data/products";
import Navbar from "../components/Navbar";
import "./Products.css";

interface SelectedCookie {
  productId: string;
  name: string;
  image: string;
}

const Products: React.FC = () => {
  const history = useHistory();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"one-column" | "two-column">(
    "two-column"
  );
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [boxSize, setBoxSize] = useState<6 | 12 | 24>(6);
  const [boxes, setBoxes] = useState<SelectedCookie[][]>([[]]);
  const [draggedCookie, setDraggedCookie] = useState<SelectedCookie | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeBox, setActiveBox] = useState(0);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const navigateToProduct = (productId: string) => {
    history.push(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const product = filteredProducts.find((p) => p.id === productId);
    if (product) {
      addToCart(product);
    }
  };

  // Filter products by category
  const filteredProducts = getProductsByCategory(selectedCategory);

  const totalSelected = () =>
    boxes.reduce((total, box) => total + box.length, 0);

  const boxCount = () => Math.ceil(boxSize / 6);

  const resetBoxes = (size: 6 | 12 | 24 = boxSize) => {
    setBoxSize(size);
    setBoxes(Array.from({ length: Math.ceil(size / 6) }, () => []));
    setActiveBox(0);
  };

  const openCustomizer = () => {
    setIsCustomizeOpen(true);
    resetBoxes(6);
  };

  const closeCustomizer = () => {
    setIsCustomizeOpen(false);
    setBoxes([[]]);
    setDraggedCookie(null);
    setIsDragging(false);
    setActiveBox(0);
    setJustAddedId(null);
  };

  const toSelectedCookie = (product: Product): SelectedCookie => ({
    productId: product.id,
    name: product.name,
    image: getProductImage(product.id),
  });

  const addCookieToBox = (product: Product, boxIndex = activeBox) => {
    if (totalSelected() >= boxSize) return;

    const nextBoxes = boxes.map((box) => [...box]);
    const targetIndex = nextBoxes[boxIndex].length < 6
      ? boxIndex
      : nextBoxes.findIndex((box) => box.length < 6);

    if (targetIndex === -1) return;

    nextBoxes[targetIndex].push(toSelectedCookie(product));
    setBoxes(nextBoxes);
    setActiveBox(targetIndex);
    setJustAddedId(product.id);
    window.setTimeout(() => setJustAddedId(null), 500);

    if (nextBoxes[targetIndex].length === 6 && targetIndex < boxCount() - 1) {
      window.setTimeout(() => setActiveBox(targetIndex + 1), 400);
    }

    if ("vibrate" in navigator) navigator.vibrate(50);
  };

  const removeCookie = (boxIndex: number, cookieIndex: number) => {
    const nextBoxes = boxes.map((box) => [...box]);
    nextBoxes[boxIndex].splice(cookieIndex, 1);
    setBoxes(nextBoxes);
  };

  const handleDragStart = (product: Product) => {
    setDraggedCookie(toSelectedCookie(product));
    setIsDragging(true);
  };

  const handleDrop = (event: React.DragEvent, boxIndex: number) => {
    event.preventDefault();
    if (!draggedCookie || boxes[boxIndex].length >= 6) return;

    const product = filteredProducts.find(
      (item) => item.id === draggedCookie.productId
    );
    if (product) addCookieToBox(product, boxIndex);
    setDraggedCookie(null);
    setIsDragging(false);
  };

  const addCustomBoxToCart = () => {
    if (totalSelected() !== boxSize) {
      window.alert(
        `Please add exactly ${boxSize} cookies to your custom box. Currently: ${totalSelected()}`
      );
      return;
    }

    const cookieCounts: Record<string, { name: string; count: number }> = {};
    boxes.flat().forEach((cookie) => {
      if (cookieCounts[cookie.productId]) {
        cookieCounts[cookie.productId].count += 1;
      } else {
        cookieCounts[cookie.productId] = { name: cookie.name, count: 1 };
      }
    });

    const price = boxSize === 6 ? 225 : boxSize === 12 ? 420 : 800;
    const cartBoxSize = boxSize === 6 ? "small" : boxSize === 12 ? "regular" : "large";
    const customProduct: Product = {
      id: `custom-box-${Date.now()}`,
      name: `Custom Cookie Box (${boxSize} cookies)`,
      price,
      category: "custom",
      image: "custom-box",
      description: Object.values(cookieCounts)
        .map((cookie) => `${cookie.count}x ${cookie.name}`)
        .join(", "),
    };

    addToCart(customProduct, 1, cartBoxSize, price);
    closeCustomizer();
  };

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>
      <IonContent fullscreen>
        {/* Main Content */}
        <div className="products-main-content">
          {/* Page Header */}
          <div className="products-page-header">
            <h1 className="products-page-title">Our Cookie Collection</h1>
            <p className="products-page-subtitle">
              Handcrafted with love, baked fresh daily!
            </p>
            <button className="customize-box-btn" onClick={openCustomizer}>
              🍪 Customize Your Cookie Box
            </button>
          </div>

          {/* Filter and View Controls */}
          <div className="products-controls">
            <div className="filter-dropdown-container">
              <IonIcon icon={filterOutline} className="filter-icon" />
              <select
                className="category-dropdown"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="view-toggle-container">
              <span className="view-label">View:</span>
              <button
                className={`view-btn ${
                  viewMode === "one-column" ? "active" : ""
                }`}
                onClick={() => setViewMode("one-column")}
                title="One Column"
              >
                <IonIcon icon={reorderTwoOutline} />
              </button>
              <button
                className={`view-btn ${
                  viewMode === "two-column" ? "active" : ""
                }`}
                onClick={() => setViewMode("two-column")}
                title="Two Columns"
              >
                <IonIcon icon={gridOutline} />
              </button>
            </div>
          </div>

          {/* Products Count */}
          <div className="products-count">
            Showing {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "cookie" : "cookies"}
          </div>

          {/* Products Grid */}
          <div className={`cookie-cards-grid ${viewMode}`}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="cookie-card"
                onClick={() => navigateToProduct(product.id)}
              >
                <button
                  className="wishlist-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                >
                  <IonIcon
                    icon={isInWishlist(product.id) ? heart : heartOutline}
                  />
                </button>
                <div className="card-corner tl"></div>
                <div className="card-corner tr"></div>
                <div className="card-corner bl"></div>
                <div className="card-corner br"></div>
                <div className="card-sketch-border"></div>
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
                <div className="cookie-illustration">
                  <img
                    src={`/images/cookies/${getProductImage(product.id)}`}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="card-content">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="card-footer">
                    <span className="price">
                      ₱
                      {(product.boxPrices?.regular || product.price).toFixed(2)}
                    </span>
                    <button
                      className="add-btn"
                      onClick={(e) => handleAddToCart(e, product.id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="card-doodles">
                  <span className="doodle d1"></span>
                  <span className="doodle d2"></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isCustomizeOpen && (
          <div className="customize-modal-overlay" role="presentation">
            <div
              className="customize-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="customize-box-title"
            >
              <h2 id="customize-box-title">Customize Your Cookie Box</h2>
              <p className="customize-subtitle">Build your perfect cookie box!</p>

              <div className="box-size-selector">
                <label>Choose Box Size:</label>
                <div className="size-options">
                  {([
                    [6, "6 Cookies (1 Box)", "₱225"],
                    [12, "12 Cookies (2 Boxes)", "₱420"],
                    [24, "24 Cookies (4 Boxes)", "₱800"],
                  ] as const).map(([size, label, price]) => (
                    <button
                      key={size}
                      className={`size-btn ${boxSize === size ? "active" : ""}`}
                      onClick={() => resetBoxes(size)}
                    >
                      {label}
                      <span className="size-price">{price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="selection-progress">
                <span className="progress-text">
                  Selected: {totalSelected()} / {boxSize}
                </span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(totalSelected() / boxSize) * 100}%` }}
                  />
                </div>
              </div>

              <div className="drag-instructions">
                <p className="desktop-instruction">
                  🍪 Click any cookie to instantly add it to your box! Drag &amp; drop also works.
                </p>
                <p className="mobile-instruction">
                  🍪 Tap any cookie to instantly add it to your box!
                </p>
              </div>

              {boxCount() > 1 && (
                <div className="box-pagination">
                  <button
                    className="pagination-btn prev"
                    onClick={() => setActiveBox(Math.max(0, activeBox - 1))}
                    disabled={activeBox === 0}
                  >
                    ← Previous
                  </button>
                  <div className="pagination-dots">
                    {boxes.map((box, index) => (
                      <button
                        key={index}
                        className={`pagination-dot ${index === activeBox ? "active" : ""} ${box.length === 6 ? "completed" : ""}`}
                        onClick={() => setActiveBox(index)}
                        title={`Box ${index + 1}`}
                      >
                        {box.length === 6 ? "✓" : index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    className="pagination-btn next"
                    onClick={() => setActiveBox(Math.min(boxCount() - 1, activeBox + 1))}
                    disabled={activeBox === boxCount() - 1}
                  >
                    Next →
                  </button>
                </div>
              )}

              <div className="drop-boxes-container">
                <div
                  className={`drop-box single-box ${boxes[activeBox].length === 6 ? "full" : ""} ${isDragging ? "drag-target" : ""}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, activeBox)}
                >
                  <div className="box-header">
                    Box {activeBox + 1} of {boxCount()} ({boxes[activeBox].length}/6)
                    {boxes[activeBox].length === 6 && <span className="check-icon"> ✓</span>}
                  </div>
                  <div className="box-slots">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div className="cookie-slot" key={index}>
                        {boxes[activeBox][index] ? (
                          <div className="dropped-cookie animate-in">
                            <img
                              src={`/images/cookies/${boxes[activeBox][index].image}`}
                              alt={boxes[activeBox][index].name}
                            />
                            <button
                              className="remove-cookie-btn"
                              aria-label={`Remove ${boxes[activeBox][index].name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                removeCookie(activeBox, index);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="empty-slot">+</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cookie-selection-label">
                <p>Select cookies to add to your boxes:</p>
              </div>
              <div className="customize-cookie-grid">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`customize-cookie-item clickable ${justAddedId === product.id ? "just-added" : ""}`}
                    draggable
                    onDragStart={() => handleDragStart(product)}
                    onDragEnd={() => {
                      setDraggedCookie(null);
                      setIsDragging(false);
                    }}
                    onClick={() => addCookieToBox(product)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        addCookieToBox(product);
                      }
                    }}
                  >
                    <img
                      src={`/images/cookies/${getProductImage(product.id)}`}
                      alt={product.name}
                    />
                    <span className="cookie-name">{product.name}</span>
                    {justAddedId === product.id && (
                      <div className="added-indicator">+1</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="customize-modal-actions">
                <button
                  className="customize-add-btn"
                  onClick={addCustomBoxToCart}
                  disabled={totalSelected() !== boxSize}
                >
                  Add to Cart (₱{boxSize === 6 ? 225 : boxSize === 12 ? 420 : 800})
                </button>
                <button className="customize-cancel-btn" onClick={closeCustomizer}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default Products;
