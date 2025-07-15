import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // If user is authenticated, redirect to dashboard and clean URL
      if (user) {
        setCurrentPage('dashboard');
        window.history.replaceState({}, '', '/');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      const path = window.location.pathname;
      if (path === '/login') setCurrentPage('login');
      else if (path === '/signup') setCurrentPage('signup');
      else setCurrentPage('landing');
    }
  }, [user]);

  // Handle navigation for non-authenticated users
  const handleNavigation = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', page === 'landing' ? '/' : `/${page}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // If authenticated, show dashboard
  if (user) {
    return <Dashboard user={user} />;
  }

  // Show auth pages for non-authenticated users
  if (currentPage === 'login') return <Login onNavigate={handleNavigation} />;
  if (currentPage === 'signup') return <Signup onNavigate={handleNavigation} />;
  return <Landing onNavigate={handleNavigation} />;
}

export default App;