// src/utils/extractYoutubeVideoId.ts
export default function extractYoutubeVideoId(url: string): string | null {
  // Try the youtu.be short URL format first
  const shortUrlRegex = /^https?:\/\/youtu\.be\/([^?]+)/;
  const shortMatch = url.match(shortUrlRegex);
  if (shortMatch && shortMatch[1]) {
    //console.log('[extractYoutubeVideoId] Extracted ID from short URL:', shortMatch[1]);
    return shortMatch[1];
  }

  // Try the standard watch?v= URL format
  const standardUrlRegex = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
  const standardMatch = url.match(standardUrlRegex);
  if (standardMatch && standardMatch[1]) {
    //console.log('[extractYoutubeVideoId] Extracted ID from standard URL:', standardMatch[1]);
    return standardMatch[1];
  }

  // Try the /shorts/ URL format
  const shortsUrlRegex = /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([^?&/]+)/;
  const shortsMatch = url.match(shortsUrlRegex);
  if (shortsMatch && shortsMatch[1]) {
    //console.log('[extractYoutubeVideoId] Extracted ID from shorts URL:', shortsMatch[1]);
    return shortsMatch[1];
  }

  console.log('[extractYoutubeVideoId] No video ID could be extracted from:', url);
  return null;
}
