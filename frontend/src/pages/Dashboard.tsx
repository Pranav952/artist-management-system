import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Users from './Users';
import ArtistsPage from './Artists';

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext)!;
  const [tab, setTab] = useState<'users' | 'artists'>('artists');

  const displayName = auth.user ? `${auth.user.first_name || ''} ${auth.user.last_name || ''}`.trim() : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">{displayName}</span>
            <button className="btn" onClick={auth.logout}>Logout</button>
          </div>
        </header>

        <nav className="mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('users')}
              className={`px-3 py-2 rounded ${tab === 'users' ? 'bg-indigo-600 text-white' : 'border'}`}>
              Users
            </button>
            <button
              onClick={() => setTab('artists')}
              className={`px-3 py-2 rounded ${tab === 'artists' ? 'bg-indigo-600 text-white' : 'border'}`}>
              Artists
            </button>
          </div>
        </nav>

        <main>
          <div className="bg-white rounded shadow p-6">
            {tab === 'users' && <Users />}
            {tab === 'artists' && <ArtistsPage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
