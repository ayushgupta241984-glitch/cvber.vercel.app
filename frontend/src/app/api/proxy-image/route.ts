import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

export async function GET(request: NextRequest) {
    const fileId = request.nextUrl.searchParams.get('fileId');
    const token = request.nextUrl.searchParams.get('token');
    const url = request.nextUrl.searchParams.get('url');

    if (!fileId && !url) {
        return NextResponse.json({ error: 'Missing fileId or url param' }, { status: 400 });
    }

    let lastError = '';

    if (fileId && token) {
        try {
            const resp = await fetch(`${BACKEND_URL}/vault/files/${fileId}/download`, {
                headers: { 'Authorization': `Bearer ${token}` },
                signal: AbortSignal.timeout(20000),
            });
            if (resp.ok) {
                const body = await resp.arrayBuffer();
                return new NextResponse(body, {
                    status: 200,
                    headers: {
                        'Content-Type': resp.headers.get('content-type') || 'application/octet-stream',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            }
            lastError = `Backend HTTP ${resp.status}`;
        } catch (e: any) {
            lastError = `Backend fetch failed: ${e?.message || 'unknown'}`;
        }
    }

    if (url) {
        const urlsToTry = [url];
        if (url.includes('supabase')) {
            const noToken = url.split('?')[0];
            if (noToken !== url) urlsToTry.push(noToken);
        }
        for (const tryUrl of urlsToTry) {
            try {
                const resp = await fetch(tryUrl, {
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
                lastError = `URL HTTP ${resp.status}`;
            } catch (e: any) {
                lastError = `URL fetch failed: ${e?.message || 'unknown'}`;
            }
        }
    }

    return NextResponse.json({ error: `Proxy failed: ${lastError}` }, { status: 502 });
}
