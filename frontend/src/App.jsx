import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import PaymentCallback from './pages/PaymentCallback.jsx';
import NotFound from './pages/NotFound.jsx';
import Footer from './components/Footer.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminProductAdd from './pages/admin/AdminProductAdd.jsx';
import AdminProductEdit from './pages/admin/AdminProductEdit.jsx';
import AdminProductRemove from './pages/admin/AdminProductRemove.jsx';
import AdminOrderStatus from './pages/admin/AdminOrderStatus.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { UserProvider, useUser } from './context/UserContext.jsx';
import { ModalProvider, useModal } from './context/ModalContext.jsx';
import SignInModal from './components/SignInModal.jsx';

function SignInModalWrapper() {
  const { showSignInModal, closeSignInModal } = useModal();
  return <SignInModal isOpen={showSignInModal} onClose={closeSignInModal} />;
}

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <div className={isAdminRoute ? 'ml-64' : ''}>
        <Footer />
      </div>
    </>
  );
}

// Protected Route Component
function AdminRoute({ children }) {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
  return user && user.isAdmin ? children : null;
}

export default function App() {
  return (
    <UserProvider>
      <ModalProvider>
        <CartProvider>
          <WishlistProvider>
            <Layout>
              <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminAnalytics />
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                } />
                <Route path="/admin/products/add" element={
                  <AdminRoute>
                    <AdminProductAdd />
                  </AdminRoute>
                } />
                <Route path="/admin/products/edit" element={
                  <AdminRoute>
                    <AdminProductEdit />
                  </AdminRoute>
                } />
                <Route path="/admin/products/remove" element={
                  <AdminRoute>
                    <AdminProductRemove />
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } />
                <Route path="/admin/orders/status" element={
                  <AdminRoute>
                    <AdminOrderStatus />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/payment-callback" element={<PaymentCallback />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <SignInModalWrapper />
          </WishlistProvider>
        </CartProvider>
      </ModalProvider>
    </UserProvider>
  );
}


