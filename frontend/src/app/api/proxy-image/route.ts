import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
        return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }

    if (!parsed.hostname.endsWith('.supabase.co')) {
        return NextResponse.json({ error: 'Only Supabase URLs allowed' }, { status: 403 });
    }

    try {
        const resp = await fetch(parsed.toString(), {
            headers: { Accept: 'image/*' },
        });

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
