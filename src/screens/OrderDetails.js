import React, { useLayoutEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ToastAndroid,
    Platform,
    Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

const OrderDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { order } = route.params;
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `Order #${order.ID}`, // This will show in the app header
        });
    }, [navigation, order.ID]);

    const copyToClipboard = (text) => {
        Clipboard.setStringAsync(text);
        if (Platform.OS === "android") {
            ToastAndroid.show("Copied to clipboard!", ToastAndroid.SHORT);
        } else {
            Alert.alert("Copied to clipboard!");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.detailContainer}>
                <View style={styles.column}>
                    <Text style={styles.label}>Products:</Text>
                    <Text style={styles.value}>
                        {order.products?.map((p) => p.name).join(", ")}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total:</Text>
                    <Text style={styles.value}>
                        ${parseFloat(order.total).toFixed(2)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Discount:</Text>
                    <Text style={styles.value}>
                        {order.discounts
                            ? Object.entries(order.discounts)
                                  .map(
                                      ([code, amount]) =>
                                          `${code}: -$${parseFloat(
                                              amount
                                          ).toFixed(2)}`
                                  )
                                  .join(", ")
                            : "No Discount"}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{order.status}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Order ID:</Text>
                    <Text style={styles.value}>#{order.ID}</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => copyToClipboard(order.ID)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Customer ID:</Text>
                    <Text
                        style={styles.valueLink}
                        onPress={() =>
                            navigation.navigate("CustomerDetails", {
                                customerId: order.customer_id,
                                fromOrder: true,
                                orderId: order.ID,
                            })
                        }
                    >
                        #{order.customer_id}
                    </Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => copyToClipboard(order.customer_id)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Customer Email:</Text>
                    <Text
                        style={styles.valueLink}
                        onPress={() =>
                            navigation.navigate("CustomerDetails", {
                                customerId: order.customer_id,
                                fromOrder: true,
                                orderId: order.ID,
                            })
                        }
                    >
                        {order.email}
                    </Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => copyToClipboard(order.email)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Transaction ID:</Text>
                    <Text style={styles.value}>{order.transaction_id}</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => copyToClipboard(order.transaction_id)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Order Date:</Text>
                    <Text style={styles.value}>{formatDate(order.date)}</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    detailContainer: {
        gap: 10,
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
        marginBottom: 15,
        gap: 6,
    },
    column: {
        flexDirection: "column",
        marginBottom: 15,
        gap: 6,
    },
    valueLink: {
        color: "#5271ff",
        textDecorationLine: "underline",
    },
});

export default OrderDetails;
