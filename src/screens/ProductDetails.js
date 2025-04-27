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
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRoute, useNavigation } from "@react-navigation/native";
import { fetchProducts } from "../api/productsApi";

const ProductDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { productId } = route.params;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ earnings: 0, sales: 0 }); // State to store product stats
    const [hasSales, setHasSales] = useState(true); // assume true by default

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    useEffect(() => {
        const getProductDetails = async () => {
            try {
                const data = await fetchProducts({ productId });
                const product = data?.products?.[0] ?? null; // Extract the first product or set to null
                setProduct(product);
            } catch (error) {
                console.log("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };

        getProductDetails();
    }, [productId]);

    //console.log("Product :", product); // Debugging line

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Product Details", // This will show in the app header
        });
    }, [navigation, productId]);

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

    if (!product) {
        return (
            <View style={styles.loader}>
                <Text>No product found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.detailContainer}>
                {product.info.thumbnail && (
                    <Image
                        source={{ uri: product.info.thumbnail }}
                        style={styles.thumbnail}
                        resizeMode="contain"
                    />
                )}
                <Text style={styles.productName}>{product.info.title}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Product since:</Text>
                    <Text style={styles.value}>
                        {formatDate(product.info.create_date)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Product ID:</Text>
                    <Text style={styles.value}>{product.info.id}</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => copyToClipboard(product.info.id)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#888" />
                    </TouchableOpacity>
                </View>
                {
                    (product.licensing.enabled = true && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Version:</Text>
                            <Text style={styles.value}>
                                {product.licensing.version}
                            </Text>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() =>
                                    copyToClipboard(product.licensing.version)
                                }
                            >
                                <Ionicons
                                    name="copy-outline"
                                    size={18}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                    ))
                }

                <View style={styles.row}>
                    <Text style={styles.label}>Total sales:</Text>
                    <Text style={styles.value}>
                        {product.stats.total.sales}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total earnings:</Text>
                    <Text style={styles.value}>
                        ${parseFloat(product.stats.total.earnings).toFixed(2)}
                    </Text>
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text style={[styles.label, { marginBottom: 5 }]}>
                        Pricing:
                    </Text>
                    <View>
                        {Object.entries(product.pricing).map(
                            ([plan, price]) => (
                                <Text
                                    key={plan}
                                    style={[styles.value, { marginBottom: 5 }]}
                                >
                                    {plan.charAt(0).toUpperCase() +
                                        plan.slice(1)}
                                    : ${price}
                                </Text>
                            )
                        )}
                    </View>
                </View>
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
    productName: {
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
    thumbnail: {
        width: "100%",
        height: 200,
        marginBottom: 10,
    },
});

export default ProductDetails;
