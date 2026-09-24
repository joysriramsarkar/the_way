'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        login(data.token, data.user);
        if (data.user && ['Admin', 'Moderator', 'Editor'].includes(data.user.role)) {
          router.push('/admin');
        } else {
          router.push('/submit');
        }
      } else {
        setError(data.error || 'লগইন ব্যর্থ হয়েছে। সঠিক ইমেইল ও পাসওয়ার্ড প্রদান করুন।');
      }
    } catch {
      setError('সার্ভারে সংযোগ করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <img src="/assets/images/logo.svg" alt="The Way" style={{ height: '44px', marginBottom: '10px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            প্রবেশদ্বার (Login)
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
            দ্য ওয়ে (The Way) — সম্পাদকীয় ও লেখক পরিষদ
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '13px', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>ইমেইল অ্যাড্রেস</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার নিবন্ধিত ইমেইল..."
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>পাসওয়ার্ড</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড লিখুন..."
                style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#c2182b', color: '#fff', fontWeight: 700, fontSize: '14.5px', cursor: 'pointer' }}
          >
            {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন ➔'}
          </button>
        </form>

        <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          নতুন অ্যাকাউন্ট প্রয়োজন?{' '}
          <Link href="/register" style={{ color: '#c2182b', fontWeight: 600, textDecoration: 'none' }}>
            এখানে নিবন্ধন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
