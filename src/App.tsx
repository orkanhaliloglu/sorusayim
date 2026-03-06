import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { type User } from './types';
import { USERS } from './data/constants';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { KarnelerPage } from './pages/KarnelerPage';
import { Loader2 } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Find the user in our constants based on email
        const appUser = USERS.find(u => u.email === firebaseUser.email);
        if (appUser) {
          setCurrentUser(appUser);
        } else {
          console.warn('User not found in app constants:', firebaseUser.email);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Safety timeout: If auth takes too long (e.g. network issue), stop loading
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.log('Auth timed out, showing login page');
          return false;
        }
        return prev;
      });
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const [currentView, setCurrentView] = useState<'dashboard' | 'karneler'>('dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'karneler') {
        setCurrentView('karneler');
      } else {
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial execution runs on load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.hash = '';
    // State update handled by onAuthStateChanged
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-avengers-blue animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    if (currentView === 'karneler') {
      return <KarnelerPage currentUser={currentUser} onBack={() => { window.location.hash = 'dashboard'; }} />;
    }
    return <Dashboard currentUser={currentUser} onLogout={handleLogout} onNavigateToKarneler={() => { window.location.hash = 'karneler'; }} />;
  }

  return <LoginPage />;
}

export default App;
