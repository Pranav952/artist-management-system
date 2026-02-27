import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/data';
import Table, { Column } from '../components/Table';
import Modal from '../components/Modal';
import { useTable } from '../hooks/useTable';

const Users: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'm' as 'm' | 'f' | 'o',
    address: '',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const table = useTable<User>({
    initialPage: 1,
    initialLimit: 10,
    onFetch: async (page, limit) => {
      const res = await userService.getUsers(page, limit);
      return { data: res.data, total: res.total };
    },
  });

  useEffect(() => {
    table.refetch();
  }, []);

  const openModal = (user?: User) => {
    setFormError(null);
    if (user) {
      setEditingId(user.id);
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || 'm',
        address: user.address || '',
        password: '',
      });
    } else {
      setEditingId(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'm',
        address: '',
        password: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (!formData.first_name || !formData.last_name || !formData.email) {
        throw new Error('First name, last name, and email are required');
      }

      if (!editingId && !formData.password) {
        throw new Error('Password is required for new users');
      }

      if (editingId) {
        const { password, ...updateData } = formData;
        await userService.updateUser(editingId, updateData);
      } else {
        await userService.createUser(formData as any);
      }

      closeModal();
      await table.refetch();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await userService.deleteUser(id);
      await table.refetch();
    } catch (err: any) {
      table.error || (err.response?.data?.message || 'Failed to delete user');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'first_name',
      label: 'First Name',
      sortable: true,
    },
    {
      key: 'last_name',
      label: 'Last Name',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string) => value || '—',
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (value: string) => {
        const map: Record<string, string> = { m: 'Male', f: 'Female', o: 'Other' };
        return map[value] || '—';
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Users Management</h3>
        <button onClick={() => openModal()} className="btn">
          + Add User
        </button>
      </div>

      <Table<User>
        columns={columns}
        data={table.data}
        page={table.page}
        limit={table.limit}
        total={table.total}
        loading={table.loading}
        error={table.error}
        onPageChange={table.setPage}
        showPagination={true}
        emptyTitle="No Users Found"
        emptyMessage="Start by adding your first user"
        striped={true}
        hoverable={true}
        actions={(user) => (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal(user);
              }}
              className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(user.id);
              }}
              className="text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Edit User' : 'Create User'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={editingId ? 'Update' : 'Create'}
        loading={formLoading}
      >
        <div className="space-y-4">
          {formError && <div className="error-banner">{formError}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">First Name *</label>
              <input
                type="text"
                className="input"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name *</label>
              <input
                type="text"
                className="input"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!editingId}
            />
          </div>

          {!editingId && (
            <div>
              <label className="text-sm font-medium">Password *</label>
              <input
                type="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">DOB</label>
              <input
                type="date"
                className="input"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Gender</label>
              <select
                className="input"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              >
                <option value="m">Male</option>
                <option value="f">Female</option>
                <option value="o">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Address</label>
            <input
              type="text"
              className="input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
