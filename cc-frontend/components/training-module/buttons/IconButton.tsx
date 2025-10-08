import { TouchableOpacity, View } from 'react-native';

type IconButtonProps = {
  icon: string;
  IconComponent: React.ComponentType<any>;
  onPress: () => void;
};

export default function IconButton({
  icon,
  IconComponent,
  onPress
}: IconButtonProps) {
  return (
    <TouchableOpacity
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 4 // Android shadow
      }}
      className="rounded-xl bg-white px-2 py-1 drop-shadow-xl"
      onPress={onPress}
    >
      <IconComponent name={icon} size={24} color="black" />
    </TouchableOpacity>
  );
}
