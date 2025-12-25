export const extractYouTubeVideoId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
};
