import React, { useEffect, useState, useLayoutEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ToastAndroid,
    Platform,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRoute, useNavigation } from "@react-navigation/native";
import { fetchCustomerDetails } from "../api/customerDetailsApi";
import RecentOrders from "./RecentOrders";

const CustomerDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { customerId } = route.params;

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasOrders, setHasOrders] = useState(true); // assume true by default

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    useEffect(() => {
        const getCustomerDetails = async () => {
            try {
                const res = await fetchCustomerDetails(customerId);
                setCustomer(res?.customers?.[0]);
            } catch (error) {
                console.log("Error fetching customer details:", error);
            } finally {
                setLoading(false);
            }
        };

        getCustomerDetails();
    }, [customerId]);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Customer Details", // This will show in the app header
        });
    }, [navigation, customerId]);

    const copyToClipboard = (text) => {
        Clipboard.setStringAsync(text);
        if (Platform.OS === "android") {
            ToastAndroid.show("Copied to clipboard!", ToastAndroid.SHORT);
        } else {
            Alert.alert("Copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!customer) {
        return (
            <View style={styles.loader}>
                <Text>No customer found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.detailContainer}>
                <Text style={styles.customerName}>
                    {customer.info.display_name}
                </Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{customer.info.email}</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => copyToClipboard(customer.info.email)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Customer ID:</Text>
                    <Text style={styles.value}>
                        {customer.info.customer_id}
                    </Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() =>
                            copyToClipboard(customer.info.customer_id)
                        }
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>User ID:</Text>
                    <Text style={styles.value}>{customer.info.user_id}</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => copyToClipboard(customer.info.user_id)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total Purchases:</Text>
                    <Text style={styles.value}>
                        {customer.stats.total_purchases}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total Spent:</Text>
                    <Text style={styles.value}>
                        ${customer.stats.total_spent.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Customer since:</Text>
                    <Text style={styles.value}>
                        {formatDate(customer.info.date_created)}
                    </Text>
                </View>

                <Text style={styles.label}>Recent Sales:</Text>
            </View>

            {/* Render RecentOrders directly */}

            {!hasOrders && (
                <Text style={styles.noOrdersText}>
                    No orders found for this customer.
                </Text>
            )}

            <RecentOrders
                email={customer.info.email}
                addMargin={true}
                onOrdersLoaded={(hasOrders) => setHasOrders(hasOrders)}
                showLoadMore={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        padding: 20,
    },
    detailContainer: {
        marginBottom: 20,
    },
    customerName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    label: {
        fontWeight: "bold",
        fontSize: 16,
    },
    value: {
        color: "#555",
        fontSize: 14,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 6,
    },
    iconButton: {
        padding: 4,
    },
    noOrdersText: {
        fontSize: 14,
        color: "#555",
        fontStyle: "italic",
        marginBottom: 10,
    },
});

export default CustomerDetails;
