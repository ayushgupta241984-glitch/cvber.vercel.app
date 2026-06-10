import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    const fileId = request.nextUrl.searchParams.get('fileId');
    const token = request.nextUrl.searchParams.get('token');

    if (!url && !fileId) {
        return NextResponse.json({ error: 'Missing url or fileId param' }, { status: 400 });
    }

    let lastError: string = '';

    // Strategy 1: fileId + token → backend download
    if (fileId && token) {
        try {
            const resp = await fetch(`${BACKEND_URL}/vault/files/${fileId}/download`, {
                headers: { 'Authorization': `Bearer ${token}` },
                signal: AbortSignal.timeout(15000),
            });
            if (resp.ok) {
                const contentType = resp.headers.get('content-type') || 'application/octet-stream';
                const body = await resp.arrayBuffer();
                return new NextResponse(body, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType,
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            }
            lastError = `Backend ${resp.status}`;
        } catch (e: any) {
            lastError = e?.message || 'fetch failed';
        }
    }

    // Strategy 2: direct URL proxy
    if (url) {
        try {
            const resp = await fetch(url, {
                headers: { Accept: 'image/*' },
                signal: AbortSignal.timeout(20000),
            });
            if (resp.ok) {
                const contentType = resp.headers.get('content-type') || 'application/octet-stream';
                const body = await resp.arrayBuffer();
                return new NextResponse(body, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType,
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            }
            lastError = `URL ${resp.status}`;
        } catch (e: any) {
            lastError = e?.message || 'url fetch failed';
        }
    }

    // Strategy 3: try backend storage URL directly (no auth)
    if (url && url.includes('supabase')) {
        try {
            const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
            if (resp.ok) {
                const contentType = resp.headers.get('content-type') || 'application/octet-stream';
                const body = await resp.arrayBuffer();
                return new NextResponse(body, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType,
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            }
        } catch {}
    }

    return NextResponse.json({ error: `Proxy failed: ${lastError}` }, { status: 502 });
}
