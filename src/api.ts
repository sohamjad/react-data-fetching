export async function fetchArtworks(page: number, limit = 12): Promise<ApiResponse> {
  try {
    const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch artworks: ${res.status}`);
    const json = await res.json();
    console.log("API Pagination:", json.pagination);

    const data: Artwork[] = json.data.map((item: any) => ({
      id: item.id,
      title: item.title ?? '',
      place_of_origin: item.place_of_origin ?? '',
      artist_display: item.artist_display ?? '',
      inscriptions: item.inscriptions ?? '',
      date_start: item.date_start ?? null,
      date_end: item.date_end ?? null
    }));

    
    const total = json.pagination?.total && json.pagination.total > 0
      ? json.pagination.total
      : 10000;

    return { data, total };
  } catch (err) {
    console.error("Error fetching artworks:", err);
    return { data: [], total: 10000 };
  }
}
