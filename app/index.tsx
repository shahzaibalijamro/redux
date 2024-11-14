import { useEffect, useState } from "react";
import { Alert, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
import polyline from 'polyline-encoded';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import * as Location from 'expo-location';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from "@react-navigation/native";
interface LocationData {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
}

interface Place {
    fsq_id: string;
    name: string;
    location: {
        cross_street?: string;
        formatted_address?: string;
        country: string;
    };
    geocodes: {
        main: {
            latitude: number;
            longitude: number;
        };
    };
}

const Home = () => {
    SplashScreen.preventAutoHideAsync();
    const [appIsReady, setAppIsReady] = useState(false);
    const [locationName, setLocationName] = useState('');
    const [fare, setFare] = useState('')
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [search, setSearch] = useState<string>('');
    const [searchedPlaceRes, setSearchedPlaceRes] = useState<Place[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [visibleRegion, setVisibleRegion] = useState<any>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<LocationData[]>([]);
    const navigation = useNavigation();
    const toastConfig = {
        success: (props: any) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: '#9ed90d', borderLeftWidth: 10, width: '90%', marginTop: 15 }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: '400'
                }}
                text2Style={{
                    fontSize: 15,
                    fontWeight: '400'
                }}
            />
        ),
        error: (props: any) => (
            <ErrorToast
                {...props}
                style={{ borderLeftColor: '#FF0000', borderLeftWidth: 10, width: '90%', marginTop: 70 }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: '400'
                }}
                text2Style={{
                    fontSize: 15,
                    fontWeight: '400'
                }}
            />
        ),
    };
    const showToast = (type: string, heading: string, paragraph: string) => {
        Toast.show({
            type: type,
            text1: heading,
            text2: paragraph
        });
    }
    useEffect(() => {
        try {
            (async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission to access location was denied');
                    return;
                }
                try {
                    let location = await Location.getCurrentPositionAsync({});
                    setLocation(location);
                    console.log(location);
                    setVisibleRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.007,
                        longitudeDelta: 0.007,
                    });
                    let reverseGeocode = await Location.reverseGeocodeAsync({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                    if (reverseGeocode.length > 0) {
                        const { street,
                            name,
                            district,
                            city,
                            region,
                            postalCode,
                            country, } = reverseGeocode[0];
                        setLocationName(`${district}, ${city}, ${region}, ${country}`);
                        setAppIsReady(true);
                    }
                } catch (error) {
                    Alert.alert('Could not fetch location');
                }
            })();
        } catch (e) {
            console.log(e);
        }
    }, []);

    const goToSelectedLocation = (item: Place) => {
        console.log(item);
        setSearch(item.name)
        setSearchedPlaceRes([]);
        setSelectedLocation({
            latitude: item.geocodes.main.latitude,
            longitude: item.geocodes.main.longitude,
        });
        setVisibleRegion({
            latitude: item.geocodes.main.latitude,
            longitude: item.geocodes.main.longitude,
            latitudeDelta: 0.007,
            longitudeDelta: 0.007,
        });
        fetch(`https://maps.gomaps.pro/maps/api/directions/json?&origin=${location?.coords.latitude},${location?.coords.longitude}&destination=${item.geocodes.main.latitude},${item.geocodes.main.longitude}&key=AlzaSyqcM2y85JecIqQm1XJgzVmfsmuKPtesB3b`)
            .then(res => res.json())
            .then(res => {
                console.log(res.routes);
                if (res.status === "OK") {
                    const points = res.routes[0].overview_polyline.points;
                    const decodedPoints = polyline.decode(points).map((point: any) => ({
                        latitude: point[0],
                        longitude: point[1],
                    }));
                    setRouteCoordinates(decodedPoints);
                } else {
                    console.error("Directions request failed with status:", res.status);
                }
            })
            .catch(err => {
                console.log(err);
            });
    };
    const findDriver = () => {
        if (!selectedLocation) {
            showToast("error", "Select Destination", "No Destination selected!")
            console.log(fare.length);
        } else {
            if (fare.length < 1) {
                showToast("error", "No offer found", "Enter your desired fare!")
            } else {
                // router.push(`/confirmRide?address=${locationName}&destination=${search}&fare=${fare}`)
            }
        }
        // router.push("/confirmRide")
    }
    const getPlaces = () => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'fsq3LoSdxiQR8tPtqqziL6Ki/xmy3h57IHjyUtrMs0xrVdc=',
            },
        };
        if (location) {
            fetch(`https://api.foursquare.com/v3/places/search?query=${search}&ll=${location.coords.latitude}%2C${location.coords.longitude}&radius=100000`, options)
                .then(res => res.json())
                .then(res => {
                    setSearchedPlaceRes(res.results);
                })
                .catch(err => console.error(err));
        }
    };
    const dragEnd = (e: any) => {
        setSelectedLocation(e.nativeEvent.coordinate);
        fetch(`https://maps.gomaps.pro/maps/api/directions/json?&origin=${location?.coords.latitude},${location?.coords.longitude}&destination=${e.nativeEvent.coordinate.latitude},${e.nativeEvent.coordinate.longitude}&key=AlzaSyqcM2y85JecIqQm1XJgzVmfsmuKPtesB3b`)
            .then(res => res.json())
            .then(res => {
                if (res.status === "OK") {
                    const points = res.routes[0].overview_polyline.points;
                    const decodedPoints = polyline.decode(points).map((point: any) => ({
                        latitude: point[0],
                        longitude: point[1],
                    }));
                    setRouteCoordinates(decodedPoints);
                } else {
                    console.error("Directions request failed with status:", res.status);
                }
            })
    }
    return (
        <SafeAreaView style={styles.container}>
            {location && (
                <SafeAreaView style={styles.mapContainer}>
                    <View style={{ position: 'absolute', top: 20, flexDirection: 'row', justifyContent: 'space-between', width: '100%', zIndex: 20 }}>
                        <TouchableOpacity style={{ backgroundColor: '#272c32', position: 'absolute', width: 50, height: 50, borderRadius: 150, justifyContent: 'center', alignItems: 'center', marginLeft: 'auto', top: 10, zIndex: 20, marginTop: 20, marginBottom: 10, left: 20 }} onPress={() => navigation.openDrawer()} activeOpacity={0.4}>
                            {/* <FontAwesome6 name="bars" size={26} color="white" /> */}
                            <Image
                                source={require('@/assets/images/menu.png')}
                                style={{ width: 26, height: 26 }}
                            />
                            {/* <Entypo name="google-" size={30} color="black" /> */}
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.4} style={{ backgroundColor: '#272c32', position: 'absolute', width: 50, height: 50, borderRadius: 150, justifyContent: 'center', alignItems: 'center', marginLeft: 'auto', top: 10, zIndex: 20, marginTop: 20, marginBottom: 10, right: 20 }}>
                            <Image
                                source={require('@/assets/images/share (1).png')}
                                style={{ width: 26, height: 26, padding: 5 }}
                            />
                            {/* <Entypo name="google-" size={30} color="black" /> */}
                        </TouchableOpacity>
                    </View>
                    {searchedPlaceRes.length > 0 && (
                        <FlatList
                            data={searchedPlaceRes}
                            keyExtractor={(item) => item.fsq_id}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => goToSelectedLocation(item)}>
                                    <View style={styles.itemView}>
                                        <Text style={styles.itemText1}>{item.name}</Text>
                                        <Text style={styles.itemText2}>
                                            {item.location.cross_street || item.location.formatted_address || item.location.country}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            style={styles.list}
                        />
                    )}
                    <MapView
                        style={styles.map}
                        mapType="hybrid"
                        region={visibleRegion}
                    >
                        {selectedLocation && (
                            <Marker
                                draggable
                                coordinate={selectedLocation}
                                onDragEnd={(e) => dragEnd(e)}
                            />
                        )}
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            pinColor="blue"
                            icon={require('@/assets/images/location-80.png')}
                        >
                            <Callout>
                                <View style={{ width: 100, height: 85, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontWeight: "500" }}>Your</Text>
                                    <Text style={{ fontWeight: "500" }}>Current</Text>
                                    <Text style={{ fontWeight: "500" }}>Location</Text>
                                </View>
                            </Callout>
                        </Marker>
                        {routeCoordinates.length > 0 && (
                            <Polyline
                                coordinates={routeCoordinates}
                                strokeColor="#0f53ff"
                                strokeWidth={5}
                            />
                        )}
                    </MapView>
                    <View style={{ ...styles.container2 }}>
                        <ScrollView horizontal={true} contentContainerStyle={styles.rideOptions}>
                            <TouchableOpacity style={{ ...styles.option, paddingHorizontal: 12 }}>
                                <Image
                                    source={require('@/assets/images/bycicle (2).png')}
                                    style={{ width: 45, height: 45 }}
                                />
                                <Text style={styles.optionText}>Moto</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.option, paddingHorizontal: 12 }}>
                                <Image
                                    source={require('@/assets/images/mini.png')}
                                    style={{ width: 45, height: 45 }}
                                />
                                <Text style={styles.optionText}>Ride mini</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.option, paddingHorizontal: 12 }}>
                                <Image
                                    source={require('@/assets/images/air-conditioner (1).png')}
                                    style={{ width: 45, height: 45 }}
                                />
                                <Text style={styles.optionText}>Ride A/C</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.option, paddingHorizontal: 12 }}>
                                <Image
                                    source={require('@/assets/images/rickshaw.png')}
                                    style={{ width: 42, height: 42, marginBottom: 3 }}
                                />
                                <Text style={styles.optionText}>Auto</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.option, paddingHorizontal: 12 }}>
                                <Image
                                    source={require('@/assets/images/car (2).png')}
                                    style={{ width: 42, height: 42, marginBottom: 3 }}
                                />
                                <Text style={styles.optionText}>City to city</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.option, paddingHorizontal: 12 }}>
                                <Image
                                    source={require('@/assets/images/food.png')}
                                    style={{ width: 42, height: 42, marginBottom: 3 }}
                                />
                                <Text style={styles.optionText}>Courier</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.option, paddingHorizontal: 12 }}>
                                <Image
                                    source={require('@/assets/images/express-delivery.png')}
                                    style={{ width: 42, height: 42, marginBottom: 3 }}
                                />
                                <Text style={styles.optionText}>Freight</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        <View style={styles.locationFareInput}>
                            <View style={styles.locationRow}>
                                <Image
                                    source={require('@/assets/images/rec (1).png')}
                                    style={{ width: 16, height: 16, marginRight: 2, marginLeft: 5, }}
                                />
                                <Text style={styles.locationText}> {locationName.length > 0 ? locationName : ''}</Text>
                            </View>
                            <View style={{ ...styles.inputContainer, backgroundColor: '#323943' }}>
                                <TouchableOpacity style={styles.countryPicker}>
                                    <Image
                                        source={require('@/assets/images/search-interface-symbol.png')}
                                        style={{ width: 16, height: 16, marginRight: 2, marginLeft: 5, }}
                                    />
                                </TouchableOpacity>

                                <TextInput
                                    style={{ ...styles.input2, marginLeft: 8 }}
                                    placeholder="To"
                                    placeholderTextColor="#888"
                                    keyboardType="default"
                                    value={search}
                                    onSubmitEditing={getPlaces}
                                    returnKeyType="done"
                                    onChangeText={setSearch}
                                />
                            </View>
                            <View style={{ ...styles.inputContainer, backgroundColor: '#323943' }}>
                                <TouchableOpacity style={styles.countryPicker}>
                                    <Text style={{ ...styles.flag, color: '#ffffff' }}>PKR</Text>
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.input2}
                                    placeholder="Offer your fare"
                                    placeholderTextColor="#888"
                                    keyboardType="number-pad"
                                    value={fare}
                                    returnKeyType="done"
                                    onChangeText={setFare}
                                />
                            </View>
                            {/* <TextInput style={styles.input2} placeholder="To" placeholderTextColor={'#9fa6b0'}/> */}
                            {/* <TextInput style={styles.input2} placeholder="PKR Offer your fare" keyboardType="numeric" placeholderTextColor={'#9fa6b0'} /> */}
                        </View>
                        <View style={{ ...styles.buttonContainer, paddingHorizontal: 20 }}>
                            <TouchableOpacity>
                                <Image
                                    source={require('@/assets/images/dollar.png')}
                                    style={{ width: 26, height: 26, marginHorizontal: 10, }}
                                />
                                {/* <Text style={{ marginHorizontal: 10, fontSize: 22 }}>💵</Text> */}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.findDriverButton} onPress={findDriver}>
                                <Text style={styles.buttonText2}>Find a driver</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image
                                    source={require('@/assets/images/settings.png')}
                                    style={{ width: 26, height: 26, marginHorizontal: 10, }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            )}
            <Toast config={toastConfig} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flexRow: { justifyContent: 'flex-start', alignItems: 'flex-start' },
    mapContainer: { flex: 1, position: 'relative' },
    map: { width: '100%', height: '110%' },
    input: {
        position: 'absolute',
        marginTop: 10,
        left: 15,
        right: 15,
        zIndex: 1,
        fontSize: 16,
        height: 50,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'gray',
    },
    list: {
        maxHeight: 150,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderColor: '#ddd',
        borderWidth: 1,
        position: 'absolute',
        top: 110,
        left: 15,
        right: 15,
        zIndex: 2,
    },
    itemView: { paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#eee', zIndex: 20 },
    itemText1: { paddingBottom: 5, fontWeight: "600", fontSize: 15 },
    itemText2: { fontWeight: "400", fontSize: 12 },
    container2: {
        position: 'absolute',
        zIndex: 10,
        // width: '100%',
        // height: 340,
        bottom: 0,
        padding: 16,
        backgroundColor: '#1c1f24',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    }, countryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 5,
        paddingLeft: 2,
    },
    rideOptions: {
        flexDirection: 'row',
        // justifyContent: 'space-around',
        marginTop: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    option: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    optionText: {
        color: 'white',
        fontSize: 12,
        marginTop: 4,
    },
    locationFareInput: {
        backgroundColor: '#1c1f24',
        padding: 12,
        borderRadius: 8,
        marginBottom: 0,
    }, flag: {
        fontSize: 17,
        marginRight: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        textAlign: 'center',
        marginHorizontal: 'auto'
    },
    locationText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2d33',
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
        paddingHorizontal: 10,
    },
    input2: {
        backgroundColor: '#323943',
        padding: 10,
        borderRadius: 6,
        color: 'white',
        flex: 1,
        fontSize: 16,
        // fontFamily: 'OpenSans_400Regular'
    },
    findDriverButton: {
        backgroundColor: '#9ed90d',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '70%',
        height: 50
    },
    buttonText2: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'semibold',
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    }
});

export default Home