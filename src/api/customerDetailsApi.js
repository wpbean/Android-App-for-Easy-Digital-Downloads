import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const fetchCustomerDetails = async (customerId) => {
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

        const response = await axios.get(
            `${apiBaseUrl}edd-api/v2/customers/?key=${apiKey}&token=${apiToken}&customer=${customerId}`
        );

        return response.data;

        // console.log("Orders API Response:", response.data.sales);
    } catch (error) {
        throw error;
    }
};
