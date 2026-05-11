// Gunakan environment variable jika ada (seperti di Vercel), jika tidak gunakan proxy lokal (/api)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
export const API_URL = API_BASE;

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  
  // Add JWT token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    headers,
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}

// Products
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? '?' + query : ''}`);
};
export const getProduct = (id) => request(`/products/${id}`);
export const createProduct = (data) => request('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE' });

// Categories
export const getCategories = () => request('/categories');
export const createCategory = (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id) => request(`/categories/${id}`, { method: 'DELETE' });

// Transactions
export const createTransaction = (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) });
export const getTransactions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/transactions${query ? '?' + query : ''}`);
};
export const getTransaction = (id) => request(`/transactions/${id}`);

// Users
export const getCurrentUser = () => request('/auth/me');
export const getUsers = () => request('/auth/users');
export const updateUserRole = (id, role) => request(`/auth/users/${id}/role`, {
  method: 'PUT',
  body: JSON.stringify({ role })
});

// Trash
export const getTrashProducts = () => request('/products/trash/list');
export const restoreProduct = (id) => request(`/products/${id}/restore`, { method: 'PUT' });
export const permanentDeleteProduct = (id) => request(`/products/${id}/permanent`, { method: 'DELETE' });

// Discounts
export const getDiscountedProducts = () => request('/products/admin/discounts');
export const setProductDiscount = (id, data) => request(`/products/${id}/discount`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
