import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Logo } from '../components/Logo';
import { UserCircle, Baby, ArrowLeft, Mail, KeyRound, Send, ShieldCheck, Clock } from 'lucide-react';
import { apiLogin, apiRegister, apiSendOtp, apiLoginOtp } from '../../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const [userType, setUserType] = useState<'parent' | 'child' | null>(
    typeParam === 'parent' ? 'parent' : typeParam === 'child' ? 'child' : null
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  
  // Standard credentials
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentUsername, setParentUsername] = useState('');
  
  // Brevo OTP credentials
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (typeParam === 'parent') setUserType('parent');
    else if (typeParam === 'child') setUserType('child');
    setErrorMessage('');
    setSuccessMessage('');
  }, [typeParam]);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const targetEmail = otpEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setOtpLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await apiSendOtp(targetEmail, 'LOGIN');
      setOtpSent(true);
      setSuccessMessage(res.message || '6-digit verification code sent! It expires in 5 minutes.');
      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP code to your email.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetEmail = otpEmail.trim().toLowerCase();
    const targetOtp = otpCode.trim();

    if (!targetEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!targetOtp || targetOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      const auth = await apiLoginOtp(targetEmail, targetOtp, userType || 'parent');
      localStorage.setItem('userType', userType || '');
      localStorage.setItem('userName', auth.username || targetEmail);
      localStorage.setItem('userId', String(auth.id || '1'));
      if (typeof auth.stars === 'number' && auth.stars > 0) {
        localStorage.setItem('kidverse_game_stars', String(auth.stars));
      }

      if (userType === 'parent') {
        navigate('/parent');
      } else {
        navigate('/child');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => {
                setUserType('parent');
                setErrorMessage('');
                setSuccessMessage('');
              }}
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
              onClick={() => {
                setUserType('child');
                setErrorMessage('');
                setSuccessMessage('');
              }}
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

  const accentColor = userType === 'parent' ? '#8b7bd8' : '#ff8fa3';
  const accentButtonBg = userType === 'parent' 
    ? 'bg-[#8b7bd8] hover:bg-[#7a6ac7]' 
    : 'bg-[#ff8fa3] hover:bg-[#ff7a90]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1e3f] to-[#0a0e27] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <button
          onClick={() => {
            setUserType(null);
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          style={{ fontSize: '16px' }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 rounded-full ${
              userType === 'parent' ? 'bg-[#8b7bd8]' : 'bg-[#ff8fa3]'
            } flex items-center justify-center mx-auto mb-4`}>
              {userType === 'parent' ? (
                <UserCircle className="w-10 h-10 text-white" />
              ) : (
                <Baby className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-white mb-2" style={{ fontSize: '30px', fontWeight: '700' }}>
              {isRegistering
                ? (userType === 'parent' ? 'Create Parent Account' : 'Create Child Account')
                : (userType === 'parent' ? 'Parent Login' : 'Child Login')}
            </h2>
            <p className="text-gray-300 text-sm">
              {isRegistering
                ? 'Register your account in the MySQL database'
                : 'Choose your preferred login method'}
            </p>
          </div>

          {/* Authentication Method Tabs (Only for Login) */}
          {!isRegistering && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/10 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('password');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  authMethod === 'password'
                    ? 'bg-white text-[#0a0e27] shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  authMethod === 'otp'
                    ? 'bg-white text-[#0a0e27] shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email OTP
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 mb-5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 mb-5 rounded-xl bg-green-500/20 border border-green-500/50 text-green-200 text-sm text-center">
              {successMessage}
            </div>
          )}

          {/* Mode 1: Brevo Email OTP Login */}
          {!isRegistering && authMethod === 'otp' ? (
            <form onSubmit={handleOtpLogin} className="space-y-5">
              <div>
                <label className="block text-white mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="e.g. parent@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
                  />
                  <Mail className="w-5 h-5 text-white/50 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Send / Resend OTP Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || countdown > 0 || !otpEmail.trim()}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {otpLoading ? (
                    'Sending Code...'
                  ) : countdown > 0 ? (
                    <>
                      <Clock className="w-3.5 h-3.5" /> Resend in {countdown}s
                    </>
                  ) : otpSent ? (
                    <>
                      <Send className="w-3.5 h-3.5" /> Resend Code
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Send 6-Digit Code
                    </>
                  )}
                </button>
              </div>

              {/* 6-Digit OTP Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-white" style={{ fontSize: '14px', fontWeight: '600' }}>
                    6-Digit Verification Code
                  </label>
                  <span className="text-xs text-white/60">Expires in 5 min</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-center font-mono tracking-widest text-lg"
                  />
                  <ShieldCheck className="w-5 h-5 text-white/50 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !otpCode.trim()}
                className={`w-full py-3.5 rounded-xl text-white transition-colors disabled:opacity-60 shadow-lg text-base font-bold ${accentButtonBg}`}
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>
            </form>
          ) : (
            /* Mode 2: Standard Username/Password Login & Registration */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={userType === 'parent' ? 'e.g. parent@kidverse.com' : 'e.g. Leo'}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
                />
              </div>

              {isRegistering && userType === 'parent' && (
                <div>
                  <label className="block text-white mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
                    Email Address (For OTP login & alerts)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. parent@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
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
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
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
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white transition-colors disabled:opacity-60 shadow-lg text-base font-bold ${accentButtonBg}`}
              >
                {loading
                  ? (isRegistering ? 'Registering...' : 'Logging in...')
                  : (isRegistering ? 'Create Account' : 'Login')}
              </button>
            </form>
          )}

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
              : authMethod === 'otp'
              ? 'A 6-digit OTP will be sent to your verified email address via Brevo.'
              : 'Enter your registered credentials to access your dashboard.'}
          </p>
        </div>
      </div>
    </div>
  );
}
