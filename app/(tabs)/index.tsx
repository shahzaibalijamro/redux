import { Image, StyleSheet, Platform, View, Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';

export default function HomeScreen() {
  const selector = useSelector((state: any) => state.userStatus.isLoggedIn)
  console.log(selector);
  if (!selector) {
    router.replace("/login")
  }
  return (
    <View style={{flex:1,justifyContent: 'center',alignItems: 'center',backgroundColor: 'white'}}>
      <Text>
        HOME
      </Text>
    </View>
  );
}

// const styles = StyleSheet.create({

// });
