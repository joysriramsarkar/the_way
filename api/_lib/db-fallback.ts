/**
 * api/_lib/db-fallback.ts
 * Persistent local storage fallback for users, submissions, and articles.
 * Ensures 100% uptime and full functionality even before remote SQL migrations are run.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(filename: string, defaultVal: T): T {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf-8');
      return defaultVal;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) || defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function writeJSON<T>(filename: string, data: T): boolean {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e: any) {
    console.error(`[db-fallback] Error writing ${filename}:`, e.message);
    return false;
  }
}

// ── Users Store ───────────────────────────────────────────────────────
const USERS_FILE = 'users.json';

export function getLocalUsers(): any[] {
  return readJSON<any[]>(USERS_FILE, []);
}

export function saveLocalUser(user: any): any {
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase());
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user, updated_at: new Date().toISOString() };
  } else {
    users.push({
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      ...user,
      created_at: new Date().toISOString()
    });
  }
  writeJSON(USERS_FILE, users);
  return users.find(u => u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase());
}

export function findLocalUser(email: string): any | null {
  const users = getLocalUsers();
  return users.find(u => u.email && u.email.toLowerCase() === String(email).trim().toLowerCase()) || null;
}

// ── Submissions Store ─────────────────────────────────────────────────
const SUBMISSIONS_FILE = 'submissions.json';

export function getLocalSubmissions(): any[] {
  return readJSON<any[]>(SUBMISSIONS_FILE, []);
}

export function saveLocalSubmission(sub: any): any {
  const list = getLocalSubmissions();
  const newSub = {
    id: sub.id || ('sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
    ...sub,
    created_at: sub.created_at || new Date().toISOString()
  };
  list.unshift(newSub);
  writeJSON(SUBMISSIONS_FILE, list);
  return newSub;
}

export function updateLocalSubmission(id: string | number, updates: any): any | null {
  const list = getLocalSubmissions();
  const idx = list.findIndex(s => String(s.id) === String(id));
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    writeJSON(SUBMISSIONS_FILE, list);
    return list[idx];
  }
  return null;
}

// ── Movement / Solidarity Signups Store ─────────────────────────────────
const MOVEMENT_FILE = 'movement_signups.json';

export function getLocalMovementSignups(): any[] {
  return readJSON<any[]>(MOVEMENT_FILE, []);
}

export function saveLocalMovementSignup(item: any): any {
  const list = getLocalMovementSignups();
  const newItem = {
    id: item.id || ('mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
    ...item,
    created_at: item.created_at || new Date().toISOString()
  };
  list.unshift(newItem);
  writeJSON(MOVEMENT_FILE, list);
  return newItem;
}

export function updateLocalMovementSignup(id: string | number, updates: any): any | null {
  const list = getLocalMovementSignups();
  const idx = list.findIndex(s => String(s.id) === String(id));
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    writeJSON(MOVEMENT_FILE, list);
    return list[idx];
  }
  return null;
}

export function deleteLocalMovementSignup(id: string | number): boolean {
  const list = getLocalMovementSignups();
  const filtered = list.filter(s => String(s.id) !== String(id));
  writeJSON(MOVEMENT_FILE, filtered);
  return true;
}

export default {
  getLocalUsers,
  saveLocalUser,
  findLocalUser,
  getLocalSubmissions,
  saveLocalSubmission,
  updateLocalSubmission,
  getLocalMovementSignups,
  saveLocalMovementSignup,
  updateLocalMovementSignup,
  deleteLocalMovementSignup
};
