'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
}

interface Post {
  id: string;
  author: string;
  role: string;
  avatar?: string;
  lang: string;
  time: string;
  text: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  hasLiked?: boolean;
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [newPostText, setNewPostText] = useState('');
  const [newPostTag, setNewPostTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/network?action=posts')
      .then((res) => res.json())
      .then((data) => {
        if (data.posts && Array.isArray(data.posts)) {
          setPosts(
            data.posts.map((p: any) => ({
              id: p.id,
              author: p.author || 'কমরেড',
              role: p.country ? `${p.country_flag || '🚩'} ${p.country}` : 'আন্তর্জাতিক কর্মী',
              lang: p.lang || 'bn',
              time: p.created_at ? new Date(p.created_at).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }) : 'সম্প্রতি',
              text: p.content || p.text || '',
              tags: p.tags || ['সংহতি'],
              likes: (p.reactions && p.reactions.solidarity) || p.likes || 0,
              comments: p.comments || [],
              hasLiked: false
            }))
          );
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch('/api/network?action=react_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, reaction_type: 'like' })
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              const liked = !p.hasLiked;
              return { ...p, likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1), hasLiked: liked };
            }
            return p;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        author_name: user?.name || 'কমরেড',
        content: newPostText.trim(),
        tags: newPostTag ? [newPostTag.trim()] : ['তত্ত্ব'],
        language: 'bn'
      };

      const res = await fetch('/api/network?action=create_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const newPost: Post = {
          id: data.post_id || String(Date.now()),
          author: payload.author_name,
          role: user?.role || 'সদস্য',
          lang: 'bn',
          time: 'এইমাত্র',
          text: payload.content,
          tags: payload.tags,
          likes: 0,
          comments: []
        };
        setPosts([newPost, ...posts]);
        setNewPostText('');
        setNewPostTag('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = selectedLang === 'all' ? posts : posts.filter((p) => p.lang === selectedLang);

  return (
    <div className="feed-container page-wrap" style={{ maxWidth: '960px', margin: '30px auto', padding: '0 20px' }}>
      <div className="feed-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
          🌐 বৈশ্বিক ফিড ও গণআলোচনা (Global Movement Feed)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          আন্তর্জাতিক সমাজতান্ত্রিক কর্মী ও চিন্তকদের রিয়েল-টাইম আলোচনা, সংহতি ও চিন্তাধারা।
        </p>
      </div>

      {/* Language filter chips */}
      <div className="filter-chips-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '22px', paddingBottom: '4px' }}>
        {[
          { code: 'all', label: 'সব ভাষা' },
          { code: 'bn', label: 'বাংলা' },
          { code: 'en', label: 'English' },
          { code: 'es', label: 'Español' },
          { code: 'hi', label: 'हिन्दी' },
          { code: 'ar', label: 'العربية' },
          { code: 'pt', label: 'Português' },
          { code: 'fr', label: 'Français' },
          { code: 'ru', label: 'Русский' },
          { code: 'zh', label: '中文' }
        ].map((item) => (
          <button
            key={item.code}
            type="button"
            className={`filter-chip ${selectedLang === item.code ? 'active' : ''}`}
            onClick={() => setSelectedLang(item.code)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Post Composer */}
      <div className="composer-card card" style={{ padding: '22px', marginBottom: '26px' }}>
        <form onSubmit={handleCreatePost}>
          <textarea
            className="composer-textarea"
            placeholder="আপনার ভাবনা, তাত্ত্বিক বিশ্লেষণ বা আন্দোলনের খবর শেয়ার করুন..."
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-body, #f8f6f0)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="ট্যাগ (যেমন: শ্রম, সাম্রাজ্যবাদ, দর্শন)"
              value={newPostTag}
              onChange={(e) => setNewPostTag(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body, #f8f6f0)', color: 'var(--text-primary)', fontSize: '13px', width: '220px' }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ background: '#c2182b', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
            >
              {isSubmitting ? 'পোস্ট হচ্ছে...' : 'পোস্ট প্রকাশ করুন ➔'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed Posts */}
      <div className="feed-posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredPosts.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            এই ভাষায় এখনো কোনো পোস্ট নেই। নতুন পোস্ট লিখে আলোচনা শুরু করুন!
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article key={post.id} className="feed-post card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#c2182b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {post.author.slice(0, 1)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px' }}>{post.author}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {post.role} • {post.time}
                    </span>
                  </div>
                </div>
                {(() => {
                  const t = Array.isArray(post.tags) ? post.tags : typeof post.tags === 'string' ? (post.tags as string).split(',').map((x: string) => x.trim()).filter(Boolean) : [];
                  if (t.length === 0) return null;
                  return (
                    <span className="interest-chip" style={{ fontSize: '11px' }}>
                      #{t[0]}
                    </span>
                  );
                })()}
              </div>

              <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '16px' }}>
                {post.text}
              </p>

              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.hasLiked ? '#c2182b' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
                >
                  <span>{post.hasLiked ? '❤️' : '🤍'}</span>
                  <span>{post.likes} সংহতি</span>
                </button>

                <div style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💬</span>
                  <span>{post.comments?.length || 0} মন্তব্য</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
