import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
};

export const getCityName = async (latitude: number, longitude: number) => {
  try {
    const response = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (response && response[0]) {
      return response[0].city || '';
    }
    return '';
  } catch (error) {
    console.error('Erro ao obter nome da cidade:', error);
    return '';
  }
};