import React from "react";
import { IonContent, IonHeader, IonPage } from "@ionic/react";
import Navbar from "../components/Navbar";
import "./OurStory.css";

const OurStory: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>
      <IonContent fullscreen>
        {/* Hero Section */}
        <section className="story-hero">
          <div className="sketch-bg-lines"></div>
          <div className="story-hero-content">
            <div className="hero-badge">Est. 2024</div>
            <h1 className="story-hero-title">
              <span className="word-1">Our Sweet</span>
              <span className="word-2">Cookie Story</span>
            </h1>
            <p className="story-hero-subtitle">
              From a small kitchen to spreading joy, one cookie at a time
            </p>
          </div>
        </section>

        {/* Story Content */}
        <section className="story-content">
          <div className="story-container">
            <div className="story-card">
              <div className="card-corner tl"></div>
              <div className="card-corner tr"></div>
              <div className="card-corner bl"></div>
              <div className="card-corner br"></div>
              <div className="card-sketch-border"></div>

              <div className="story-section">
                <h2 className="story-heading">How It All Began</h2>
                <p className="story-text">
                  It all started in 2024 when our founder, a passionate baker
                  with a dream, began experimenting with cookie recipes in a
                  tiny apartment kitchen. What started as a weekend hobby
                  quickly turned into an obsession. Friends and family couldn't
                  get enough of those warm, gooey, chocolatey delights!
                </p>
                <p className="story-text">
                  Word spread fast (faster than cookie crumbs on a couch), and
                  soon we were taking orders from neighbors, then friends of
                  neighbors, and before we knew it, the whole community was
                  asking for more. That's when we realized - we had something
                  special on our hands.
                </p>
              </div>

              <div className="story-divider">
                <span className="divider-cookie">🍪</span>
              </div>

              <div className="story-section">
                <h2 className="story-heading">Our Mission</h2>
                <p className="story-text">
                  At Chip Happens, we believe that cookies are more than just
                  desserts - they're little moments of happiness wrapped in
                  dough. Our mission is simple: to bring joy to every bite and
                  smiles to every face.
                </p>
                <p className="story-text">
                  We're committed to using only the finest ingredients, baking
                  with love, and creating cookies that remind you of home,
                  childhood, and all the good things in life. Because when life
                  gets tough, sometimes you just need a really good cookie.
                </p>
              </div>

              <div className="story-divider">
                <span className="divider-cookie">🍪</span>
              </div>

              <div className="story-section">
                <h2 className="story-heading">What Makes Us Special</h2>
                <div className="story-features">
                  <div className="feature-item">
                    <h3 className="feature-title">Fresh Daily</h3>
                    <p className="feature-text">
                      Every cookie is baked fresh daily. No preservatives, no
                      shortcuts - just pure, delicious goodness.
                    </p>
                  </div>
                  <div className="feature-item">
                    <h3 className="feature-title">Made with Love</h3>
                    <p className="feature-text">
                      We put our heart into every batch. Each cookie is crafted
                      with care and attention to detail.
                    </p>
                  </div>
                  <div className="feature-item">
                    <h3 className="feature-title">Premium Ingredients</h3>
                    <p className="feature-text">
                      We source the best chocolate, butter, and ingredients.
                      Quality matters, and you can taste the difference.
                    </p>
                  </div>
                  <div className="feature-item">
                    <h3 className="feature-title">Creative Flavors</h3>
                    <p className="feature-text">
                      From classic chocolate chip to adventurous combinations,
                      we're always experimenting with new flavors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="story-divider">
                <span className="divider-cookie">🍪</span>
              </div>

              <div className="story-section">
                <h2 className="story-heading">Looking Forward</h2>
                <p className="story-text">
                  Today, Chip Happens has grown from that tiny kitchen into a
                  beloved local bakery, but our values remain the same. We're
                  still baking with the same passion, the same recipes (well,
                  improved and perfected), and the same commitment to quality.
                </p>
                <p className="story-text">
                  As we grow, we're excited to share our cookies with even more
                  people, create new flavors, and continue spreading joy one
                  delicious cookie at a time. Because remember - in life, Chip
                  Happens!
                </p>
              </div>

              <div className="card-doodles">
                <span className="doodle d1"></span>
                <span className="doodle d2"></span>
                <span className="doodle d3"></span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="story-cta">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Join Our Story?</h2>
            <p className="cta-subtitle">
              Try our cookies today and become part of the Chip Happens family!
            </p>
            <button
              className="cta-btn"
              onClick={() => (window.location.href = "/products")}
            >
              Shop Our Cookies
            </button>
          </div>
          <div className="cookie-decoration">
            <div className="floating-cookie c1"></div>
            <div className="floating-cookie c2"></div>
            <div className="floating-cookie c3"></div>
            <div className="floating-cookie c4"></div>
          </div>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default OurStory;
