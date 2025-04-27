import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchEddStats = async () => {
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

        // Fetch Earnings
        const earningsResponse = await fetch(
            `${apiBaseUrl}edd-api/stats/?key=${apiKey}&token=${apiToken}&type=earnings`
        );
        const earningsText = await earningsResponse.text();
        //console.log("Earnings API Response:", earningsText);

        if (!earningsResponse.ok) {
            throw new Error("Failed to fetch earnings");
        }

        const earningsResult = JSON.parse(earningsText);

        // Fetch Sales
        const salesResponse = await fetch(
            `${apiBaseUrl}edd-api/stats/?key=${apiKey}&token=${apiToken}&type=sales`
        );
        const salesText = await salesResponse.text();
        //console.log("Sales API Response:", salesText);

        if (!salesResponse.ok) {
            throw new Error("Failed to fetch sales");
        }

        const salesResult = JSON.parse(salesText);

        return {
            earnings: earningsResult.earnings,
            sales: salesResult.sales,
        };
    } catch (error) {
        console.error("EDD API Error:", error);
        throw error;
    }
};
