import { NextRequest, NextResponse } from 'next/server';

const PAINTING_URLS: Record<string, string> = {
  'mona-lisa': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg',
  'the-concert': 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Vermeer_The_Concert.jpg',
  'the-scream': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
  'poppy-flowers': 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Poppy_Flowers_by_Vincent_van_Gogh_1.jpg',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const url = PAINTING_URLS[name];

  if (!url) {
    return NextResponse.json({ error: 'Unknown painting' }, { status: 404 });
  }

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'CVBER/1.0 (https://cvber.vercel.app; educational art protection project)',
        'Accept': 'image/jpeg,image/png,image/*,*/*',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      return NextResponse.json({ error: `Upstream ${resp.status}` }, { status: 502 });
    }

    const body = await resp.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'fetch failed' }, { status: 502 });
  }
}
