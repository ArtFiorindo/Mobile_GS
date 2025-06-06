import React from 'react';
import { View, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Button, Text, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const features = [
    {
      icon: 'warning',
      title: 'Alertas em Tempo Real',
      description: 'Receba notificações instantâneas sobre enchentes na sua região'
    },
    {
      icon: 'location',
      title: 'Localização Precisa',
      description: 'Identifique áreas afetadas com precisão através do GPS'
    },
    {
      icon: 'people',
      title: 'Comunidade Ativa',
      description: 'Compartilhe e receba informações de outros usuários'
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Background Elements */}
      <View style={styles.backgroundContainer}>
        <View style={styles.topWave} />
        <View style={styles.middleWave} />
        <View style={styles.bottomWave} />
      </View>

      {/* Logo and Header Section */}
      <View style={styles.headerSection}>
        <Image
          source={require('../../assets/images/logobranco.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>
          Sua plataforma de alertas de enchentes
        </Text>
      </View>

      {/* Main CTA Button */}
      <Surface style={styles.ctaContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/alerts/create')}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Criar Alerta de Enchente
        </Button>
      </Surface>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Por que usar o FloodAlert?</Text>
        
        {features.map((feature, index) => (
          <Surface key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as any} size={24} color="#22bcc7" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </Surface>
        ))}
      </View>

      {/* Info Section */}
      <Surface style={styles.infoSection}>
        <Text style={styles.infoTitle}>Como funciona?</Text>
        <Text style={styles.infoText}>
          O FloodAlert permite que você compartilhe e receba alertas sobre enchentes em sua região.
          Basta criar um alerta, informar a localização e a severidade da situação.
          Juntos, podemos ajudar a comunidade a se prevenir contra enchentes.
        </Text>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    overflow: 'hidden',
  },
  topWave: {
    position: 'absolute',
    top: -30,
    left: -15,
    right: -15,
    height: 150,
    backgroundColor: '#22bcc7',
    borderBottomLeftRadius: 140,
    borderBottomRightRadius: 90,
    transform: [
      { scaleX: 1.2 },
      { rotate: '-5deg' }
    ],
    opacity: 0.85,
  },
  middleWave: {
    position: 'absolute',
    top: -50,
    left: -40,
    right: -20,
    height: 260,
    backgroundColor: '#75c8ce',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 160,
    transform: [
      { scaleX: 1.3 },
      { rotate: '3deg' }
    ],
    opacity: 0.6,
  },
  bottomWave: {
    position: 'absolute',
    top: -20,
    left: -30,
    right: -40,
    height: 340,
    backgroundColor: '#bef2f6',
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 120,
    transform: [
      { scaleX: 1.1 },
      { rotate: '-2deg' }
    ],
    opacity: 0.4,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#22bcc7',
    opacity: 0.9,
  },
  ctaContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    padding: 16,
    elevation: 4,
  },
  button: {
    borderRadius: 12,
    backgroundColor: '#22bcc7',
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  featuresSection: {
    padding: 24,
    paddingTop: 40,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#bef2f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});