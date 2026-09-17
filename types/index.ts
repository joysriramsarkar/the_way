/**
 * types/index.ts — Global TypeScript Definitions for The Way Socialist Network
 */

import type { IncomingMessage, ServerResponse } from 'http';

// ── HTTP & Serverless API Handler Types ──────────────────────────────
export interface ApiRequest extends IncomingMessage {
  query: Record<string, any>;
  body?: any;
  rawBody?: Buffer;
  headers: IncomingMessage['headers'] & {
    authorization?: string;
    origin?: string;
    cookie?: string;
    'x-forwarded-host'?: string;
    'x-forwarded-proto'?: string;
    [key: string]: any;
  };
}

export interface ApiResponse extends ServerResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => ApiResponse;
  send: (data: any) => ApiResponse;
  redirect?: (statusOrUrl: number | string, url?: string) => any;
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<any> | any;

// ── User Session & Auth ──────────────────────────────────────────────
export interface AuthUserSession {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  picture?: string;
  iat?: number;
  exp?: number;
}

export type SessionUser = AuthUserSession;

// ── Federation Knowledge Graph ───────────────────────────────────────
export interface FederationResource {
  federation_id: string;
  type: 'work' | 'paper' | 'org' | string;
  slug?: string;
  id?: string;
  title: string;
  title_bn?: string;
  title_en?: string;
  author: string;
  year: number;
  category?: string;
  description?: string;
  identifiers: {
    openlibrary?: string | null;
    wikidata?: string | null;
    doi?: string | null;
    openalex?: string | null;
  };
  languages: string[];
  license: string;
  pdf_url?: string | null;
  read_url?: string | null;
  source_collection?: string;
  created_at?: string;
  tags?: string[];
}

export interface Organization {
  federation_id: string;
  id?: string;
  name: string;
  name_bn?: string;
  country: string;
  country_flag?: string;
  type: string;
  org_type?: string;
  icon?: string;
  desc?: string;
  description?: string;
  members?: number;
  verified?: boolean;
  focus: string[];
  created_at?: string;
}

export interface FederationManifest {
  federation: string;
  node_id: string;
  name: string;
  name_bn: string;
  description: string;
  version: string;
  protocols: string[];
  base_url: string;
  languages: string[];
  prefixes: {
    works: string;
    papers: string;
    organizations: string;
  };
  stats: {
    works_count: number;
    papers_count: number;
    organizations_count: number;
    languages_count: number;
  };
  endpoints: Record<string, string>;
  license: string;
}

// ── Translation Engine ───────────────────────────────────────────────
export interface TranslationProject {
  id: string;
  source_title: string;
  source_author?: string;
  source_lang: string;
  target_lang: string;
  status: 'requested' | 'in_progress' | 'review_requested' | 'published';
  translator: string | null;
  translator_name?: string | null;
  translator_email?: string | null;
  proposer_name?: string | null;
  proposer_email?: string | null;
  progress: number;
  original_text: string;
  translated_text: string;
  reviewer?: string;
  created_at: string;
  updated_at: string;
}

// ── Social & Community Network ───────────────────────────────────────
export interface SocialistPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    role: string;
    country?: string;
  };
  category: 'general' | 'debate' | 'question';
  content: string;
  tags: string[];
  reactions: {
    solidarity: number;
    thoughtful: number;
    critical: number;
  };
  comments_count: number;
  comments?: SocialistComment[];
  created_at: string;
}

export interface SocialistComment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface SocialistGroup {
  id: string;
  name: string;
  name_bn?: string;
  category: string;
  lang: string;
  members_count: number;
  description: string;
}

export interface SolidarityRequest {
  id: string;
  title: string;
  title_bn?: string;
  organization: string;
  location: string;
  target: string;
  current_pledges: number;
  description: string;
}
