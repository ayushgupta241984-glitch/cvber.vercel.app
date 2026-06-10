import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    const fileId = request.nextUrl.searchParams.get('fileId');
    const token = request.nextUrl.searchParams.get('token');

    if (!url && !fileId) {
        return NextResponse.json({ error: 'Missing url or fileId param' }, { status: 400 });
    }

    try {
        let resp: Response;

        if (fileId && token) {
            resp = await fetch(`${BACKEND_URL}/vault/files/${fileId}/download`, {
                headers: { 'Authorization': `Bearer ${token}` },
                signal: AbortSignal.timeout(15000),
            });
        } else if (url) {
            resp = await fetch(url, {
                headers: { Accept: 'image/*' },
                signal: AbortSignal.timeout(15000),
            });
        } else {
            return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
        }

        if (!resp.ok) {
            return NextResponse.json({ error: `Upstream ${resp.status}` }, { status: resp.status });
        }

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
    } catch (e) {
        return NextResponse.json({ error: 'Proxy fetch failed' }, { status: 502 });
    }
}
