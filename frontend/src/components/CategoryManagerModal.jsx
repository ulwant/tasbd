import React, { useState } from 'react';
import { FiX, FiEdit2, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { updateCategory, deleteCategory } from '../api';

export default function CategoryManagerModal({ categories, onClose, onAddCategory, onCategoryUpdated }) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(true);
    await onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setLoading(false);
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return;
    try {
      setLoading(true);
      await updateCategory(id, { name: editingName.trim() });
      toast.success('Kategori diperbarui');
      setEditingId(null);
      await onCategoryUpdated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus kategori "${name}"? Produk dalam kategori ini akan menjadi tanpa kategori.`)) return;
    try {
      setLoading(true);
      await deleteCategory(id);
      toast.success('Kategori dihapus');
      await onCategoryUpdated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Kelola Kategori</h3>
          <button className="modal-close" onClick={onClose} disabled={loading} id="btn-close-category-manager">
            <FiX />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Add Category Section */}
          <form className="form-group" style={{ marginBottom: 20 }} onSubmit={handleAdd}>
            <label className="form-label">Tambah Kategori Baru</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-input"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Nama kategori"
                disabled={loading}
                id="input-new-category-name"
              />
              <button
                type="submit"
                className="btn btn-accent"
                disabled={loading || !newCategoryName.trim()}
                style={{ padding: '8px 14px' }}
                id="btn-add-category-manager"
              >
                <FiPlus /> Tambah
              </button>
            </div>
          </form>

          {/* List Categories */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Daftar Kategori</label>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #30363d', borderRadius: '6px', background: '#0d1117' }}>
              {categories.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#8b949e', fontSize: '0.9rem' }}>
                  Belum ada kategori
                </div>
              ) : (
                categories.map((cat, index) => (
                  <div 
                    key={cat.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '10px 14px',
                      borderBottom: index < categories.length - 1 ? '1px solid #21262d' : 'none'
                    }}
                  >
                    {editingId === cat.id ? (
                      <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          disabled={loading}
                          autoFocus
                          style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                          id={`input-edit-category-${cat.id}`}
                        />
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleUpdate(cat.id)} 
                          disabled={loading || !editingName.trim()}
                          style={{ padding: '6px' }}
                          title="Simpan"
                          id={`btn-save-category-${cat.id}`}
                        >
                          <FiCheck size={14} />
                        </button>
                        <button 
                          className="btn btn-ghost" 
                          onClick={cancelEdit} 
                          disabled={loading}
                          style={{ padding: '6px' }}
                          title="Batal"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.95rem' }}>{cat.name}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button 
                            className="btn btn-ghost" 
                            style={{ padding: '6px', color: '#c9d1d9' }}
                            onClick={() => startEdit(cat)}
                            disabled={loading}
                            title="Edit"
                            id={`btn-edit-category-${cat.id}`}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ padding: '6px', color: '#f85149' }}
                            onClick={() => handleDelete(cat.id, cat.name)}
                            disabled={loading}
                            title="Hapus"
                            id={`btn-delete-category-${cat.id}`}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose} disabled={loading}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
