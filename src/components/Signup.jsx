import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Building2, Shield } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';

export default function Signup({onNavigate}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactId, setContactId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get contact ID from URL parameter
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('contactId');
    if (id) setContactId(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {

        const params = new URLSearchParams();
        params.append('contactId', contactId);
        params.append('email', email);

      const validationResponse = await fetch('https://hook.us2.make.com/zrl63ln1o0dk7mf4evigzt963uolm17k', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });
      
      console.log('Response status:', validationResponse.status);
      console.log('Response headers:', validationResponse.headers.get('content-type'));
      
      const responseText = await validationResponse.text();
      console.log('Raw response:', responseText);
      
      if (validationResponse.status !== 200) {
        // For 400 status, try to parse error message from JSON
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Invalid contact ID or no applications found');
        } catch {
          throw new Error('Invalid contact ID or no applications found');
        }
      }
  
      // Parse successful response
      const validation = responseText ? JSON.parse(responseText) : {};
      console.log('Validation data:', validation);
  
      // Step 2: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Step 3: Store contact data in Firebase user profile
      const user = userCredential.user;

      // Update the user's display name and profile
        await updateProfile(user, {
            displayName: validation.contact || 'Propel User'
        });

        // Store additional data in Firestore (we'll set this up)
        await setDoc(doc(db, 'users', user.uid), {
            contactId: contactId,
            salesforceEmail: validation.email,
            contactName: validation.contact,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });
      
        console.log('User created with contact data:', {
            uid: user.uid,
            email: user.email,
            contactId: contactId,
            contactName: validation.contact
          });
      
      // TODO: Store validation.contact and validation.email in Firebase user profile
      
    } catch (error) {
      console.error('Full error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Propel America Portal</h1>
              <p className="text-sm text-gray-600">Create Your Account</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Join Propel America</h2>
              <p className="text-gray-600 mt-2">Enter your details to access your personalized portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact ID
                </label>
                <input
                  type="text"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your contact ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Create a secure password"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="text-red-800 text-sm">{error}</div>
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
              <div className="text-center mt-6">
                <p className="text-gray-600">
                    Already have an account?{' '}
                    <a 
                    onClick={(e) => {
                        e.preventDefault();
                        onNavigate?.('login');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer"
                    >
                    Sign in here
                    </a>
                </p>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}