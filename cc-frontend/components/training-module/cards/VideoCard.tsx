import { View, Text } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { extractYouTubeVideoId } from '@/utils/youtube';

type VideoCardProps = {
  youtubeUrl: string;
};

export default function VideoCard({ youtubeUrl }: VideoCardProps) {
  const videoId = extractYouTubeVideoId(youtubeUrl);

  if (!videoId) return null;

  return (
    <View>
      <YoutubePlayer height={220} videoId={videoId} />
    </View>
  );
}
