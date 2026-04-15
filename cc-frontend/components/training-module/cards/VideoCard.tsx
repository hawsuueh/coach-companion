import { View, Text } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { extractYouTubeVideoId } from '@/utils/youtube';

type VideoCardProps = {
  youtubeUrl: string;
};

export default function VideoCard({ youtubeUrl }: VideoCardProps) {
  const videoId = extractYouTubeVideoId(youtubeUrl);

  // Fallback if videoId is missing or invalid
  if (!videoId) {
    return (
      <View className="h-56 w-full items-center justify-center rounded-xl bg-gray-200">
        <Text className="text-body1 text-black">Video unavailable</Text>
      </View>
    );
  }

  return (
    <View className="w-full overflow-hidden rounded-xl">
      <YoutubePlayer height={220} videoId={videoId} />
    </View>
  );
}
