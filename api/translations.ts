/**
 * api/translations.ts — Collaborative Translation Engine
 * Handles translation proposals, volunteer claiming, drafts, reviews, and publishing.
 * Fulfills Chapters 10, 11, 26, 56, 57 of The Way roadmap.
 */

import fs from 'fs';
import path from 'path';
import { verifySession } from './_lib/auth';
import type { ApiRequest, ApiResponse, TranslationProject } from '../types';

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
    console.error(`[translations-storage] Error writing ${filename}:`, e.message);
    return false;
  }
}

// Curated seed translation projects
const SEED_PROJECTS: TranslationProject[] = [
  {
    id: 'tr_1',
    source_title: 'Imperialism: The Highest Stage of Capitalism (Preface)',
    source_author: 'Vladimir Lenin',
    source_lang: 'ru',
    target_lang: 'bn',
    status: 'in_progress',
    translator: 'তানভীর আহমেদ',
    translator_name: 'তানভীর আহমেদ',
    progress: 75,
    original_text: 'The pamphlet here presented to the reader was written in the spring of 1916, in Zurich. Of course, the Zurich censorship was strict, and I was forced to confine myself to an exclusively, theoretically economic analysis.',
    translated_text: 'এখানে পাঠকের সামনে উপস্থাপিত পুস্তিকাটি ১৯১৬ সালের বসন্তে জুরিখ শহরে রচিত হয়েছিল। নিশ্চিতভাবেই জুরিখের সেন্সরশিপ অত্যন্ত কঠোর ছিল এবং আমি নিজেকে একান্তভাবে অর্থনৈতিক বিশ্লেষণের মধ্যেই সীমাবদ্ধ রাখতে বাধ্য হয়েছিলাম।',
    created_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'tr_2',
    source_title: 'Reform or Revolution (Chapter 1)',
    source_author: 'Rosa Luxemburg',
    source_lang: 'de',
    target_lang: 'es',
    status: 'review_requested',
    translator: 'Ana Rodriguez',
    translator_name: 'Ana Rodriguez',
    progress: 100,
    original_text: 'At first glance the title of this work may be surprising to some. Can social democracy be against reforms? Can we contrapose the social revolution to social reforms?',
    translated_text: 'A primera vista, el título de esta obra puede sorprender a algunos. ¿Puede la socialdemocracia estar en contra de las reformas? ¿Podemos contraponer la revolución social a las reformas sociales?',
    created_at: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'tr_3',
    source_title: 'Crisis of Capitalist Agriculture in the Global South',
    source_author: 'The Way Editorial Collective',
    source_lang: 'en',
    target_lang: 'ar',
    status: 'requested',
    translator: null,
    translator_name: null,
    progress: 0,
    original_text: 'The structural crisis of peasant farming under globalized agribusiness monopolies requires an international socialist agrarian program.',
    translated_text: '',
    created_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString()
  }
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers && req.headers.origin) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  const body = req.body || {};
  const action = query.action || body.action || 'list';
  const session = verifySession(req);

  let projects = readData<TranslationProject[]>('translations.json', SEED_PROJECTS);

  // ── 1. LIST TRANSLATION PROJECTS ──────────────────────────────────
  if (action === 'list') {
    const status = query.status || body.status || 'all';
    const lang = query.lang || body.lang || 'all';

    let list = projects;
    if (status !== 'all') list = list.filter(p => p.status === status);
    if (lang !== 'all') list = list.filter(p => p.target_lang === lang || p.source_lang === lang);

    list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return res.status(200).json({
      success: true,
      total: list.length,
      projects: list,
      proposals: list,
      languages: ['bn', 'en', 'es', 'hi', 'ar', 'pt', 'fr', 'ru']
    });
  }

  // ── 2. GET SINGLE PROJECT ─────────────────────────────────────────
  if (action === 'get') {
    const id = query.id || body.id || body.project_id;
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Translation project not found' });
    return res.status(200).json({ success: true, project });
  }

  // ── 3. REQUEST NEW TRANSLATION ────────────────────────────────────
  if (action === 'request' && req.method === 'POST') {
    const source_title = body.source_title || body.title;
    const target_lang = body.target_lang;
    if (!source_title || !target_lang) {
      return res.status(400).json({ error: 'Source title and target language are required' });
    }

    const newProject: TranslationProject = {
      id: 'tr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      source_title,
      source_author: body.source_author || body.author || 'Socialist Classic',
      source_lang: body.source_lang || 'en',
      target_lang,
      status: 'requested',
      translator: null,
      translator_name: null,
      translator_email: null,
      proposer_name: body.proposer_name || null,
      proposer_email: body.proposer_email || null,
      progress: 0,
      original_text: body.original_text || body.source_text || '',
      translated_text: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    projects.unshift(newProject);
    writeData('translations.json', projects);
    return res.status(201).json({ success: true, project: newProject });
  }

  // ── 4. CLAIM TRANSLATION PROJECT ──────────────────────────────────
  if (action === 'claim' && req.method === 'POST') {
    const id = body.id || body.project_id;
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const name = (session && (session.name || session.email)) || body.translator_name || body.translatorName || 'Comrade Translator';
    project.translator = name;
    project.translator_name = name;
    project.translator_email = body.translator_email || null;
    project.status = 'in_progress';
    project.updated_at = new Date().toISOString();

    writeData('translations.json', projects);
    return res.status(200).json({ success: true, project });
  }

  // ── 5. SAVE DRAFT ─────────────────────────────────────────────────
  if (action === 'save_draft' && req.method === 'POST') {
    const id = body.id || body.project_id;
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (body.translated_text !== undefined) project.translated_text = body.translated_text;
    if (body.progress !== undefined) project.progress = body.progress;
    project.updated_at = new Date().toISOString();

    writeData('translations.json', projects);
    return res.status(200).json({ success: true, project });
  }

  // ── 6. SUBMIT FOR REVIEW ──────────────────────────────────────────
  if (action === 'submit_review' && req.method === 'POST') {
    const id = body.id || body.project_id;
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.status = 'review_requested';
    project.progress = 100;
    project.updated_at = new Date().toISOString();

    writeData('translations.json', projects);
    return res.status(200).json({ success: true, project });
  }

  // ── 7. PUBLISH TRANSLATION ────────────────────────────────────────
  if (action === 'publish' && req.method === 'POST') {
    const id = body.id || body.project_id;
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.status = 'published';
    project.reviewer = (session && (session.name || session.email)) || body.reviewer_notes || 'Editorial Collective';
    project.updated_at = new Date().toISOString();

    writeData('translations.json', projects);
    return res.status(200).json({ success: true, project });
  }

  return res.status(400).json({ error: 'Invalid translation action' });
}

// CJS and ESM dual export compatibility
module.exports = handler;
(module.exports as any).default = handler;
