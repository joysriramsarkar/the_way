/**
 * api/network.ts — The Way Socialist Network Engine
 * Handles Posts, Comments, Reactions, Profiles, Groups, and Solidarity Campaigns.
 * Provides instant persistence via local JSON store and connects to Supabase when active.
 */

import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { verifySession } from './_lib/auth';
import type { ApiRequest, ApiResponse, SocialistPost, SolidarityRequest } from '../types';

function getSbClient(): SupabaseClient | null {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    } catch (e) {}
  }
  return null;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readData<T>(filename: string, defaultVal: T): T {
  try {
    const p = path.join(DATA_DIR, filename);
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, JSON.stringify(defaultVal, null, 2), 'utf8');
      return defaultVal;
    }
    return JSON.parse(fs.readFileSync(p, 'utf8')) || defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function writeData<T>(filename: string, data: T): boolean {
  try {
    const p = path.join(DATA_DIR, filename);
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e: any) {
    console.error(`[network-storage] Error writing ${filename}:`, e.message);
    return false;
  }
}

// Initial seed data if files don't exist
const SEED_POSTS: any[] = [
  {
    id: 'post_1',
    author: 'Amira Hassan',
    country: 'Egypt',
    country_flag: '🇪🇬',
    initials: 'AH',
    lang: 'en',
    post_type: 'post',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    content: 'The recent wave of strikes in Egypt shows that despite decades of neoliberal restructuring, the working class still has the capacity for organized resistance. What we need now is not just economic demands but political ones.\n\nThe link between labour and broader democratization is not coincidental — it is structural.',
    reactions: { solidarity: 47 },
    comments: [
      { id: 'c1', author: 'Red Sparrow', content: 'Fully agree. Strike committees must also become political organs.', created_at: new Date(Date.now() - 3600 * 1000).toISOString() }
    ]
  },
  {
    id: 'post_2',
    author: 'João Silva',
    country: 'Brazil',
    country_flag: '🇧🇷',
    initials: 'JS',
    lang: 'pt',
    post_type: 'debate',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    content: 'Debate: O ecossocialismo é uma síntese viável entre marxismo e ecologia, ou há contradições fundamentais entre desenvolvimento das forças produtivas e sustentabilidade ecológica?\n\nMinha posição: precisamos de uma ruptura com o produtivismo dentro do próprio marxismo.',
    reactions: { solidarity: 89 },
    comments: []
  },
  {
    id: 'post_3',
    author: 'Red Sparrow',
    country: 'Bangladesh',
    country_flag: '🇧🇩',
    initials: 'RS',
    lang: 'bn',
    post_type: 'question',
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    content: 'প্রশ্ন: মার্ক্স ও এঙ্গেলসের "কমিউনিস্ট ইশতেহারে" যে সর্বহারা শ্রেণির কথা বলা হয়েছে, সেই ধারণাটি আজকের গিগ ইকোনমি, প্ল্যাটফর্ম শ্রমিক ও অনানুষ্ঠানিক খাতের শ্রমিকদের ক্ষেত্রে কতটা প্রযোজ্য?\n\nআপনাদের মতামত ও মাঠপর্যায়ের অভিজ্ঞতা জানতে চাই।',
    reactions: { solidarity: 63 },
    comments: [
      { id: 'c2', author: 'Priya Nair', content: 'গিগ শ্রমিকরা যন্ত্র বা প্ল্যাটফর্মের মালিক নয়, তারা অ্যালগরিদমের অধীনে মজুরি দাসত্বে যুক্ত। সারমর্মে তারা আধুনিক সর্বহারা।', created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString() }
    ]
  },
  {
    id: 'post_4',
    author: 'Sofia Papadopoulou',
    country: 'Greece',
    country_flag: '🇬🇷',
    initials: 'SP',
    lang: 'en',
    post_type: 'solidarity_request',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    content: 'SOLIDARITY REQUEST\n\nGreek metal workers at Hellenic Steel have been on strike for 47 days. The management is threatening lockouts. We need:\n• International statements of solidarity\n• Translation of strike bulletin to Bengali, Spanish, Arabic\n• Trade union amplification\n\nStand with Hellenic Steel Workers!',
    reactions: { solidarity: 134 },
    comments: []
  }
];

