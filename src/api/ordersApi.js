import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/**
 * Fetch recent orders, or filter by email/order ID.
 * @param {Object} options
 * @param {string} [options.email] - Optional customer email.
 * @param {string|number} [options.id] - Optional order ID.
 * @returns {Promise<Object>} - API response data.
 */
export const fetchRecentOrders = async ({ email, id, number } = {}) => {
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

        if (email) {
            queryParams.append("email", email);
        }

        if (id) {
            queryParams.append("id", id.toString());
        }

        const response = await axios.get(
            `${apiBaseUrl}edd-api/v2/sales/?${queryParams.toString()}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
