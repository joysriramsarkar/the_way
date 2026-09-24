'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'Contributor' })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        login(data.token, data.user);
        router.push('/submit');
      } else {
        setError(data.error || 'নিবন্ধন ব্যর্থ হয়েছে। ভিন্ন ইমেইল চেষ্টা করুন।');
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
            নিবন্ধন (Register)
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
            দ্য ওয়ে নেটওয়ার্কে কমরেড হিসেবে যুক্ত হোন
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '13px', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>আপনার পূর্ণ নাম</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: কমরেড জয়"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>ইমেইল অ্যাড্রেস</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার সক্রিয় ইমেইল..."
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড নির্ধারণ করুন..."
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#c2182b', color: '#fff', fontWeight: 700, fontSize: '14.5px', cursor: 'pointer' }}
          >
            {loading ? 'নিবন্ধন করা হচ্ছে...' : 'নিবন্ধন করুন ➔'}
          </button>
        </form>

        <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          ইতিমধ্যে অ্যাকাউন্ট রয়েছে?{' '}
          <Link href="/login" style={{ color: '#c2182b', fontWeight: 600, textDecoration: 'none' }}>
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
