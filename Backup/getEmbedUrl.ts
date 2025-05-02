// utils/getEmbedUrl.ts
export function getEmbedUrl(url: string): string | null {
    try {
      const videoUrl = new URL(url);
  
      // YouTube
      if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
        let videoId = '';
        if (videoUrl.hostname.includes('youtube.com')) {
          videoId = videoUrl.searchParams.get('v') || '';
        } else {
          videoId = videoUrl.pathname.slice(1);
        }
  
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?playsinline=1`;
        }
      }
  
      // Vimeo
      if (videoUrl.hostname.includes('vimeo.com')) {
        const match = videoUrl.pathname.match(/\/(\d+)/);
        if (match) {
          return `https://player.vimeo.com/video/${match[1]}`;
        }
      }
  
      return null;
    } catch {
      return null;
    }
  }