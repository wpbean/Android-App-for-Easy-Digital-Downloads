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
import { fetchDiscounts } from "../api/discountsApi";

const DiscountDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { discountId } = route.params;

    const [discount, setDiscount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasDiscount, setHasDiscount] = useState(true); // assume true by default

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    useEffect(() => {
        const getDiscountDetails = async () => {
            try {
                const res = await fetchDiscounts({ discountId: discountId });
                setDiscount(res?.discounts?.[0] ?? []);
            } catch (error) {
                console.log("Error fetching discount details:", error);
            } finally {
                setLoading(false);
            }
        };

        getDiscountDetails();
    }, [discountId]);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Discount Details",
        });
    }, [navigation, discountId]);

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

    if (!discount) {
        return (
            <View style={styles.loader}>
                <Text>No discount found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.detailContainer}>
                <Text style={styles.discountName}>{discount.name}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Code:</Text>
                    <Text style={styles.value}>{discount.code}</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => copyToClipboard(discount.code)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={styles.value}>
                        {discount.type === "percent" && (
                            <Text>{discount.amount}%</Text>
                        )}
                        {discount.type === "flat" && (
                            <Text>${discount.amount}</Text>
                        )}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Discount ID:</Text>
                    <Text style={styles.value}>{discount.ID}</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => copyToClipboard(discount.ID)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total Uses:</Text>
                    <Text style={styles.value}>{discount.uses}</Text>
                </View>

                {discount.start_date && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Start Date:</Text>
                        <Text style={styles.value}>
                            {formatDate(discount.start_date)}
                        </Text>
                    </View>
                )}

                {discount.exp_date && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Expire Date:</Text>
                        <Text style={styles.value}>
                            {formatDate(discount.exp_date)}
                        </Text>
                    </View>
                )}
            </View>
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
    discountName: {
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

export default DiscountDetails;
