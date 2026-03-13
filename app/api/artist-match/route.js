import { NextResponse } from 'next/server';

const WIKI_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';

const ARTIST_CATALOG = [
  {
    id: 'anish-kapoor',
    name: 'Anish Kapoor',
    wikiTitle: 'Anish_Kapoor',
    nationality: '영국/인도',
    years: '1954 -',
    workTitles: [
      { id: 'cloud-gate', wikiTitle: 'Cloud_Gate', year: '2006' },
      { id: 'arcelormittal-orbit', wikiTitle: 'ArcelorMittal_Orbit', year: '2012' },
      { id: 'sky-mirror', wikiTitle: 'Sky_Mirror', year: '2001' },
    ],
  },
  {
    id: 'banksy',
    name: 'Banksy',
    wikiTitle: 'Banksy',
    nationality: '영국',
    years: '1974? -',
    workTitles: [
      { id: 'love-is-in-the-bin', wikiTitle: 'Love_is_in_the_Bin', year: '2018' },
      { id: 'devolved-parliament', wikiTitle: 'Devolved_Parliament', year: '2009' },
      { id: 'migrant-son', wikiTitle: 'The_Son_of_a_Migrant_from_Syria', year: '2015' },
    ],
  },
  {
    id: 'ai-weiwei',
    name: 'Ai Weiwei',
    wikiTitle: 'Ai_Weiwei',
    nationality: '중국',
    years: '1957 -',
    workTitles: [
      { id: 'sunflower-seeds', wikiTitle: 'Sunflower_Seeds_(artwork)', year: '2010' },
      { id: 'zodiac-heads', wikiTitle: 'Circle_of_Animals/Zodiac_Heads', year: '2010' },
    ],
  },
  {
    id: 'christo-jeanne-claude',
    name: 'Christo and Jeanne-Claude',
    wikiTitle: 'Christo_and_Jeanne-Claude',
    nationality: '불가리아/모로코-프랑스',
    years: '1935 - 2020 / 1935 - 2009',
    workTitles: [
      { id: 'floating-piers', wikiTitle: 'The_Floating_Piers', year: '2016' },
      { id: 'the-gates', wikiTitle: 'The_Gates', year: '2005' },
    ],
  },
  {
    id: 'jeff-koons',
    name: 'Jeff Koons',
    wikiTitle: 'Jeff_Koons',
    nationality: '미국',
    years: '1955 -',
    workTitles: [
      { id: 'play-doh', wikiTitle: 'Play-Doh_(sculpture)', year: '2014' },
      { id: 'balloon-dog', wikiTitle: 'Balloon_Dog', year: '2000' },
    ],
  },
];

function createSeededRandom(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let index = 0; index < seedText.length; index += 1) {
    h = Math.imul(h ^ seedText.charCodeAt(index), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const t = (h ^= h >>> 16) >>> 0;
    return t / 4294967296;
  };
}

function shuffleWithRandom(items, randomFn) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomFn() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function clampToWorldCupSize(cardCount) {
  if (cardCount < 2) return 0;

  const safeCount = Math.min(16, cardCount);
  return 2 ** Math.floor(Math.log2(safeCount));
}

async function fetchJson(url, { revalidate = 86400 } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${url}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWikiSummary(wikiTitle) {
  try {
    return await fetchJson(`${WIKI_SUMMARY_URL}/${encodeURIComponent(wikiTitle)}`);
  } catch {
    return null;
  }
}

function pickImageUrl(summary) {
  return summary?.originalimage?.source || summary?.thumbnail?.source || '';
}

function resolvePageUrl(summary, wikiTitle) {
  return summary?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`;
}

async function loadArtistBundle(artistConfig, randomFn) {
  const artistSummary = await fetchWikiSummary(artistConfig.wikiTitle);
  const shuffledWorks = shuffleWithRandom(artistConfig.workTitles, randomFn);
  const artworks = [];

  for (const work of shuffledWorks) {
    const workSummary = await fetchWikiSummary(work.wikiTitle);
    const imageUrl = pickImageUrl(workSummary);

    if (!workSummary || !imageUrl) continue;

    artworks.push({
      id: work.id,
      title: workSummary.title || work.wikiTitle,
      date: work.year || '',
      imageUrl,
      sourceUrl: resolvePageUrl(workSummary, work.wikiTitle),
      artistId: artistConfig.id,
    });
  }

  if (artworks.length < 2) return null;

  return {
    id: artistConfig.id,
    name: artistConfig.name,
    nationality: artistConfig.nationality,
    years: artistConfig.years,
    bio: artistSummary?.extract || '',
    profileSourceUrl: resolvePageUrl(artistSummary, artistConfig.wikiTitle),
    artworks: artworks.slice(0, 2),
  };
}

export async function GET(request) {
  const seed = request.nextUrl.searchParams.get('seed') || `${Date.now()}`;
  const random = createSeededRandom(seed);
  const shuffledCatalog = shuffleWithRandom(ARTIST_CATALOG, random);

  const artistBundles = [];

  for (const artistConfig of shuffledCatalog) {
    if (artistBundles.length >= 8) break;

    const bundle = await loadArtistBundle(artistConfig, random);
    if (bundle) artistBundles.push(bundle);
  }

  if (artistBundles.length < 4) {
    return NextResponse.json(
      {
        error: '작가/작품 이미지를 충분히 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
      },
      { status: 503 },
    );
  }

  const cards = artistBundles.flatMap((artist) =>
    artist.artworks.map((artwork) => ({
      id: `${artist.id}-${artwork.id}`,
      artistId: artist.id,
      artistName: artist.name,
      title: artwork.title,
      date: artwork.date,
      imageUrl: artwork.imageUrl,
      sourceUrl: artwork.sourceUrl,
    })),
  );

  const worldCupSize = clampToWorldCupSize(cards.length);
  if (worldCupSize < 2) {
    return NextResponse.json(
      {
        error: '월드컵 브래킷을 만들 수 있는 작품 수가 부족해요. 잠시 후 다시 시도해주세요.',
      },
      { status: 503 },
    );
  }

  const bracketCards = shuffleWithRandom(cards, random).slice(0, worldCupSize);
  const artistIdsInBracket = new Set(bracketCards.map((card) => card.artistId));
  const artists = artistBundles.filter((artist) => artistIdsInBracket.has(artist.id));

  return NextResponse.json({
    seed,
    generatedAt: new Date().toISOString(),
    source: {
      name: 'Wikipedia REST API (artwork pages + artist summaries)',
      artworks: 'https://en.wikipedia.org/api/rest_v1/page/summary',
      artists: 'https://en.wikipedia.org/api/rest_v1/page/summary',
      biographies: 'https://en.wikipedia.org/api/rest_v1/page/summary',
    },
    artists,
    bracketCards,
  });
}
