// utils/convertYoutubeUrl.ts

/**
 * Converts a YouTube URL (either short form or standard) to an embed URL.
 * This ensures the video can be played properly in a WebView.
 */
export default function convertYoutubeUrl(url: string): string {
    // Check if the URL is a short YouTube link
    const shortUrlRegex = /^https?:\/\/youtu\.be\/([^?]+)/;
    const match = url.match(shortUrlRegex);
    if (match && match[1]) {
      const videoId = match[1];
      // Return the embed URL
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // If it's already a standard URL, try converting it
    const standardUrlRegex = /^https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)/;
    const standardMatch = url.match(standardUrlRegex);
    if (standardMatch && standardMatch[1]) {
      const videoId = standardMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Return the URL unchanged if it doesn't match known patterns
    return url;
  }
  
  