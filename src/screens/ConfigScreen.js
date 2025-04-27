import axios from "axios";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ConfigScreen = ({ navigation }) => {
    const [apiBaseUrl, setApiBaseUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [apiToken, setApiToken] = useState("");

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const storedBaseUrl =
                    await AsyncStorage.getItem("API_BASE_URL");
                const storedKey = await AsyncStorage.getItem("API_KEY");
                const storedToken = await AsyncStorage.getItem("API_TOKEN");

                if (storedBaseUrl) setApiBaseUrl(storedBaseUrl);
                if (storedKey) setApiKey(storedKey);
                if (storedToken) setApiToken(storedToken);
            } catch (error) {
                console.error("Error loading config:", error);
            }
        };

        loadConfig();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Settings", // This will show in the app header
        });
    }, [navigation]);

    const saveConfig = async () => {
        if (!apiBaseUrl.trim() || !apiKey.trim() || !apiToken.trim()) {
            Alert.alert(
                "Error",
                "All fields are required. Please fill in all the fields."
            );
            return;
        }

        // Ensure API_BASE_URL ends with a "/"
        let formattedBaseUrl = apiBaseUrl.trim();
        if (!formattedBaseUrl.endsWith("/")) {
            formattedBaseUrl += "/";
        }

        try {
            // Save the configuration to AsyncStorage
            await AsyncStorage.setItem("API_BASE_URL", formattedBaseUrl);
            await AsyncStorage.setItem("API_KEY", apiKey);
            await AsyncStorage.setItem("API_TOKEN", apiToken);

            // Test the API request
            const response = await axios.get(
                `${formattedBaseUrl}edd-api/stats/?key=${apiKey}&token=${apiToken}`
            );

            if (response.status === 200) {
                // API request succeeded, navigate to HomeTabs
                Alert.alert("Success", "Configuration saved and API verified!");
                navigation.replace("HomeTabs");
            } else {
                // Handle non-200 status codes
                Alert.alert(
                    "API Error",
                    `API request failed with status: ${response.status}. Please check your configuration.`
                );
            }
        } catch (error) {
            // Handle network or other errors
            console.error("Error saving config:", error);
            Alert.alert(
                "Network Error",
                "Failed to connect to the API. Please check your internet connection or API configuration."
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Website URL</Text>
            <TextInput
                style={styles.input}
                value={apiBaseUrl}
                onChangeText={setApiBaseUrl}
                placeholder="https://example.com"
            />
            <Text style={styles.label}>API Key</Text>
            <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Enter API Key"
            />
            <Text style={styles.label}>API Token</Text>
            <TextInput
                style={styles.input}
                value={apiToken}
                onChangeText={setApiToken}
                placeholder="Enter API Token"
            />
            <View style={{ borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
                <Button color="#5271ff" title="Save" onPress={saveConfig} />
            </View>

            <Text style={{ marginTop: 20, textAlign: "center" }}>
                © {new Date().getFullYear()} ImranWP.com
            </Text>
            <Text style={{ textAlign: "center" }}>All rights reserved.</Text>
            <Text style={{ textAlign: "center" }}>Version 1.0.0</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
});

export default ConfigScreen;
