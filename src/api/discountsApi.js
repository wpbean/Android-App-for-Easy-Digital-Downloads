import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/**
 * Fetch EDD discounts from the API.
 * @returns {Promise<Object>} The response data containing discounts.
 * @throws {Error} If the API configuration is missing or the request fails.
 * @description This function retrieves the API base URL, key, and token from AsyncStorage,
 * constructs the request URL with query parameters, and makes a GET request to fetch discounts.
 */
export const fetchDiscounts = async ({ number, discountId } = {}) => {
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

        if (discountId) {
            queryParams.append("discount", discountId.toString());
        }

        const response = await axios.get(
            `${apiBaseUrl}edd-api/discounts/?${queryParams.toString()}`
        );

        return response.data;
    } catch (error) {
        throw error;
    }
};
