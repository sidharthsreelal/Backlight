"""
Backlight Music Backend — searches YouTube Music for songs by artist.
Usage: python music_search.py "artist name" [count]
Returns JSON array of { title, artist, videoId, duration } to stdout.
"""
import sys
import json
import random
from ytmusicapi import YTMusic


def artist_matches(song_artists: list, target: str) -> bool:
    """Check if any of the song's artists match the target artist name."""
    target_lower = target.lower().strip()
    for a in song_artists:
        name = a.get("name", "").lower().strip()
        # Match if either is a substring of the other
        if target_lower in name or name in target_lower:
            return True
    return False


def format_song(item: dict) -> dict:
    """Extract relevant fields from a ytmusicapi result item."""
    return {
        "title": item.get("title", "Unknown"),
        "artist": ", ".join([a["name"] for a in item.get("artists", [])]),
        "videoId": item.get("videoId", ""),
        "duration": item.get("duration", ""),
        "thumbnail": item.get("thumbnails", [{}])[-1].get("url", "") if item.get("thumbnails") else ""
    }


def get_songs_via_artist_page(yt: YTMusic, artist_name: str, count: int) -> list:
    """
    Primary approach: find the artist's page and pull songs from their catalog.
    This guarantees we only get songs BY this artist.
    """
    try:
        # Search for the artist channel
        artist_results = yt.search(artist_name, filter="artists", limit=5)
        if not artist_results:
            return []

        # Find the best matching artist
        browse_id = None
        for ar in artist_results:
            ar_name = ar.get("artist", "").lower().strip()
            target = artist_name.lower().strip()
            if target in ar_name or ar_name in target:
                browse_id = ar.get("browseId")
                break

        # If no exact match, just use the first result
        if not browse_id and artist_results:
            browse_id = artist_results[0].get("browseId")

        if not browse_id:
            return []

        # Get the artist's page which has their songs
        artist_data = yt.get_artist(browse_id)
        all_songs = []

        # Pull songs from the artist's "songs" section
        if "songs" in artist_data and "results" in artist_data["songs"]:
            all_songs.extend(artist_data["songs"]["results"])

        # If there's a browse continuation for more songs, try to get more
        if "songs" in artist_data and "browseId" in artist_data["songs"] and len(all_songs) < count * 2:
            try:
                playlist = yt.get_playlist(artist_data["songs"]["browseId"], limit=50)
                if "tracks" in playlist:
                    for track in playlist["tracks"]:
                        if track.get("videoId") and track["videoId"] not in {s.get("videoId") for s in all_songs}:
                            all_songs.append(track)
            except Exception:
                pass  # browsing extra songs failed, use what we have

        if not all_songs:
            return []

        # Deduplicate by videoId
        seen = set()
        unique = []
        for s in all_songs:
            vid = s.get("videoId", "")
            if vid and vid not in seen:
                seen.add(vid)
                unique.append(s)

        # Randomly sample
        if len(unique) > count:
            selected = random.sample(unique, count)
        else:
            selected = unique[:count]

        random.shuffle(selected)
        return [format_song(s) for s in selected]

    except Exception:
        return []


def get_songs_via_search(yt: YTMusic, artist_name: str, count: int) -> list:
    """
    Fallback approach: search for songs and strictly filter by artist name.
    """
    fetch_limit = max(count * 6, 30)

    results = yt.search(f"{artist_name}", filter="songs", limit=fetch_limit)

    # STRICT artist filtering — only keep songs where the artist matches
    seen = set()
    filtered = []
    for item in results:
        vid = item.get("videoId", "")
        if not vid or vid in seen:
            continue
        seen.add(vid)

        song_artists = item.get("artists", [])
        if artist_matches(song_artists, artist_name):
            filtered.append(item)

    if len(filtered) > count:
        selected = random.sample(filtered, count)
    else:
        selected = filtered[:count]

    random.shuffle(selected)
    return [format_song(s) for s in selected]


def search_artist_songs(artist_name: str, count: int = 5) -> list:
    yt = YTMusic()

    # Try the artist page first (most reliable)
    songs = get_songs_via_artist_page(yt, artist_name, count)

    # If we didn't get enough, supplement with filtered search
    if len(songs) < count:
        existing_ids = {s["videoId"] for s in songs}
        extra = get_songs_via_search(yt, artist_name, count - len(songs))
        for s in extra:
            if s["videoId"] not in existing_ids:
                songs.append(s)
                if len(songs) >= count:
                    break

    return songs


if __name__ == "__main__":
    artist = sys.argv[1] if len(sys.argv) > 1 else "Frank Ocean"
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 5

    try:
        songs = search_artist_songs(artist, count)
        print(json.dumps(songs))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