const SEED_SOLIDARITY: SolidarityRequest[] = [
  {
    id: 'sol_1',
    title: 'Hellenic Steel Strike Solidarity',
    organization: 'Hellenic Federation of Metalworkers',
    location: 'Greece',
    target: 'Greek Ministry of Labour',
    current_pledges: 28,
    description: 'Workers striking for collective bargaining agreements, workplace safety guarantees, and wage indexation against rampant inflation.'
  },
  {
    id: 'sol_2',
    title: 'Ashulia Garments Workers Defense Fund',
    organization: 'Bangladesh Garment Sramik Sangram Parishad',
    location: 'Bangladesh',
    target: 'BGMEA & Government',
    current_pledges: 45,
    description: 'Demanding liveable minimum wage of 25,000 BDT, withdrawal of false police cases against 80+ worker representatives, and end to blacklisting.'
  },
  {
    id: 'sol_3',
    title: 'Defend Indigenous Yanomami Land from Illegal Mining',
    organization: 'Coletivo de Luta pela Terra',
    location: 'Brazil',
    target: 'Federal Government of Brazil',
    current_pledges: 62,
    description: 'Organizing international campaign against illegal gold extraction and mercury poisoning of rivers in the Amazon rainforest basin.'
  }
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers && req.headers.origin) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  const action = query.action || 'posts';
  const session = verifySession(req);

  // ══════════════════════════════════════════════════════════════════
  // 1. POSTS ACTIONS
  // ══════════════════════════════════════════════════════════════════
  if (action === 'posts' || action === 'create_post') {
    // GET Posts
    if (req.method === 'GET') {
      const filter = query.filter || 'all';
      const lang = query.lang || 'all';
      const limit = Math.min(parseInt(query.limit || '20', 10) || 20, 50);

      let posts = readData<any[]>('network_posts.json', SEED_POSTS);

      if (filter !== 'all') {
        posts = posts.filter(p => p.post_type === filter);
      }
      if (lang !== 'all') {
        posts = posts.filter(p => p.lang === lang);
      }

      posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return res.status(200).json({
        success: true,
        total: posts.length,
        posts: posts.slice(0, limit)
      });
    }

    // POST: Create New Post
    if (req.method === 'POST') {
      const body = req.body || {};
      const content = (body.content || '').trim();
      if (!content) {
        return res.status(400).json({ error: 'Post content cannot be empty' });
      }

      const rawAuthor = body.author;
      const authorName = (session && (session.name || session.email)) || (typeof rawAuthor === 'object' ? rawAuthor?.name : rawAuthor) || 'Anonymous Comrade';
      const initials = authorName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'TW';
      const postType = body.post_type || body.category || 'post';
      const lang = body.lang || 'bn';

      const newPost = {
        id: 'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        author: authorName,
        country: body.country || 'Global',
        country_flag: body.country_flag || '🌍',
        initials,
        lang,
        post_type: postType,
        created_at: new Date().toISOString(),
        content,
        reactions: { solidarity: 1 },
        comments: []
      };

      const posts = readData<any[]>('network_posts.json', SEED_POSTS);
      posts.unshift(newPost);
      writeData('network_posts.json', posts);

      return res.status(201).json({ success: true, post: newPost });
    }
  }

  // ── REACT TO POST ────────────────────────────────────────────────
  if (action === 'react' && req.method === 'POST') {
    const { postId, post_id } = req.body || {};
    const targetPostId = postId || post_id;
    if (!targetPostId) return res.status(400).json({ error: 'Missing postId' });

    const posts = readData<any[]>('network_posts.json', SEED_POSTS);
    const post = posts.find(p => p.id === targetPostId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!post.reactions) post.reactions = {};
    post.reactions.solidarity = (post.reactions.solidarity || 0) + 1;
    writeData('network_posts.json', posts);

    return res.status(200).json({ success: true, count: post.reactions.solidarity, reactions: post.reactions });
  }

  // ── ADD COMMENT ──────────────────────────────────────────────────
  if (action === 'comment' && req.method === 'POST') {
    const { postId, post_id, content, author } = req.body || {};
    const targetPostId = postId || post_id;
    if (!targetPostId || !content) return res.status(400).json({ error: 'Missing postId or content' });

    const posts = readData<any[]>('network_posts.json', SEED_POSTS);
    const post = posts.find(p => p.id === targetPostId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      author: (session && (session.name || session.email)) || author || 'Comrade',
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    if (!post.comments) post.comments = [];
    post.comments.push(comment);
    writeData('network_posts.json', posts);

    return res.status(201).json({ success: true, comment, comments: post.comments });
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. PROFILES ACTIONS
  // ══════════════════════════════════════════════════════════════════
  if (action === 'profile') {
    const profiles = readData<any[]>('network_profiles.json', []);

    if (req.method === 'GET') {
      const id = query.id;
      if (id) {
        const found = profiles.find(p => p.id === id || p.pseudonym === id || p.email === id);
        if (found) return res.status(200).json({ profile: found });
      }
      return res.status(200).json({ profiles });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const userEmail = (session && session.email) || body.email || 'guest@theway.network';

      let existingIdx = profiles.findIndex(p => p.email === userEmail || (body.id && p.id === body.id));
      const profileData = {
        id: (existingIdx >= 0 ? profiles[existingIdx].id : 'p_' + Date.now()),
        email: userEmail,
        name: body.name || 'Anonymous Comrade',
        pseudonym: body.pseudonym || body.name,
        country: body.country || '',
        city: body.city || '',
        role: body.role || 'Member',
        bio: body.bio || '',
        ideologies: body.ideologies || ['Marxist'],
        languages: body.languages || ['Bengali'],
        interests: body.interests || ['Labour'],
        privacy: body.privacy || { email_public: false, city_public: false },
        updated_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        profiles[existingIdx] = { ...profiles[existingIdx], ...profileData };
      } else {
        profiles.push(profileData);
      }
      writeData('network_profiles.json', profiles);

      return res.status(200).json({ success: true, profile: profileData });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. GROUPS & READING CIRCLES
  // ══════════════════════════════════════════════════════════════════
  if (action === 'groups' || action === 'get_groups') {
    const groups = readData<any[]>('network_groups.json', [
      {
        id: 'grp_1',
        name: 'Marxist Political Economy Circle',
        name_bn: 'মার্ক্সবাদী রাজনৈতিক অর্থনীতি পাঠচক্র',
        category: 'Theory',
        lang: 'en',
        members_count: 142,
        description: "Weekly reading group analyzing Marx's Capital and theories of imperialism."
      },
      {
        id: 'grp_2',
        name: 'বাংলা সমাজতান্ত্রিক পাঠশালা',
        name_bn: 'বাংলা সমাজতান্ত্রিক পাঠশালা',
        category: 'Philosophy',
        lang: 'bn',
        members_count: 320,
        description: 'ঐতিহাসিক বস্তুবাদ, দ্বন্দ্বমূলক বস্তুবাদ এবং ভারতীয় উপমহাদেশের কমিউনিস্ট আন্দোলনের ইতিহাস।'
      }
    ]);

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, total: groups.length, groups });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.name) return res.status(400).json({ error: 'Group name required' });

      const newGroup = {
        id: 'grp_' + Date.now(),
        name: body.name,
        name_bn: body.name_bn || body.name,
        category: body.category || 'General',
        lang: body.lang || 'bn',
        members_count: 1,
        description: body.description || '',
        schedule: body.schedule || 'Every Sunday',
        created_at: new Date().toISOString()
      };

      groups.push(newGroup);
      writeData('network_groups.json', groups);
      return res.status(201).json({ success: true, group: newGroup });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. SOLIDARITY ACTIONS
  // ══════════════════════════════════════════════════════════════════
  if (action === 'solidarity' || action === 'solidarity_requests') {
    let requests = readData<any[]>('network_solidarity.json', SEED_SOLIDARITY);

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, total: requests.length, requests });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.title || !body.organization) {
        return res.status(400).json({ error: 'Title and Organization are required' });
      }

      const newReq = {
        id: 'sol_' + Date.now(),
        title: body.title,
        organization: body.organization,
        country: body.country || 'Global',
        country_flag: body.country_flag || '🌍',
        status: 'active',
        description: body.description || '',
        needs: body.needs || ['Public Statement'],
        pledges_count: 1,
        created_at: new Date().toISOString()
      };

      requests.unshift(newReq);
      writeData('network_solidarity.json', requests);
      return res.status(201).json({ success: true, request: newReq });
    }
  }

  // ── PLEDGE SOLIDARITY ────────────────────────────────────────────
  if (action === 'pledge' && req.method === 'POST') {
    const { requestId } = req.body || {};
    if (!requestId) return res.status(400).json({ error: 'Missing requestId' });

    let requests = readData<any[]>('network_solidarity.json', SEED_SOLIDARITY);
    const reqItem = requests.find(r => r.id === requestId);
    if (!reqItem) return res.status(404).json({ error: 'Solidarity request not found' });

    reqItem.pledges_count = (reqItem.pledges_count || 0) + 1;
    writeData('network_solidarity.json', requests);

    return res.status(200).json({
      success: true,
      message: 'সংহতি প্রতিজ্ঞা সফলভাবে গৃহীত হয়েছে!',
      count: reqItem.pledges_count
    });
  }

  return res.status(400).json({ error: 'Invalid network action' });
}

module.exports = handler;
(module.exports as any).default = handler;
