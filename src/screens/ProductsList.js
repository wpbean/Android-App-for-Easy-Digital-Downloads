import React, { useEffect, useState, useLayoutEffect } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    FlatList,
    TouchableWithoutFeedback,
    Animated,
} from "react-native";
import { fetchProducts } from "../api/productsApi";
import { fetchProductStats } from "../api/productStatsApi";
import { useNavigation } from "@react-navigation/native";
import { Card, TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

const ProductItem = React.memo(({ item, onPress }) => {
    const scale = new Animated.Value(1);

    const [stats, setStats] = useState({ earnings: 0, sales: 0 }); // State to store product stats
    const [loadingStats, setLoadingStats] = useState(true); // State to track loading of stats

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    // Fetch product stats when the component is rendered
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const data = await fetchProductStats(item.info.id); // Call the API with the product ID

                // Extract earnings and sales using the product slug
                const slug = item.info.slug;
                const earnings = data.earning?.[slug] || 0; // Use the slug as the key
                const sales = data.sale?.[slug] || 0; // Use the slug as the key

                setStats({
                    earnings,
                    sales,
                });
            } catch (error) {
                console.error(
                    `Failed to fetch stats for product ${item.info.id}`,
                    error
                );
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, [item.info.id]);

    return (
        <TouchableWithoutFeedback
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
        >
            <Animated.View
                style={[
                    styles.card,
                    { transform: [{ scale }] }, // Scale animation
                ]}
            >
                <Card style={styles.cardContent}>
                    <Card.Title
                        style={styles.cardTitleArea}
                        title={item.info.title}
                        titleStyle={styles.cardTitle}
                        right={(props) => (
                            <Icon
                                {...props}
                                name="chevron-forward"
                                size={24}
                                style={{ marginRight: 10 }}
                                color="#5271ff"
                            />
                        )}
                    />
                    <Card.Content>
                        <View style={styles.cardDetails}>
                            {loadingStats ? (
                                <Text style={styles.cardText}>
                                    Loading stats...
                                </Text>
                            ) : (
                                <>
                                    <Text style={styles.cardText}>
                                        Earnings: $
                                        {parseFloat(stats.earnings).toFixed(2)}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        Sales: {stats.sales}
                                    </Text>
                                </>
                            )}
                        </View>
                    </Card.Content>
                </Card>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
});

const ProductsList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); // For "Load More" button
    const [hasMoreOrders, setHasMoreOrders] = useState(true); // To track if more orders are available
    const [currentLimit, setCurrentLimit] = useState(10); // Default limit for queryParams
    const [searchMode, setSearchMode] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const navigation = useNavigation();

    useEffect(() => {
        loadOrders();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () =>
                searchMode ? (
                    <TextInput
                        autoFocus
                        placeholder="Search by email or ID"
                        value={searchInput}
                        onChangeText={setSearchInput}
                        onSubmitEditing={() => loadOrders(searchInput)}
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 8,
                            paddingVertical: 2,
                            paddingHorizontal: 10,
                            width: 280,
                            fontSize: 16,
                        }}
                    />
                ) : (
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        Products
                    </Text>
                ),
            headerRight: () => (
                <Icon
                    name={searchMode ? "close" : "search"}
                    size={24}
                    style={{ marginRight: 15 }}
                    onPress={() => {
                        if (searchMode) {
                            setSearchInput("");
                            loadOrders(""); // Reload all if cleared
                        }
                        setSearchMode(!searchMode);
                    }}
                />
            ),
        });
    }, [navigation, searchMode, searchInput]);

    const loadOrders = async (
        input = searchInput,
        isLoadMore = false,
        limit = currentLimit
    ) => {
        try {
            if (!isLoadMore) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            let queryParams = {
                number: limit.toString(), // Use the current limit
            };

            if (input) {
                queryParams.customer = input; // Use the search input
            }

            const data = await fetchProducts(queryParams);
            const sales = data?.products ?? []; // fallback to empty array

            if (isLoadMore) {
                setOrders((prevOrders) => {
                    const combinedOrders = [...prevOrders, ...sales];
                    const uniqueOrders = combinedOrders.filter(
                        (order, index, self) =>
                            index ===
                            self.findIndex((o) => o.info.id === order.info.id)
                    );
                    return uniqueOrders;
                });
            } else {
                setOrders(sales);
            }

            // Check if there are more orders to load
            if (sales.length < limit) {
                setHasMoreOrders(false); // No more orders available
            } else {
                setHasMoreOrders(true); // More orders might be available
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            setOrders([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        const newLimit = currentLimit + 10; // Calculate the new limit
        setCurrentLimit(newLimit); // Update the state
        loadOrders(searchInput, true, newLimit); // Pass the new limit directly
    };

    const handlePress = React.useCallback(
        (productId) => {
            navigation.navigate("ProductDetails", {
                productId,
            });
        },
        [navigation]
    );

    const renderItem = ({ item }) => (
        <ProductItem item={item} onPress={() => handlePress(item.info.id)} />
    );

    if (loading && !loadingMore) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#5271ff" />
                <Text style={{ marginTop: 10 }}>Loading products...</Text>
            </View>
        );
    }

    if (!orders.length) {
        return (
            <View style={styles.loaderContainer}>
                <Text>No products found.</Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.container}
            data={orders}
            keyExtractor={(item, index) => `${item.info.id}-${index}`}
            renderItem={renderItem}
            refreshing={loading}
            onRefresh={loadOrders}
            contentContainerStyle={{ paddingBottom: 30 }}
            ListFooterComponent={
                hasMoreOrders ? (
                    <View style={styles.loadMoreContainer}>
                        <TouchableWithoutFeedback onPress={handleLoadMore}>
                            <View style={styles.loadMoreButton}>
                                {loadingMore ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.loadMoreText}>
                                        Load More
                                    </Text>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                ) : null
            }
            initialNumToRender={10} // Render 10 items initially
            maxToRenderPerBatch={10} // Render 10 items per batch
            windowSize={5} // Adjust the window size for rendering
        />
    );
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        padding: 20, // Updated padding to 20px
    },
    card: {
        marginBottom: 15,
        borderRadius: 12,
        overflow: "hidden", // Ensures ripple effect stays within bounds
        elevation: 3, // Shadow for Android
        shadowColor: "#000", // Shadow for iOS
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        backgroundColor: "#fff",
    },
    cardContent: {
        borderRadius: 12,
    },
    cardTitleArea: {
        minHeight: 0,
        marginBottom: 0,
        marginTop: 15,
    },
    cardTitle: {
        marginBottom: 0,
        minHeight: 0,
        lineHeight: 20,
    },
    cardDetails: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 10,
    },
    cardText: {
        fontSize: 14,
        color: "#555",
    },
    loadMoreContainer: {
        alignItems: "center",
        marginVertical: 10,
    },
    loadMoreButton: {
        backgroundColor: "#5271ff",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    loadMoreText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default ProductsList;
