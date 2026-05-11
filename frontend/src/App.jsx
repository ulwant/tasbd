import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import ProductPanel from './components/ProductPanel';
import CartPanel from './components/CartPanel';
import ProductFormModal from './components/ProductFormModal';
import ReceiptModal from './components/ReceiptModal';
import QtyModal from './components/QtyModal';
import CategoryManagerModal from './components/CategoryManagerModal';
import SalesReportModal from './components/SalesReportModal';
import TrashModal from './components/TrashModal';
import DiscountManagerModal from './components/DiscountManagerModal';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, createCategory, createTransaction } from './api';
import toast from 'react-hot-toast';

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

export default function App() {
  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Products & Categories
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // Cart
  const [cart, setCart] = useState([]);

  // Payment
  const [paymentAmount, setPaymentAmount] = useState('');

  // Modals
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showDiscountManager, setShowDiscountManager] = useState(false);

  // Derived
  const totalBelanja = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paymentNum = Number(paymentAmount) || 0;
  const kembalian = paymentNum - totalBelanja;

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (activeCategory) params.category_id = activeCategory;
      const [prods, cats] = await Promise.all([getProducts(params), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      toast.error('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeCategory]);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [loadData, isLoggedIn]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCart([]);
    setPaymentAmount('');
    toast.success('Logout berhasil');
  };

  // Product CRUD
  const handleSaveProduct = async (data) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success('Produk berhasil diupdate!');
      } else {
        await createProduct(data);
        toast.success('Produk berhasil ditambahkan!');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Hapus produk ini?')) return;
    try {
      await deleteProduct(id);
      toast.success('Produk dihapus');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  // Category
  const handleAddCategory = async (name) => {
    try {
      await createCategory({ name });
      toast.success('Kategori ditambahkan');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Cart
  const handleProductClick = (product) => {
    if (product.stock <= 0) {
      toast.error('Stok habis!');
      return;
    }
    setSelectedProduct(product);
    setShowQtyModal(true);
  };

  const handleAddToCart = (product, qty) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.stock) {
          toast.error(`Stok tersisa: ${product.stock}`);
          return prev;
        }
        return prev.map(item =>
          item.product_id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (qty > product.stock) {
          toast.error(`Stok tersisa: ${product.stock}`);
          return prev;
        }
        return [...prev, {
          product_id: product.id,
          product_name: product.name,
          price: Number(product.price),
          quantity: qty,
          stock: product.stock,
          category_name: product.category_name
        }];
      }
    });
    setShowQtyModal(false);
    setSelectedProduct(null);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const handleCartQtyChange = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.stock) {
          toast.error(`Stok tersisa: ${item.stock}`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setPaymentAmount('');
  };

  // Payment
  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong!');
      return;
    }
    if (paymentNum < totalBelanja) {
      toast.error('Pembayaran kurang!');
      return;
    }
    try {
      const result = await createTransaction({
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity
        })),
        payment_amount: paymentNum
      });
      setReceiptData(result);
      setShowReceipt(true);
      setCart([]);
      setPaymentAmount('');
      loadData();
      toast.success('Transaksi berhasil!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1f2e',
            color: '#e6edf3',
            border: '1px solid #30363d',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem'
          },
          success: {
            iconTheme: { primary: '#3fb950', secondary: '#0d1117' }
          },
          error: {
            iconTheme: { primary: '#f85149', secondary: '#0d1117' }
          }
        }}
      />

      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={(user) => {
          setIsLoggedIn(true);
          setCurrentUser(user);
        }} />
      ) : (
        <div className="app-layout">
          <Navbar
            totalBelanja={totalBelanja}
            paymentAmount={paymentNum}
            kembalian={kembalian}
            cartCount={cart.length}
            formatRupiah={formatRupiah}
            onShowReport={() => setShowSalesReport(true)}
            onShowDiscountManager={() => setShowDiscountManager(true)}
            onLogout={handleLogout}
            currentUser={currentUser}
          />

          <div className="main-content">
            <ProductPanel
              products={products}
              categories={categories}
              loading={loading}
              searchTerm={searchTerm}
              activeCategory={activeCategory}
              onSearchChange={setSearchTerm}
              onCategoryChange={setActiveCategory}
              onProductClick={handleProductClick}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddProduct={() => { setEditingProduct(null); setShowProductForm(true); }}
              onManageCategory={() => setShowCategoryManager(true)}
              onShowTrash={() => setShowTrash(true)}
              formatRupiah={formatRupiah}
            />

            <CartPanel
              cart={cart}
              totalBelanja={totalBelanja}
              paymentAmount={paymentAmount}
              kembalian={kembalian}
              onQtyChange={handleCartQtyChange}
              onRemoveItem={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onPaymentAmountChange={setPaymentAmount}
              onPayment={handlePayment}
              formatRupiah={formatRupiah}
            />
          </div>

          {showProductForm && (
            <ProductFormModal
              product={editingProduct}
              categories={categories}
              onSave={handleSaveProduct}
              onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
              onAddCategory={handleAddCategory}
            />
          )}

          {showCategoryManager && (
            <CategoryManagerModal
              categories={categories}
              onClose={() => setShowCategoryManager(false)}
              onAddCategory={handleAddCategory}
              onCategoryUpdated={loadData}
            />
          )}

          {showReceipt && receiptData && (
            <ReceiptModal
              data={receiptData}
              onClose={() => { setShowReceipt(false); setReceiptData(null); }}
              formatRupiah={formatRupiah}
            />
          )}

          {showQtyModal && selectedProduct && (
            <QtyModal
              product={selectedProduct}
              onConfirm={handleAddToCart}
              onClose={() => { setShowQtyModal(false); setSelectedProduct(null); }}
              formatRupiah={formatRupiah}
            />
          )}

          {showSalesReport && (
            <SalesReportModal 
              onClose={() => setShowSalesReport(false)} 
              formatRupiah={formatRupiah} 
            />
          )}

          {showTrash && (
            <TrashModal
              onClose={() => setShowTrash(false)}
              onRestored={loadData}
              formatRupiah={formatRupiah}
            />
          )}

          {showDiscountManager && (
            <DiscountManagerModal
              isOpen={showDiscountManager}
              onClose={() => setShowDiscountManager(false)}
              formatRupiah={formatRupiah}
            />
          )}
        </div>
      )}
    </div>
  );
}