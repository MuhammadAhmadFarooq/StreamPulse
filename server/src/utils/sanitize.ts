export function sanitizeFilename(filename: string): string {
  // Replace spaces and special characters to ensure clean filesystem and HTTP header compatibility
  return filename
    .replace(/["'\\/?:*"><|;,()\[\]{}]/g, '') // Remove symbols that corrupt Content-Disposition headers
    .replace(/\s+/g, '_')                     // Replace spaces with underscores
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/__+/g, '_')                    // Collapse multiple underscores
    .substring(0, 150)                       // Limit length
    .trim();
}

export function isValidUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
