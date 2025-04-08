// utils/extractYoutubeVideoId.ts

/**
 * Extracts the YouTube video ID from a given URL.
 * Supports both short URLs (youtu.be) and standard URLs (youtube.com/watch?v=).
 */
export default function extractYoutubeVideoId(url: string): string | null {
  // Try the short URL format first
  const shortUrlRegex = /^https?:\/\/youtu\.be\/([^?]+)/;
  const shortMatch = url.match(shortUrlRegex);
  if (shortMatch && shortMatch[1]) {
    console.log('[extractYoutubeVideoId] Extracted ID from short URL:', shortMatch[1]);
    return shortMatch[1];
  }

  // Try the standard URL format
  const standardUrlRegex = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
  const standardMatch = url.match(standardUrlRegex);
  if (standardMatch && standardMatch[1]) {
    console.log('[extractYoutubeVideoId] Extracted ID from standard URL:', standardMatch[1]);
    return standardMatch[1];
  }

  console.log('[extractYoutubeVideoId] No video ID could be extracted from:', url);
  return null;
}
