import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Shield, Terminal, AlertTriangle, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', adminSecurityKey: '' });
  const [code, setCode] = useState('');
  const [stage, setStage] = useState('form'); // form -> otp
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'account_exists') {
      setErrorMessage('⚠️ Admin account already exists. Use login instead.');
      toast.error('Admin account already exists. Use login instead.');
    } else if (error === 'oauth_failed') {
      setErrorMessage('❌ Authentication failed. Access denied.');
      toast.error('Authentication failed. Access denied.');
    }
  }, [searchParams]);

  const startRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    if (!formData.name || !formData.email || !formData.password || !formData.adminSecurityKey) {
      const message = '⚠️ All fields required for clearance';
      setErrorMessage(message);
      toast.error('All fields required for clearance');
      return;
    }

    if (formData.password.length < 8) {
      const message = '⚠️ Access key must be at least 8 characters';
      setErrorMessage(message);
      toast.error('Access key must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register/initiate', {
        ...formData,
        role: 'admin' // Request admin role
      });
      toast.success(res.data?.message || 'Verification code transmitted');
      setStage('otp');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setErrorMessage('❌ ' + message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyRegistration = async (e) => {
    e.preventDefault();

    if (!code) {
      toast.error('Enter verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register/verify', {
        email: formData.email,
        code,
      });

      const { token, user } = res.data;

      // Verify admin role was granted
      if (user.role !== 'admin') {
        toast.error('Admin privileges not granted');
        setLoading(false);
        return;
      }

      login(user, token);
      toast.success('Root access granted. Welcome to the system.');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Dark red background gradient */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-red-900/20 to-black"></div>
      </div>

      {/* Animated top bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-600 via-orange-500 to-red-600 animate-pulse"></div>

      <Card className="w-full max-w-md p-8 border-red-900/50 bg-slate-950 z-10 shadow-2xl shadow-red-900/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 text-red-500 border border-red-600/50 mb-4 animate-pulse">
            {stage === 'form' ? <Shield className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-red-500 tracking-wider font-mono mb-2">
            {stage === 'form' ? '[ADMIN CLEARANCE]' : '[VERIFY ACCESS]'}
          </h1>
          <p className="text-red-400/70 text-xs font-mono uppercase tracking-widest">
            {stage === 'form'
              ? '⚠ HIGH SECURITY REGISTRATION ⚠'
              : 'AUTHENTICATION CODE REQUIRED'}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
            <Terminal className="w-3 h-3" />
            <span>ENCRYPTED CONNECTION ACTIVE</span>
          </div>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="bg-red-950/50 border-2 border-red-600/50 rounded-xl p-4 mb-6 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-200 font-mono font-bold">{errorMessage}</p>
                {errorMessage.includes('already exists') && (
                  <Link 
                    to="/admin/login" 
                    className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200 mt-2 font-mono"
                  >
                    → ACCESS SYSTEM
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {stage === 'form' ? (
          <form onSubmit={startRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-red-400/80 mb-2 uppercase tracking-wider">
                Operator Name
              </label>
              <Input
                type="text"
                placeholder="Agent Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="font-mono bg-black/50 border-red-900/50 text-red-100 placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-red-400/80 mb-2 uppercase tracking-wider">
                Admin Email
              </label>
              <Input
                type="email"
                placeholder="root@deadman.sys"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="font-mono bg-black/50 border-red-900/50 text-red-100 placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-red-400/80 mb-2 uppercase tracking-wider">
                Create Account Password (Min 8 chars)
              </label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="font-mono bg-black/50 border-red-900/50 text-red-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-red-400/80 mb-2 uppercase tracking-wider">
                Admin Security Key
              </label>
              <Input
                type="password"
                placeholder="System Level Clearance Key"
                value={formData.adminSecurityKey}
                onChange={(e) => setFormData({ ...formData, adminSecurityKey: e.target.value })}
                className="font-mono bg-red-950/20 border-red-500/50 text-red-100 placeholder:text-red-900/50 focus:border-red-500"
                required
              />
            </div>

            <Button 
              type="submit" 
              isLoading={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-mono uppercase tracking-wider mt-6"
            >
              {loading ? 'Requesting...' : 'Request Clearance'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-red-900/30"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950 px-2 text-red-600/50 font-mono">Secure Auth</span>
              </div>
            </div>

          </form>
        ) : (
          <form onSubmit={verifyRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-red-400/80 mb-2 uppercase tracking-wider">
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono bg-black/50 border-red-900/50 text-red-100 text-center text-lg tracking-widest placeholder:text-slate-600"
                required
              />
            </div>

            <Button 
              type="submit" 
              isLoading={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-mono uppercase tracking-wider"
            >
              {loading ? 'Verifying...' : 'Verify & Grant Access'}
            </Button>

            <p className="text-xs text-red-500/70 text-center font-mono">
              Check your email for the authentication code
            </p>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-red-900/30">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <AlertTriangle className="w-3 h-3" />
            <p className="font-mono">
              Already have clearance?{' '}
              <Link to="/admin/login" className="text-red-500 hover:text-red-400 font-semibold">
                Access System
              </Link>
            </p>
          </div>
          <div className="text-center mt-3">
            <Link to="/register" className="text-xs text-slate-600 hover:text-slate-500 font-mono">
              ← User Registration
            </Link>
          </div>
        </div>

        {/* Warning banner */}
        <div className="mt-4 p-2 bg-red-950/30 border border-red-900/50 rounded text-center">
          <p className="text-[10px] text-red-400/70 font-mono uppercase tracking-wider">
            All registration attempts are logged and monitored
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminRegister;
