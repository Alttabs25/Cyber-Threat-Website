import React from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  chevronForwardOutline,
  starOutline,
  heartOutline,
  heart,
} from "ionicons/icons";
import { useCart } from "../context/CartContext";
import { getFeaturedProducts, getProductImage } from "../data/products";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Home.css";

const Home: React.FC = () => {
  const history = useHistory();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const featuredProducts = getFeaturedProducts();

  const navigateToProduct = (productId: string) => {
    history.push(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const product = featuredProducts.find((p) => p.id === productId);
    if (product) {
      addToCart(product);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>

      <IonContent fullscreen>
        {/* Hero Section with Hand-Drawn Style */}
        <section className="hero-sketch">
          <div className="sketch-bg-lines"></div>
          <div className="hero-content-sketch">
            <div className="hero-badge">Est. 2024</div>
            <h1 className="hero-title-sketch">
              <span className="word-1">Where Every</span>
              <span className="word-2">Cookie Tells</span>
              <span className="word-3">A Story!</span>
            </h1>
            <p className="hero-subtitle-sketch">
              Handcrafted with premium ingredients and sprinkled with happiness.
              <br />
              Because life's too short for boring cookies!
            </p>
            <div className="hero-buttons">
              <button
                className="primary-sketch-btn"
                onClick={() => history.push("/products")}
              >
                <span>Explore Menu</span>
                <IonIcon icon={chevronForwardOutline} />
              </button>
              <button
                className="secondary-sketch-btn"
                onClick={() => history.push("/our-story")}
              >
                <IonIcon icon={heartOutline} />
                <span>Our Story</span>
              </button>
            </div>
          </div>
          <div className="hero-illustration">
            <img
              className="floating-cookie cookie-float-1"
              src="/images/cookies/Chocolate chip.svg"
              alt="Cookie"
            />
            <img
              className="floating-cookie cookie-float-2"
              src="/images/cookies/Double Chocolate Cookie.svg"
              alt="Cookie"
            />
            <img
              className="floating-cookie cookie-float-3"
              src="/images/cookies/Peanut Butter Cookie.svg"
              alt="Cookie"
            />
            <img
              className="floating-cookie cookie-float-4"
              src="/images/cookies/Red Velvet Cookie.svg"
              alt="Cookie"
            />
            <img
              className="floating-cookie cookie-float-5"
              src="/images/cookies/Mint Chocolate Cookie.svg"
              alt="Cookie"
            />
            <div className="doodle-stars">
              <span className="star-doodle s1"></span>
              <span className="star-doodle s2"></span>
              <span className="star-doodle s3"></span>
              <span className="star-doodle s4"></span>
            </div>
          </div>
        </section>

        {/* Featured Cookies - Card Style */}
        <section className="featured-cookies">
          <div className="section-header-sketch">
            <h2 className="sketch-heading">
              <span className="underline-sketch">Today's Specials</span>
              <span className="emoji-bounce"></span>
            </h2>
            <p className="sketch-subheading">Baked fresh this morning!</p>
          </div>

          <div className="cookie-cards-grid">
            {featuredProducts.map((product) => (
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
        </section>

        {/* Cartoon Info Banner */}
        <section className="info-banner-sketch">
          <div className="banner-card">
            <div className="banner-doodle left-doodle">
              <div className="mixing-bowl"></div>
            </div>
            <div className="banner-text">
              <h3>Baked with Love, Served with a Smile!</h3>
              <p>
                Every cookie is handmade using premium ingredients, traditional
                recipes, and a whole lot of heart. No preservatives, no
                shortcuts—just pure, delicious happiness in every bite!
              </p>
            </div>
            <div className="banner-doodle right-doodle">
              <div className="chef-hat"></div>
            </div>
          </div>
        </section>

        {/* Cookie Journey - Comic Style */}
        <section className="cookie-journey">
          <div className="section-header-sketch">
            <h2 className="sketch-heading">
              <span className="underline-sketch">How We Make Magic</span>
              <span className="emoji-bounce"></span>
            </h2>
          </div>

          <div className="journey-steps">
            <div className="step-card step-1">
              <div className="step-number">1</div>
              <div className="step-illustration">
                <div className="ingredient-bowl"></div>
              </div>
              <h4>Fresh Ingredients</h4>
              <p>We source the finest flour, butter, and chocolate</p>
            </div>

            <div className="arrow-sketch">→</div>

            <div className="step-card step-2">
              <div className="step-number">2</div>
              <div className="step-illustration">
                <div className="mixing-icon"></div>
              </div>
              <h4>Mix & Love</h4>
              <p>Hand-mixed with care and a secret recipe</p>
            </div>

            <div className="arrow-sketch">→</div>

            <div className="step-card step-3">
              <div className="step-number">3</div>
              <div className="step-illustration">
                <div className="oven-icon"></div>
              </div>
              <h4>Bake Perfect</h4>
              <p>Baked to golden perfection every time</p>
            </div>

            <div className="arrow-sketch">→</div>

            <div className="step-card step-4">
              <div className="step-number">4</div>
              <div className="step-illustration">
                <div className="happy-cookie"></div>
              </div>
              <h4>Pure Joy!</h4>
              <p>Delivered fresh to make your day sweeter</p>
            </div>
          </div>
        </section>

        {/* Customer Reviews - Speech Bubble Style */}
        <section className="reviews-sketch">
          <div className="section-header-sketch">
            <h2 className="sketch-heading">
              <span className="underline-sketch">What Cookie Lovers Say</span>
              <span className="emoji-bounce"></span>
            </h2>
          </div>

          <div className="reviews-grid">
            <div className="review-bubble b1">
              <div className="bubble-tail"></div>
              <div className="reviewer-avatar av-1"></div>
              <div className="stars">
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
              </div>
              <p>
                "Best cookies I've ever had! The chocolate chip is absolutely
                divine!"
              </p>
              <span className="reviewer-name">- Sarah M.</span>
            </div>

            <div className="review-bubble b2">
              <div className="bubble-tail"></div>
              <div className="reviewer-avatar av-2"></div>
              <div className="stars">
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
              </div>
              <p>
                "My kids can't get enough! We order every week now. Love the
                variety!"
              </p>
              <span className="reviewer-name">- Mike R.</span>
            </div>

            <div className="review-bubble b3">
              <div className="bubble-tail"></div>
              <div className="reviewer-avatar av-3"></div>
              <div className="stars">
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
                <IonIcon icon={starOutline} className="filled" />
              </div>
              <p>
                "These cookies remind me of my grandma's baking. Pure
                nostalgia!"
              </p>
              <span className="reviewer-name">- Emma L.</span>
            </div>
          </div>
        </section>

        {/* CTA Section - Cartoon Banner */}
        <section className="cta-banner-sketch">
          <div className="cta-content">
            <div className="cta-illustration">
              <div className="big-cookie-cartoon"></div>
            </div>
            <div className="cta-text">
              <h2>Ready for a Cookie Adventure?</h2>
              <p>
                Join thousands of happy customers enjoying our handcrafted
                treats!
              </p>
              <button className="mega-cta-btn">
                <span>Start Your Order</span>
                <span className="btn-decoration"></span>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
