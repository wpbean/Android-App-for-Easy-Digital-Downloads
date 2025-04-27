import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    RefreshControl,
    StyleSheet,
    Button,
} from "react-native";
import { fetchEddStats } from "../api/dashboardApi";
import SalesChart from "../components/SalesChart";
import EarningsChart from "../components/EarningsChart";

const DashboardStats = ({ navigation }) => {
    const formatDate = (date) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        }).format(date);
    };
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 29); // Last 30 Days

    const startDate = formatDate(pastDate);
    const endDate = formatDate(today);

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await fetchEddStats();
            setStats(data);
        } catch (error) {
            console.log("Error fetching stats:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 30 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                    }}
                >
                    <View style={[styles.card, { width: "47%" }]}>
                        <Text style={styles.title}>Today</Text>
                        <Text style={styles.value}>
                            ${stats.earnings.today}
                        </Text>
                        <Text style={styles.sales}>
                            Sales: {stats.sales.today}
                        </Text>
                    </View>

                    <View style={[styles.card, { width: "47%" }]}>
                        <Text style={styles.title}>Current Month</Text>
                        <Text style={styles.value}>
                            ${stats.earnings.current_month}
                        </Text>
                        <Text style={styles.sales}>
                            Sales: {stats.sales.current_month}
                        </Text>
                    </View>

                    <View style={[styles.card, { width: "47%" }]}>
                        <Text style={styles.title}>Last Month</Text>
                        <Text style={styles.value}>
                            ${stats.earnings.last_month}
                        </Text>
                        <Text style={styles.sales}>
                            Sales: {stats.sales.last_month}
                        </Text>
                    </View>

                    <View style={[styles.card, { width: "47%" }]}>
                        <Text style={styles.title}>All Time</Text>
                        <Text style={styles.value}>
                            ${stats.earnings.totals}
                        </Text>
                        <Text style={styles.sales}>
                            Sales: {stats.sales.totals}
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.heading}>Last 30 Days Earnings</Text>
                    <Text style={styles.subheading}>
                        {startDate} to {endDate}{" "}
                    </Text>
                    <EarningsChart />
                </View>

                <View style={styles.card}>
                    <Text style={styles.heading}>Last 30 Days Sales</Text>
                    <Text style={styles.subheading}>
                        {startDate} to {endDate}{" "}
                    </Text>
                    <SalesChart />
                </View>

                <View style={{ borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
                    <Button
                        color="#5271ff"
                        title="Discount Codes"
                        onPress={() => navigation.navigate("DiscountsList")}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DashboardStats;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },
    value: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#5271ff",
    },
    sales: {
        fontSize: 14,
        color: "#555",
        marginTop: 5,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    heading: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },
    subheading: {
        fontSize: 14,
        color: "#555",
        marginBottom: 15,
    },
});
