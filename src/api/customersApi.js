import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const fetchCustomers = async ({ customer, number } = {}) => {
    try {
        // Retrieve stored configuration
        const apiBaseUrl = await AsyncStorage.getItem("API_BASE_URL");
        const apiKey = await AsyncStorage.getItem("API_KEY");
        const apiToken = await AsyncStorage.getItem("API_TOKEN");

        if (!apiBaseUrl || !apiKey || !apiToken) {
            throw new Error(
                "API configuration is missing. Please configure it in the app."
            );
        }

        const queryParams = new URLSearchParams({
            key: apiKey,
            token: apiToken,
        });

        if (number) {
            queryParams.append("number", number.toString());
        }

        if (customer) {
            queryParams.append("customer", customer);
        }

        // console.log(
        //     `${apiBaseUrl}edd-api/v2/customers/?${queryParams.toString()}`
        // ); // Debugging line

        const response = await axios.get(
            `${apiBaseUrl}edd-api/v2/customers/?${queryParams.toString()}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
