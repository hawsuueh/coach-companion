import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  visible,
  onClose,
  onDelete
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable
        className="flex-1 items-center justify-end bg-black/20"
        onPress={onClose}
      >
        {/* Modal Container */}
        <View className="w-full items-center rounded-t-2xl bg-white px-8 py-5">
          {/* Prompt */}
          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Are you sure you want to delete this exercise?
          </Text>

          {/* Options */}
          <View className="w-full flex-row items-center justify-evenly py-3">
            {/* Cancel Button */}
            <TouchableOpacity className="items-center px-10" onPress={onClose}>
              <MaterialIcons name="close" size={24} color="gray" />
              <Text className="mt-1 text-sm font-semibold text-gray-600">
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity className="items-center px-10" onPress={onDelete}>
              <MaterialIcons name="delete-outline" size={24} color="red" />
              <Text className="mt-1 text-sm font-semibold text-red-600">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default DeleteModal;
