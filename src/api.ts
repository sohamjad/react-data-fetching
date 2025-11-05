// src/api.ts

// ✅ TypeScript interfaces for your API data
export interface Artwork {
  id: number;
  title: string | null;
  place_of_origin: string | null;
  artist_display: string | null;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
}

// ✅ Generic API response wrapper
export interface ApiResponse<T> {
  data: T[];
  total: number;
}

// ✅ Fetch artworks (with proper typing)
export async function fetchArtworks(
  page: number,
  limit = 12
): Promise<ApiResponse<Artwork>> {
  const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch artworks (status ${res.status})`);
  }

  const json = await res.json();

  const data: Artwork[] = (json.data ?? []).map((item: any) => ({
    id: item.id,
    title: item.title ?? '',
    place_of_origin: item.place_of_origin ?? '',
    artist_display: item.artist_display ?? '',
    inscriptions: item.inscriptions ?? '',
    date_start: item.date_start ?? null,
    date_end: item.date_end ?? null,
  }));

  return {
    data,
    total: json.pagination?.total ?? 0,
  };
}
