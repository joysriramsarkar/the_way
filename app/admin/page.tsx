'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'articles' | 'users'>('submissions');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || !['Admin', 'Moderator', 'Editor'].includes(user.role)) {
        router.push('/login');
      } else {
        loadSubmissions();
      }
    }
  }, [user, isLoading, router]);

  const loadSubmissions = async () => {
    setLoadingData(true);
    const token = localStorage.getItem('theway_token');
    try {
      const res = await fetch('/api/articles?action=admin_submissions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch {
      setSubmissions([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    const token = localStorage.getItem('theway_token');
    try {
      const res = await fetch('/api/articles?action=review_submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ submission_id: id, status: newStatus })
      });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
      }
    } catch {
      alert('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        অ্যাডমিন প্যানেল যাচাই করা হচ্ছে...
      </div>
    );
  }

  return (
    <div className="admin-page page-wrap" style={{ maxWidth: '1140px', margin: '36px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
            ⚙️ সম্পাদকীয় ও অ্যাডমিন কন্ট্রোল রুম (Editorial HQ)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', margin: 0 }}>
            স্বাগতম, <strong>{user.name}</strong> ({user.role}) — লেখা যাচাই, প্রকাশনা ও নেটওয়ার্ক নিয়ন্ত্রণ।
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/admin/editor"
            style={{ background: '#c2182b', color: '#fff', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px' }}
          >
            ✏️ আর্টিকেল এডিটর
          </Link>
          <Link
            href="/submit"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '13.5px' }}
          >
            ✍️ পাবলিক সাবমিশন
          </Link>
        </div>
      </div>

      {/* Admin Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #c2182b' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>বিবেচনাধীন আবেদন</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#c2182b', marginTop: '6px' }}>
            {submissions.filter((s) => s.status === 'pending').length}
          </div>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #16a34a' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ডাটাবেজ ইঞ্জিন</span>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a', marginTop: '10px' }}>
            Neon Cloud Postgres
          </div>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>সক্রিয় ভাষা</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>
            ৯টি ভাষা
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'submissions' ? '#c2182b' : 'var(--bg-card)',
            color: activeTab === 'submissions' ? '#fff' : 'var(--text-primary)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📋 জমাকৃত আবেদনসমূহ
        </button>
      </div>

      {/* Submissions Table */}
      <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>জমাকৃত আর্টিকেলের তালিকা</h3>
        {loadingData ? (
          <p style={{ color: 'var(--text-muted)' }}>লোড হচ্ছে...</p>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            কোনো বিবেচনাধীন আবেদন নেই।
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>শিরোনাম</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>লেখক</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>বিভাগ</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>অবস্থা</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 14px' }}><strong>{s.title}</strong></td>
                  <td style={{ padding: '12px 14px' }}>{s.author_name}</td>
                  <td style={{ padding: '12px 14px' }}>{s.section}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="role-badge" style={{ background: s.status === 'approved' ? '#16a34a' : s.status === 'rejected' ? '#dc2626' : '#d97706' }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', display: 'flex', gap: '8px' }}>
                    {s.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(s.id, 'approved')}
                          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                        >
                          ✓ অনুমোদন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(s.id, 'rejected')}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                        >
                          ✕ বাতিল
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
