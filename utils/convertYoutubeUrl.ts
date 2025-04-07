// utils/convertYoutubeUrl.ts

/**
 * Converts a YouTube URL (either short form or standard) to an embed URL.
 * This ensures the video can be played properly in a WebView.
 */
export function convertYoutubeUrlToEmbed(url: string): string {
    // Check for short YouTube URL (e.g. https://youtu.be/VIDEO_ID?params)
    const shortUrlRegex = /^https?:\/\/youtu\.be\/([^?]+)(\?.*)?$/;
    let match = url.match(shortUrlRegex);
    if (match && match[1]) {
      const videoId = match[1];
      const queryString = match[2] || "";
      return `https://www.youtube.com/embed/${videoId}${queryString}`;
    }
    
    // Check for standard watch URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID&params)
    const watchUrlRegex = /^https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)(.*)$/;
    match = url.match(watchUrlRegex);
    if (match && match[1]) {
      const videoId = match[1];
      const queryString = match[2] || "";
      return `https://www.youtube.com/embed/${videoId}${queryString}`;
    }
    
    // If URL doesn't match known patterns, return as-is.
    return url;
  }
  