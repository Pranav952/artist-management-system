import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext)!;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">{auth.user?.name}</span>
            <button className="btn" onClick={auth.logout}>Logout</button>
          </div>
        </header>

        <main>
          <div className="bg-white rounded shadow p-6">
            <p className="text-sm text-gray-600">Hellow world.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
