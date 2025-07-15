import { Building2 } from 'lucide-react';

export default function Landing({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <Building2 className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Propel America
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Applicant Portal
        </h2>
        
        <p className="text-gray-600 mb-8">
          Log in or sign up to view your progress
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => onNavigate?.('login')}
            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Sign In
          </button>
          
          <button 
            onClick={() => onNavigate?.('signup')}
            className="block w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}