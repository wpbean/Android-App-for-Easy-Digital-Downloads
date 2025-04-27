import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const AuthCheckScreen = ({ navigation }) => {
    useEffect(() => {
        const checkConfig = async () => {
            try {
                const apiBaseUrl = await AsyncStorage.getItem("API_BASE_URL");
                const apiKey = await AsyncStorage.getItem("API_KEY");
                const apiToken = await AsyncStorage.getItem("API_TOKEN");

                if (!apiBaseUrl || !apiKey || !apiToken) {
                    // Redirect to ConfigScreen if any value is missing
                    navigation.replace("ConfigScreen");
                    return;
                }

                // Test the API request

                const response = await axios.get(
                    `${apiBaseUrl}edd-api/stats/?key=${apiKey}&token=${apiToken}`
                );

                if (response.status === 200) {
                    // API request succeeded, navigate to TabNavigator
                    navigation.replace("HomeTabs");
                } else {
                    throw new Error("API test failed");
                }
            } catch (error) {
                console.error("Error testing API:", error);
                Alert.alert(
                    "API Test Failed",
                    "The API request failed. Please check your configuration.",
                    [
                        {
                            text: "Go to Config",
                            onPress: () => navigation.replace("ConfigScreen"),
                        },
                    ]
                );
            }
        };

        checkConfig();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#000" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default AuthCheckScreen;
