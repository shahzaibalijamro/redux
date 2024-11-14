import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from "@/config/redux/store/store.js";
import { Provider } from 'react-redux';
import MyApp from './app';

export default function Layout() {
  const [userData, setUserData] = useState<any>(null);
  useEffect(() => {
    const getUser = async () => {
      const user = await AsyncStorage.getItem('user-profile');
      if (user) {
        const userFetch = JSON.parse(user)
        console.log(userFetch);
        setUserData(userFetch)
      }
    }
    getUser()
  }, [])
  console.log(userData);
  const logOutUser = () => {
    const storeData = async () => {
      try {
        await AsyncStorage.setItem('yetToSetup', 'false');
      } catch (e) {
        console.log(e);
      }
    };
    storeData()
  }
  return (
    <Provider store={store}>
      <MyApp/>
    </Provider>
  );
}