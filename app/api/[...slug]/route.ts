import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

import adminsHandler from '@/server/api/admins';
import articleSeoHandler from '@/server/api/article-seo';
import articlesHandler from '@/server/api/articles';
import authHandler from '@/server/api/auth';
import booksHandler from '@/server/api/books';
import networkHandler from '@/server/api/network';
import searchHandler from '@/server/api/search';
import sectionsHandler from '@/server/api/sections';
import sitemapHandler from '@/server/api/sitemap';
import translationsHandler from '@/server/api/translations';
import v1Handler from '@/server/api/v1';

const apiHandlers: Record<string, (req: any, res: any) => Promise<any> | any> = {
  admins: adminsHandler,
  'article-seo': articleSeoHandler,
  articles: articlesHandler,
  auth: authHandler,
  books: booksHandler,
  network: networkHandler,
  search: searchHandler,
  sections: sectionsHandler,
  sitemap: sitemapHandler,
  translations: translationsHandler,
  v1: v1Handler,
};

async function getHandler(apiName: string) {
  return apiHandlers[apiName] || null;
}

async function handleRequest(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const rawApiName = slug && slug.length > 0 ? slug[0] : '';
  
  let apiName = rawApiName.replace(/\.(js|ts)$/, '');
  let subRoute = '';
  if (apiName === 'activity-log') {
    apiName = 'admins';
    subRoute = 'activity-log';
  } else if (apiName === 'submissions') {
    apiName = 'articles';
    subRoute = 'submissions';
  } else if (apiName === 'resources') {
    apiName = 'search';
    subRoute = 'resources';
  }

  const handler = await getHandler(apiName);
  if (!handler) {
    return NextResponse.json({ error: `API route not found: /api/${rawApiName}` }, { status: 404 });
  }

  // Extract query parameters
  const url = new URL(req.url);
  const queryObj: Record<string, string> = {};
  url.searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });
  if (subRoute) {
    queryObj['_route'] = subRoute;
  }

  // Extract body
  let body: any = null;
  const contentType = req.headers.get('content-type') || '';
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      if (contentType.includes('application/json')) {
        body = await req.json();
      } else {
        const text = await req.text();
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }
    } catch {
      body = null;
    }
  }

  // Extract headers
  const headersObj: Record<string, string> = {};
  req.headers.forEach((val, key) => {
    headersObj[key.toLowerCase()] = val;
  });

  // Prepare response interception
  let statusCode = 200;
  const responseHeaders = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type'
  });
  let responseBody: any = null;

  const mockRes = {
    statusCode: 200,
    headersSent: false,
    setHeader: (name: string, value: string) => {
      responseHeaders.set(name, value);
      return mockRes;
    },
    getHeader: (name: string) => responseHeaders.get(name),
    status: (code: number) => {
      statusCode = code;
      mockRes.statusCode = code;
      return mockRes;
    },
    json: (data: any) => {
      responseHeaders.set('content-type', 'application/json; charset=utf-8');
      responseBody = JSON.stringify(data);
      return mockRes;
    },
    send: (data: any) => {
      if (typeof data === 'object') {
        responseHeaders.set('content-type', 'application/json; charset=utf-8');
        responseBody = JSON.stringify(data);
      } else {
        responseBody = String(data);
      }
      return mockRes;
    },
    end: (data?: any) => {
      if (data) mockRes.send(data);
      return mockRes;
    }
  };

  const mockReq = {
    method: req.method,
    url: req.url,
    query: queryObj,
    body: body,
    headers: headersObj
  };

  try {
    await handler(mockReq as any, mockRes as any);
  } catch (err: any) {
    console.error(`[Next.js API Bridge Error in /api/${rawApiName}]:`, err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }

  return new NextResponse(responseBody, {
    status: statusCode,
    headers: responseHeaders
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(req, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type'
    }
  });
}
