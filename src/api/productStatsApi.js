import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const fetchProductStats = async (product_id) => {
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

        if (product_id) {
            queryParams.append("product", product_id.toString());
        }

        const [earningRes, saleRes] = await Promise.all([
            axios.get(
                `${apiBaseUrl}edd-api/stats/?type=earnings&${queryParams.toString()}`
            ),
            axios.get(
                `${apiBaseUrl}edd-api/stats/?type=sales&${queryParams.toString()}`
            ),
        ]);

        // console.log(`${API_URL}?type=earnings&${queryParams.toString()}`); // Debugging line
        // console.log("Product ID:", product_id); // Debugging line

        return {
            earning: earningRes.data.earnings[0],
            sale: saleRes.data.sales[0],
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        throw error;
    }
};
