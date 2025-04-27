import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { fetchStatsData } from "../api/chartApi";

const EarningsChart = () => {
    const [earningsData, setEarningsData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStats = async () => {
            try {
                const { earnings } = await fetchStatsData();

                setLabels(Object.keys(earnings).map((date) => date.slice(-2))); // Extract day
                setEarningsData(Object.values(earnings));
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        getStats();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#000" />;
    }

    if (earningsData.length === 0 || labels.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.heading}>No data available</Text>
            </View>
        );
    }

    // Chart configuration
    const chartConfig = {
        backgroundColor: "#f5f5f5",
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        decimalPlaces: 2, // Optional, defaults to 2 decimal places
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: "#e3e3e3",
            strokeDasharray: "4", // Dashed lines
        },
        formatYLabel: (value) => parseInt(value, 10).toString(), // Convert to whole numbers,
        color: (opacity = 1) => `rgba(0, 0, 139, ${opacity})`, // Blue color for chart elements
    };

    return (
        <>
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                        style={{ marginLeft: -25 }}
                        data={{
                            labels: labels, // X-axis labels
                            datasets: [
                                {
                                    data: earningsData, // Earnings data
                                },
                            ],
                        }}
                        width={labels.length * 50} // Adjust width to fit the screen
                        height={220}
                        yAxisLabel="$"
                        chartConfig={chartConfig}
                        showBarTops={false}
                        showValuesOnTopOfBars
                    />
                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 20,
        elevation: 3, // Shadow for Android
        shadowColor: "#000", // Shadow for iOS
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
});

export default EarningsChart;
