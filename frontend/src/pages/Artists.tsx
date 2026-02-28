import React, { useEffect, useState } from 'react';
import { artistService } from '../services/data';
import Table from '../components/Table';
import { Artist } from '../types';

const pageSize = 10;

const emptyForm: Partial<Artist> = {
  name: '',
  dob: undefined,
  gender: undefined,
  address: undefined,
  first_release_year: undefined,
  no_of_albums_released: 0,
};

const ArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Artist | null>(null);
  const [form, setForm] = useState<Partial<Artist>>(emptyForm);

  const fetch = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await artistService.getArtists(p, pageSize);
      setArtists(resp.data);
      setPage(resp.page);
      setTotal(resp.total);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(1);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (a: Artist) => {
    setEditing(a);
    setForm(a);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this artist?')) return;
    setLoading(true);
    try {
      await artistService.deleteArtist(id);
      fetch(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editing) {
        await artistService.updateArtist(editing.id, form as Partial<Artist>);
      } else {
        await artistService.createArtist(form as Omit<Artist, 'id' | 'created_at' | 'updated_at'>);
      }
      setShowForm(false);
      fetch(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name' as const, label: 'Name' },
    { key: 'first_release_year' as const, label: 'First Release' },
    { key: 'no_of_albums_released' as const, label: 'Albums' },
    { key: 'created_at' as const, label: 'Created' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Artists</h2>
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={openCreate}>New Artist</button>
          </div>
        </header>

        <main>
          <div className="bg-white rounded shadow p-6">
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <Table
              columns={columns}
              data={artists}
              page={page}
              limit={pageSize}
              total={total}
              loading={loading}
              onPageChange={(p) => { setPage(p); fetch(p); }}
              actions={(row: Artist) => (
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                </div>
              )}
            />
          </div>
        </main>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center p-6">
            <div className="bg-white rounded shadow max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Artist' : 'New Artist'}</h3>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Release Year</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={form.first_release_year ?? ''}
                      onChange={(e) => setForm({ ...form, first_release_year: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Albums Released</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={form.no_of_albums_released ?? 0}
                      onChange={(e) => setForm({ ...form, no_of_albums_released: e.target.value ? Number(e.target.value) : 0 })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={form.gender || ''}
                      onChange={(e) => setForm({ ...form, gender: e.target.value || undefined })}
                    >
                      <option value="">—</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.address || ''}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistsPage;
