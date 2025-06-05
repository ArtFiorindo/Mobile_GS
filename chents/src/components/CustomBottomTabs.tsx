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
      icon: 'add-circle',
      path: '/alerts/create',
    },
    {
      name: 'alert',
      icon: 'notifications',
      path: '/alerts/alert',
    },
    {
      name: 'settings',
      icon: 'settings',
      path: '/settings',
    },
  ];

  return (
    <View style={styles.containerWrapper}>
      <View style={styles.container}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.path)}
            style={[
              styles.tab,
              pathname === tab.path && styles.activeTab
            ]}
          >
            <View style={[
              styles.iconContainer,
              pathname === tab.path && styles.activeIconContainer
            ]}>
              <Ionicons
                name={tab.icon as any}
                size={24}
                color={pathname === tab.path ? '#fff' : '#666'}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 70,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    transform: [{translateY: -4}],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: '#9747FF',
    shadowColor: '#9747FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});