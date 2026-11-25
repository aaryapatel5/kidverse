import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Logo } from '../components/Logo';
import { UserCircle, Baby, ArrowLeft } from 'lucide-react';
import { apiLogin, apiRegister } from '../../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const [userType, setUserType] = useState<'parent' | 'child' | null>(
    typeParam === 'parent' ? 'parent' : typeParam === 'child' ? 'child' : null
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentUsername, setParentUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (typeParam === 'parent') setUserType('parent');
    else if (typeParam === 'child') setUserType('child');
    setErrorMessage('');
    setSuccessMessage('');
  }, [typeParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        // Registration mode
        const role = userType === 'parent' ? 'PARENT' : 'CHILD';
        await apiRegister(
          username.trim(),
          password,
          role,
          userType === 'parent' ? (email.trim() || undefined) : undefined,
          userType === 'child' ? (parentUsername.trim() || undefined) : undefined
        );
        setSuccessMessage('Account registered successfully! Logging you in...');
        
        // Auto-login after registration
        const auth = await apiLogin(username.trim(), password, userType || 'parent');
        localStorage.setItem('userType', userType || '');
        localStorage.setItem('userName', auth.username || username.trim());
        localStorage.setItem('userId', String(auth.id || '1'));
        if (typeof auth.stars === 'number') {
          localStorage.setItem('kidverse_game_stars', String(auth.stars));
        }

        if (userType === 'parent') {
          navigate('/parent');
        } else {
          navigate('/child');
        }
      } else {
        // Strict Login mode - Only existing registered users
        const auth = await apiLogin(username.trim(), password, userType || 'parent');

        // Store user info in localStorage
        localStorage.setItem('userType', userType || '');
        localStorage.setItem('userName', auth.username || username.trim());
        localStorage.setItem('userId', String(auth.id || '1'));
        if (typeof auth.stars === 'number' && auth.stars > 0) {
          localStorage.setItem('kidverse_game_stars', String(auth.stars));
        }

        // Navigate to appropriate dashboard
        if (userType === 'parent') {
          navigate('/parent');
        } else {
          navigate('/child');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isRegistering ? 'Registration failed.' : 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1e3f] to-[#0a0e27] flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          <button
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            style={{ fontSize: '16px' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="text-center mb-12">
            <Logo className="justify-center mb-6" />
            <h1 className="text-white mb-4" style={{ fontSize: '48px', fontWeight: '700' }}>
              Welcome to KidVerse
            </h1>
            <p className="text-gray-300" style={{ fontSize: '20px' }}>
              Choose your account type to continue
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Parent Login */}
            <button
              onClick={() => setUserType('parent')}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-[#8b7bd8] rounded-3xl p-12 transition-all hover:scale-105 group"
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-[#8b7bd8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UserCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-white mb-4" style={{ fontSize: '32px', fontWeight: '700' }}>
                  Parent
                </h2>
                <p className="text-gray-300 text-center" style={{ fontSize: '16px' }}>
                  Browse and purchase kits in your child's universe
                </p>
              </div>
            </button>

            {/* Child Login */}
            <button
              onClick={() => setUserType('child')}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-[#ff8fa3] rounded-3xl p-12 transition-all hover:scale-105 group"
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-[#ff8fa3] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Baby className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-white mb-4" style={{ fontSize: '32px', fontWeight: '700' }}>
                  Child
                </h2>
                <p className="text-gray-300 text-center" style={{ fontSize: '16px' }}>
                  Play games and enjoy fun learning activities
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1e3f] to-[#0a0e27] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => setUserType(null)}
          className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          style={{ fontSize: '16px' }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full ${
              userType === 'parent' ? 'bg-[#8b7bd8]' : 'bg-[#ff8fa3]'
            } flex items-center justify-center mx-auto mb-4`}>
              {userType === 'parent' ? (
                <UserCircle className="w-10 h-10 text-white" />
              ) : (
                <Baby className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-white mb-2" style={{ fontSize: '32px', fontWeight: '700' }}>
              {isRegistering
                ? (userType === 'parent' ? 'Create Parent Account' : 'Create Child Account')
                : (userType === 'parent' ? 'Parent Login' : 'Child Login')}
            </h2>
            <p className="text-gray-300" style={{ fontSize: '16px' }}>
              {isRegistering
                ? 'Register your account in the MySQL database'
                : 'Enter your registered credentials to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-200 text-sm text-center">
                {successMessage}
              </div>
            )}

            <div>
              <label className="block text-white mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={userType === 'parent' ? 'e.g. parent@kidverse.com' : 'e.g. Leo'}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                style={{ fontSize: '16px' }}
              />
            </div>

            {isRegistering && userType === 'parent' && (
              <div>
                <label className="block text-white mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                  style={{ fontSize: '16px' }}
                />
              </div>
            )}

            {isRegistering && userType === 'child' && (
              <div>
                <label className="block text-white mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
                  Parent Username (Optional)
                </label>
                <input
                  type="text"
                  value={parentUsername}
                  onChange={(e) => setParentUsername(e.target.value)}
                  placeholder="e.g. parent@kidverse.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                  style={{ fontSize: '16px' }}
                />
              </div>
            )}

            <div>
              <label className="block text-white mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (minimum 4 characters)"
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                style={{ fontSize: '16px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white transition-colors disabled:opacity-60 shadow-lg ${
                userType === 'parent' 
                  ? 'bg-[#8b7bd8] hover:bg-[#7a6ac7]' 
                  : 'bg-[#ff8fa3] hover:bg-[#ff7a90]'
              }`}
              style={{ fontSize: '18px', fontWeight: '700' }}
            >
              {loading
                ? (isRegistering ? 'Registering...' : 'Logging in...')
                : (isRegistering ? 'Create Account' : 'Login')}
            </button>
          </form>

          {/* Toggle between Login and Registration */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-white/80 hover:text-white underline text-sm transition-colors"
            >
              {isRegistering
                ? 'Already have an account? Log in'
                : "Don't have an account? Sign up here"}
            </button>
          </div>

          <p className="text-center text-gray-400 mt-4 text-xs">
            {isRegistering
              ? 'Please choose a secure username and password to create your account.'
              : 'Enter your registered credentials to access your dashboard.'}
          </p>
        </div>
      </div>
    </div>
  );
}
