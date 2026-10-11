import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  IonSpinner,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import OurStory from "./pages/OurStory";
import Developers from "./pages/Developers";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const SessionLoader: React.FC = () => (
  <div
    role="status"
    aria-label="Restoring your session"
    style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
  >
    <IonSpinner name="crescent" />
  </div>
);

const LandingPage: React.FC = () => {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <SessionLoader />;
  }

  return isAuthenticated ? <Home /> : <Login />;
};

const ProtectedRoute: React.FC<{
  exact?: boolean;
  path: string;
  component: React.ComponentType;
}> = ({ component: Component, ...routeProps }) => {
  const { isAuthenticated, isAuthReady } = useAuth();

  return (
    <Route
      {...routeProps}
      render={({ location }) => {
        if (!isAuthReady) return <SessionLoader />;
        if (isAuthenticated) return <Component />;

        return (
          <Redirect
            to={{
              pathname: "/login",
              search: `?returnTo=${encodeURIComponent(
                `${location.pathname}${location.search}`
              )}`,
            }}
          />
        );
      }}
    />
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <IonApp>
        <IonReactRouter>
          <CartProvider>
            <IonRouterOutlet>
              <Route exact path="/" component={LandingPage} />
              <Route exact path="/home" component={LandingPage} />
              <Route exact path="/products" component={Products} />
              <Route exact path="/product/:id" component={ProductDetails} />
              <ProtectedRoute exact path="/cart" component={Cart} />
              <ProtectedRoute exact path="/checkout" component={Checkout} />
              <ProtectedRoute exact path="/payment" component={Payment} />
              <Route
                exact
                path="/order-confirmation"
                component={OrderConfirmation}
              />
              <ProtectedRoute exact path="/orders" component={Orders} />
              <ProtectedRoute exact path="/favorites" component={Favorites} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/our-story" component={OurStory} />
              <Route exact path="/developers" component={Developers} />
              <Redirect exact from="/tab1" to="/" />
            </IonRouterOutlet>
          </CartProvider>
        </IonReactRouter>
      </IonApp>
    </AuthProvider>
  );
};

export default App;
