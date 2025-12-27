import { StyleSheet, Text, View } from 'react-native';

export default function Athlete() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Athlete Screen of Athlete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' }
});
