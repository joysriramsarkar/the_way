/**
 * api/submissions.js — Article Submissions & Revision Requests Engine
 * Allows general users and contributors to submit new articles and request revisions.
 * Allows Admins, Editors, and Moderators to review, approve, and publish submissions.
 * Powered by Supabase + Persistent local data store.
 */

const { createClient } = require('@supabase/supabase-js');
const { verifySession, requireAuth } = require('./_lib/auth');
const { logActivity } = require('./_lib/activity');
const {
  getLocalSubmissions,
  saveLocalSubmission,
  updateLocalSubmission
} = require('./_lib/db-fallback');

function getSupabase() {
  const url = process.env.SUPABASE_URL || 'https://gyhkpjjwwiakhpdqatuh.supabase.co';
  const key = process.env.SUPABASE_SERVICE_KEY;
  return createClient(url, key);
}

function generateSlug(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .slice(0, 100) || `article-${Date.now()}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;
  const sb = getSupabase();

  // ── 1. SUBMIT (New article or revision request) ────────────────────
  if (action === 'submit' && req.method === 'POST') {
    const session = verifySession(req);
    const body = req.body || {};
    const {
      submission_type = 'new_article', // 'new_article' or 'revision'
      target_article_id = null,
      target_article_slug = '',
      title,
      deck = '',
      section = 'theory-philosophy',
      author_name,
      author_email,
      author_role = '',
      author_bio = '',
      hero_img_url = '',
      hero_caption = '',
      content_html,
      revision_notes = ''
    } = body;

    const finalEmail = (session && session.email) || author_email;
    const finalName  = (session && session.name)  || author_name;

    if (!title || !content_html) {
      return res.status(400).json({ error: 'লেখার শিরোনাম এবং বিষয়বস্তু আবশ্যক (Title and content are required).' });
    }
    if (!finalEmail || !finalName) {
      return res.status(400).json({ error: 'লেখকের নাম এবং ইমেইল প্রদান করুন (Author name and email are required).' });
    }

    const submissionData = {
      submission_type,
      target_article_id: target_article_id || null,
      target_article_slug: target_article_slug || '',
      title: String(title).trim(),
      deck: String(deck).trim(),
      section: String(section).trim(),
      author_name: String(finalName).trim(),
      author_email: String(finalEmail).trim().toLowerCase(),
      author_role: String(author_role).trim(),
      author_bio: String(author_bio).trim(),
      hero_img_url: String(hero_img_url).trim(),
      hero_caption: String(hero_caption).trim(),
      content_html: String(content_html).trim(),
      revision_notes: String(revision_notes).trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      // Save locally first for guaranteed persistence
      const savedLocal = saveLocalSubmission(submissionData);

      // Also try saving to Supabase if table exists
      try {
        await sb.from('article_submissions').insert(savedLocal);
      } catch (sbErr) {
        console.warn('[submissions/submit] Supabase insert warning:', sbErr.message);
      }

      // Log activity
      if (session) {
        logActivity({
          actor: session,
          action: submission_type === 'revision' ? 'submission.revision_request' : 'submission.new_article',
          category: 'submissions',
          summary: `${finalName} submitted a ${submission_type === 'revision' ? 'revision request' : 'new article draft'}: "${title}"`,
          target_id: savedLocal.id,
          target_name: title,
          details: { type: submission_type, notes: revision_notes },
          req
        }).catch(() => {});
      }

      return res.status(201).json({
        success: true,
        message: submission_type === 'revision'
          ? 'লেখাটির সংশোধনের আবেদন সফলভাবে গৃহীত হয়েছে! সম্পাদকীয় পর্যালোচনার পর তা হালনাগাদ করা হবে।'
          : 'আপনার নতুন লেখার খসড়া সফলভাবে জমা হয়েছে! সম্পাদকীয় পরিষদ পর্যালোচনা করে তা প্রকাশ করবে।',
        submission: savedLocal
      });

    } catch (err) {
      console.error('[submissions/submit]', err);
      return res.status(500).json({ error: 'আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
    }
  }

  // ── 2. LIST (Get submissions) ──────────────────────────────────────
  if (action === 'list' && req.method === 'GET') {
    const session = verifySession(req);
    const { status_filter, my_only } = req.query;

    try {
      let results = getLocalSubmissions();

      // Attempt reading from Supabase if table exists
      try {
        const { data, error } = await sb
          .from('article_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          // Merge unique by ID
          const ids = new Set(data.map(d => d.id));
          const onlyLocal = results.filter(r => !ids.has(r.id));
          results = [...data, ...onlyLocal];
        }
      } catch (e) {}

      // Filter by status if requested
      if (status_filter && status_filter !== 'all') {
        results = results.filter(s => s.status === status_filter);
      }

      // If requested by a contributor for their own submissions
      if (my_only === 'true' && session) {
        results = results.filter(s => (s.author_email || '').toLowerCase() === session.email.toLowerCase());
      } else {
        const isAdmin = session && ['Admin', 'Moderator', 'Editor'].includes(session.role);
        if (!isAdmin) {
          if (session) {
            results = results.filter(s => (s.author_email || '').toLowerCase() === session.email.toLowerCase());
          } else {
            return res.status(401).json({ error: 'Authentication required' });
          }
        }
      }

      return res.status(200).json(results);

    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── 3. REVIEW (Approve / Reject / Publish) ──────────────────────────
  if (action === 'review' && req.method === 'POST') {
    const session = await requireAuth(req, res);
    if (!session) return;

    if (!['Admin', 'Moderator', 'Editor'].includes(session.role)) {
      return res.status(403).json({ error: 'শুধুমাত্র অ্যাডমিন ও সম্পাদকবৃন্দ আবেদন পর্যালোচনা করতে পারেন।' });
    }

    const { submission_id, status: reviewStatus, reviewer_feedback = '' } = req.body || {};
    if (!submission_id || !['approved', 'rejected'].includes(reviewStatus)) {
      return res.status(400).json({ error: 'submission_id and valid status (approved/rejected) are required' });
    }

    try {
      const all = getLocalSubmissions();
      let sub = all.find(s => String(s.id) === String(submission_id));

      if (!sub) {
        try {
          const { data } = await sb.from('article_submissions').select('*').eq('id', submission_id).maybeSingle();
          if (data) sub = data;
        } catch (e) {}
      }

      if (!sub) {
        return res.status(404).json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি (Submission not found).' });
      }

      const now = new Date().toISOString();

      // If APPROVED -> Publish or Update Article!
      if (reviewStatus === 'approved') {
        if (sub.submission_type === 'new_article') {
          const newSlug = generateSlug(sub.title);
          try {
            await sb.from('articles').insert({
              slug: newSlug,
              title: sub.title,
              deck: sub.deck || '',
              section: sub.section || 'theory-philosophy',
              author: sub.author_name,
              author_role: sub.author_role || '',
              author_bio: sub.author_bio || '',
              hero_img_url: sub.hero_img_url || '',
              hero_caption: sub.hero_caption || '',
              content_html: sub.content_html,
              status: 'published',
              created_by: sub.author_email,
              published_at: now,
              created_at: now
            });
          } catch (artErr) {
            console.warn('[submissions/review] Supabase article publish notice:', artErr.message);
          }
        } else if (sub.submission_type === 'revision') {
          try {
            const targetSlug = sub.target_article_slug;
            const targetId = sub.target_article_id;

            let updateQuery = sb.from('articles').update({
              title: sub.title,
              deck: sub.deck,
              section: sub.section,
              content_html: sub.content_html,
              hero_img_url: sub.hero_img_url || undefined,
              hero_caption: sub.hero_caption || undefined,
              updated_at: now
            });

            if (targetId) updateQuery = updateQuery.eq('id', targetId);
            else if (targetSlug) updateQuery = updateQuery.eq('slug', targetSlug);

            await updateQuery;
          } catch (artErr) {
            console.warn('[submissions/review] Supabase article update notice:', artErr.message);
          }
        }
      }

      // Update local submission record
      updateLocalSubmission(sub.id, {
        status: reviewStatus,
        reviewer_email: session.email,
        reviewer_feedback: reviewer_feedback,
        reviewed_at: now
      });

      // Update Supabase if table exists
      try {
        await sb.from('article_submissions').update({
          status: reviewStatus,
          reviewer_email: session.email,
          reviewer_feedback: reviewer_feedback,
          reviewed_at: now
        }).eq('id', sub.id);
      } catch (e) {}

      logActivity({
        actor: session,
        action: `submission.${reviewStatus}`,
        category: 'submissions',
        summary: `${session.name || session.email} ${reviewStatus} submission: "${sub.title}" (${sub.submission_type})`,
        target_id: String(sub.id),
        target_name: sub.title,
        details: { status: reviewStatus, feedback: reviewer_feedback },
        req
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        message: reviewStatus === 'approved'
          ? 'আবেদনটি সফলভাবে অনুমোদিত ও সংশ্লিষ্ট লেখাটি প্রকাশিত/হালনাগাদ হয়েছে!'
          : 'আবেদনটি সফলভাবে প্রত্যাখ্যান করা হয়েছে।',
        status: reviewStatus
      });

    } catch (e) {
      console.error('[submissions/review]', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Unknown action or method' });
};
