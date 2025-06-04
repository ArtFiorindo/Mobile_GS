import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => router.push('/alerts/create')}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Criar Alerta de Enchente
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  button: {
    borderRadius: 25,
  },
  buttonContent: {
    height: 50,
  },
});