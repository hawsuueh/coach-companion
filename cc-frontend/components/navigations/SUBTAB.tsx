import { Text, TouchableOpacity, View } from 'react-native';

interface TabItem {
  id: string;
  label: string;
}

interface SubTabProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function SubTab({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: SubTabProps) {
  return (
    <View
      className={`mt-2 w-full flex-row px-5 py-3 ${className}`}
      style={{
        backgroundColor: '#F0F0F0'
      }}
    >
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.id}
          className={`flex-1 items-center pb-2 ${activeTab === tab.id ? 'border-b-2 border-red-500' : ''}`}
          onPress={() => onTabChange(tab.id)}
        >
          <Text
            className={`font-semibold ${activeTab === tab.id ? 'text-black' : 'text-gray-500'}`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
