import React from "react";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import { heartOutline, heart, addOutline, trashOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { getProductImage, products } from "../data/products";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Favorites.css";

const Favorites: React.FC = () => {
  const history = useHistory();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  // Get favorite products from products array based on wishlist IDs
  const favoriteProducts = products.filter((product) =>
    wishlist.includes(product.id)
  );

  const navigateToProduct = (productId: string) => {
    history.push(`/product/${productId}`);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>
      <IonContent fullscreen>
        {/* Main Content */}
        <div className="favorites-main-content">
          {/* Page Title */}
          <div className="favorites-page-header">
            <h1 className="favorites-page-title">My Favorites</h1>
            <p className="favorites-page-subtitle">
              Your hand-picked cookie collection!
            </p>
          </div>

          {/* Favorites Grid */}
          {favoriteProducts.length > 0 ? (
            <div className="cookie-cards-grid">
              {favoriteProducts.map((item) => (
                <div
                  key={item.id}
                  className="cookie-card"
                  onClick={() => navigateToProduct(item.id)}
                >
                  <button
                    className="wishlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item.id);
                    }}
                  >
                    <IonIcon icon={heart} style={{ color: "#ff6347" }} />
                  </button>
                  <div className="card-corner tl"></div>
                  <div className="card-corner tr"></div>
                  <div className="card-corner bl"></div>
                  <div className="card-corner br"></div>
                  <div className="card-sketch-border"></div>
                  <div className="cookie-illustration">
                    <img
                      src={`/images/cookies/${getProductImage(item.id)}`}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="card-footer-sketch">
                      <span className="price">
                        ₱{(item.boxPrices?.regular || item.price).toFixed(2)}
                      </span>
                      <button
                        className="add-btn-sketch"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
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
          ) : (
            <div className="empty-favorites">
              <div className="empty-icon-sketch">
                <IonIcon icon={heartOutline} />
              </div>
              <h2 className="empty-title-sketch">No Favorites Yet!</h2>
              <p className="empty-text-sketch">
                Start adding cookies to your favorites and they'll show up here.
              </p>
              <button
                className="primary-sketch-btn"
                onClick={() => history.push("/")}
              >
                Browse Cookies
              </button>
            </div>
          )}
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
