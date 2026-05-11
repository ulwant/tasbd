import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getUsers, updateUserRole } from '../api';

export default function UserManagerModal({ currentUser, onClose, onCurrentUserUpdated }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setUsers(await getUsers());
    } catch (err) {
      toast.error('Gagal memuat akun: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await updateUserRole(id, role);
      setUsers(prev => prev.map(user => user.id === id ? updated : user));
      if (currentUser?.id === id) {
        localStorage.setItem('user', JSON.stringify(updated));
        onCurrentUserUpdated(updated);
      }
      toast.success('Role akun diperbarui');
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 760, width: '92%' }}>
        <div className="modal-header">
          <h3 className="modal-title">Kelola Akun</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>
              Cek akun dan ubah role admin/kasir dari sini.
            </span>
            <button className="btn btn-ghost" onClick={fetchUsers}>
              <FiRefreshCw /> Refresh
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: 24 }}>Memuat...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Dibuat</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          className="form-select"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          style={{ minWidth: 120 }}
                        >
                          <option value="cashier">Kasir</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(user.created_at).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
