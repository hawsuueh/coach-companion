import { StyleSheet, Text, View } from 'react-native';

export default function Analysis() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Analysis Screen of Athlete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' }
});
