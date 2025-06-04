import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CustomBottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'home',
      icon: 'home',
      path: '/home',
    },
    {
      name: 'alerts',
      icon: 'alert-circle',
      path: '/alerts/create',
    },
    {
      name: 'map',
      icon: 'map',
      path: '/map/map',
    },
    {
      name: 'settings',
      icon: 'settings',
      path: '/settings',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => router.push(tab.path)}
          style={styles.tab}
        >
          <Ionicons
            name={tab.icon as any}
            size={28}
            color={pathname === tab.path ? '#9747FF' : '#666'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});