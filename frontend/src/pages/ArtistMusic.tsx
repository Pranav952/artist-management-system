import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { musicService, artistService } from '../services/data';
import Table from '../components/Table';
import { Music, Artist } from '../types';

const pageSize = 10;

const emptyForm: Partial<Music> = {
  title: '',
  album_name: undefined,
  genre: undefined,
};

const ArtistMusicPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const [music, setMusic] = useState<Music[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Music | null>(null);
  const [form, setForm] = useState<Partial<Music>>(emptyForm);

  const fetchArtist = useCallback(async () => {
    if (!artistId) return;
    try {
      const resp = await artistService.getArtistById(Number(artistId));
      setArtist(resp);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load artist');
    }
  }, [artistId]);

  const fetchMusic = useCallback(async (p = page) => {
    if (!artistId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await musicService.getMusicByArtist(Number(artistId), p, pageSize);
      setMusic(resp.data);
      setPage(resp.page);
      setTotal(resp.total);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load music');
    } finally {
      setLoading(false);
    }
  }, [artistId, page]);

  useEffect(() => {
    fetchArtist();
    fetchMusic(1);
  }, [artistId]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }, []);

  const openEdit = useCallback((m: Music) => {
    setEditing(m);
    setForm({
      title: m.title,
      album_name: m.album_name,
      genre: m.genre,
    });
    setShowForm(true);
    setError(null);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Delete this song?')) return;
    setLoading(true);
    try {
      await musicService.deleteMusic(id);
      fetchMusic(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  }, [page, fetchMusic]);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId) {
      setError('Artist ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cleanData: Partial<Music> = {
        title: form.title || '',
        album_name: form.album_name || null,
        genre: form.genre || null,
      };

      if (editing) {
        await musicService.updateMusic(editing.id, cleanData);
      } else {
        await musicService.createMusic(Number(artistId), cleanData as Omit<Music, 'id' | 'artist_id' | 'created_at' | 'updated_at'>);
      }
      setShowForm(false);
      fetchMusic(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }, [artistId, form, editing, page, fetchMusic]);

  const columns = useMemo(() => [
    { key: 'title' as const, label: 'Title' },
    {
      key: 'album_name' as const,
      label: 'Album',
      render: (value: string | null) => value || '—'
    },
    {
      key: 'genre' as const,
      label: 'Genre',
      render: (value: string | null) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '—'
    },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              ← Back to Dashboard
            </button>
            <h2 className="text-2xl font-semibold">
              Songs - {artist?.name || 'Loading...'}
            </h2>
          </div>
          <button
            className="px-3 py-2 bg-indigo-600 text-white rounded"
            onClick={openCreate}
          >
            New Song
          </button>
        </header>

        <main>
          <div className="bg-white rounded shadow p-6">
            {error && !showForm && <div className="error-banner">{error}</div>}
            <Table
              columns={columns}
              data={music}
              page={page}
              limit={pageSize}
              total={total}
              loading={loading}
              onPageChange={(p) => { setPage(p); fetchMusic(p); }}
              actions={(row: Music) => (
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
            <div className="bg-white rounded shadow max-w-2xl w-full p-6 mt-20">
              <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Song' : 'New Song'}</h3>
              {error && <div className="error-banner">{error}</div>}
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.title || ''}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Album Name</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.album_name || ''}
                    onChange={(e) => setForm({ ...form, album_name: e.target.value || undefined })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Genre</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.genre || ''}
                    onChange={(e) => setForm({ ...form, genre: (e.target.value || undefined) as 'rnb' | 'country' | 'classic' | 'rock' | 'jazz' | undefined })}
                  >
                    <option value="">—</option>
                    <option value="rnb">RnB</option>
                    <option value="country">Country</option>
                    <option value="classic">Classic</option>
                    <option value="rock">Rock</option>
                    <option value="jazz">Jazz</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button type="button" onClick={() => { setShowForm(false); setError(null); }} className="px-3 py-2 border rounded">Cancel</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ArtistMusicPage);
