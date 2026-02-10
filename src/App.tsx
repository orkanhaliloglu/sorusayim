import { useState } from 'react';
import { Shield } from 'lucide-react';
import { type User } from './types';
import { USERS } from './data/constants';
import { Dashboard } from './components/Dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  if (currentUser) {
    return <Dashboard currentUser={currentUser} onLogout={() => setCurrentUser(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center animate-pulse">
          <Shield className="w-24 h-24 text-avengers-red" />
        </div>
        <h1 className="text-6xl font-display text-transparent bg-clip-text bg-gradient-to-r from-avengers-red via-avengers-gold to-avengers-blue drop-shadow-lg">
          Soru Takip Portalı
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Hoş geldiniz kahramanlar! Günlük görevlerinizi takip edin ve gücünüzü artırın.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 px-4">
          {USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => setCurrentUser(user)}
              className={`group relative overflow-hidden rounded-2xl bg-gray-800 p-6 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-${user.avatarColor}/20 border border-gray-700 hover:border-${user.avatarColor} flex flex-col items-center text-center h-full`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${user.avatarColor}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className={`w-16 h-16 mb-4 rounded-full bg-${user.avatarColor}/20 flex items-center justify-center group-hover:bg-${user.avatarColor}/40 transition-colors`}>
                <Shield className={`w-8 h-8 text-${user.avatarColor}`} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 relative z-10">{user.name}</h2>
              <p className="text-sm text-gray-400 relative z-10 w-full">
                {user.role === 'ortaokul' ? 'Ortaokul' : 'Lise'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
