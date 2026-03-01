import React, { useEffect, useState } from 'react';
import { musicService, artistService } from '../services/data';
import Table from '../components/Table';
import { Music, Artist } from '../types';

const pageSize = 10;

const emptyForm: Partial<Music> = {
  title: '',
  album_name: undefined,
  genre: undefined,
};

const MusicPage: React.FC = () => {
  const [music, setMusic] = useState<Music[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Music | null>(null);
  const [form, setForm] = useState<Partial<Music>>(emptyForm);

  const fetchArtists = async () => {
    try {
      const resp = await artistService.getArtists(1, 1000); 
      setArtists(resp.data);
      if (resp.data.length > 0 && !selectedArtistId) {
        setSelectedArtistId(resp.data[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load artists');
    }
  };

  const fetchMusic = async (artistId: number, p = page) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await musicService.getMusicByArtist(artistId, p, pageSize);
      setMusic(resp.data);
      setPage(resp.page);
      setTotal(resp.total);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load music');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    if (selectedArtistId) {
      fetchMusic(selectedArtistId, 1);
    }
  }, [selectedArtistId]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (m: Music) => {
    setEditing(m);
    setForm({
      title: m.title,
      album_name: m.album_name,
      genre: m.genre,
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this song?')) return;
    setLoading(true);
    try {
      await musicService.deleteMusic(id);
      if (selectedArtistId) {
        fetchMusic(selectedArtistId, page);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtistId) {
      setError('Please select an artist first');
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
        await musicService.createMusic(selectedArtistId, cleanData as Omit<Music, 'id' | 'artist_id' | 'created_at' | 'updated_at'>);
      }
      setShowForm(false);
      fetchMusic(selectedArtistId, page);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'title' as const, label: 'Title' },
    { 
      key: 'artist_name' as const, 
      label: 'Artist',
      render: (value: string | undefined) => value || '—'
    },
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
  ];

  const selectedArtist = artists.find(a => a.id === selectedArtistId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Music</h2>
          <div className="flex items-center gap-3">
            <select
              className="border border-gray-300 rounded px-3 py-2"
              value={selectedArtistId || ''}
              onChange={(e) => setSelectedArtistId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Select Artist</option>
              {artists.map(artist => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
            <button 
              className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50" 
              onClick={openCreate}
              disabled={!selectedArtistId}
            >
              New Song
            </button>
          </div>
        </header>

        <main>
          <div className="bg-white rounded shadow p-6">
            {selectedArtist && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  Showing music for: <strong>{selectedArtist.name}</strong>
                </p>
              </div>
            )}
            {error && !showForm && <div className="error-banner">{error}</div>}
            {!selectedArtistId ? (
              <div className="text-center text-gray-500 py-8">
                Please select an artist to view their music
              </div>
            ) : (
              <Table
                columns={columns}
                data={music}
                page={page}
                limit={pageSize}
                total={total}
                loading={loading}
                onPageChange={(p) => { setPage(p); if (selectedArtistId) fetchMusic(selectedArtistId, p); }}
                actions={(row: Music) => (
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                )}
              />
            )}
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

export default MusicPage;
