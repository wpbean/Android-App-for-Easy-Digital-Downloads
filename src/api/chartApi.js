import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const formatDate = (date) => {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
};

export const fetchStatsData = async () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 29); // Last 30 Days

    const startDate = formatDate(pastDate);
    const endDate = formatDate(today);

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

        const [earningsRes, salesRes] = await Promise.all([
            axios.get(
                `${apiBaseUrl}edd-api/stats/?key=${apiKey}&token=${apiToken}&type=earnings&date=range&startdate=${startDate}&enddate=${endDate}`
            ),
            axios.get(
                `${apiBaseUrl}edd-api/stats/?key=${apiKey}&token=${apiToken}&type=sales&date=range&startdate=${startDate}&enddate=${endDate}`
            ),
        ]);

        // console.log("Earnings Response:", earningsRes.data.earnings);
        // console.log("Sales Response:", salesRes.data.sales);

        return {
            earnings: earningsRes.data.earnings,
            sales: salesRes.data.sales,
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        throw error;
    }
};
