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
import { fetchRecentOrders } from "../api/ordersApi";
import { useNavigation } from "@react-navigation/native";
import { Card, TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

const RecentOrders = ({
    email,
    orderId,
    addMargin = false,
    onOrdersLoaded,
    showLoadMore = true,
}) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); // For "Load More" button
    const [hasMoreOrders, setHasMoreOrders] = useState(true); // To track if more orders are available
    const [currentLimit, setCurrentLimit] = useState(10); // Default limit for queryParams
    const [searchMode, setSearchMode] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const navigation = useNavigation();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    useEffect(() => {
        loadOrders();
    }, [email]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () =>
                searchMode ? (
                    <TextInput
                        autoFocus
                        placeholder="Search by email / order id"
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
                        Sales
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

            // Check if the input is a number (order ID) or a string (email)
            if (email) {
                queryParams.email = email; // Treat as email
            } else if (!isNaN(input) && input.trim() !== "") {
                queryParams.id = input; // Treat as order ID
            } else {
                queryParams.email = input; // Treat as email
            }

            const data = await fetchRecentOrders(queryParams);
            const sales = data?.sales ?? []; // fallback to empty array

            if (isLoadMore) {
                setOrders((prevOrders) => {
                    const combinedOrders = [...prevOrders, ...sales];
                    const uniqueOrders = combinedOrders.filter(
                        (order, index, self) =>
                            index === self.findIndex((o) => o.ID === order.ID)
                    );
                    return uniqueOrders;
                });
            } else {
                setOrders(sales);
            }

            // Check if there are more orders to load
            if (sales.length < currentLimit) {
                setHasMoreOrders(false); // No more orders available
            } else {
                setHasMoreOrders(true); // More orders might be available
            }

            if (onOrdersLoaded) {
                onOrdersLoaded(sales.length > 0);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            if (onOrdersLoaded) {
                onOrdersLoaded(false); // fallback in case of error
            }
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

    if (loading && !loadingMore) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#5271ff" />
                <Text style={{ marginTop: 10 }}>Loading orders...</Text>
            </View>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <View style={styles.loaderContainer}>
                <Text style={{ marginTop: 10, fontSize: 16, color: "#555" }}>
                    No orders found.
                </Text>
            </View>
        );
    }

    const renderItem = ({ item }) => {
        const scale = new Animated.Value(1);

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

        return (
            <TouchableWithoutFeedback
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() =>
                    navigation.navigate("OrderDetails", { order: item })
                }
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
                            title={item.products?.map((p) => p.name).join(", ")}
                            titleStyle={styles.cardTitle} // Adjusted title spacing
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
                                <Text style={styles.cardText}>
                                    ${parseFloat(item.total).toFixed(2)}
                                </Text>
                                <Text style={styles.cardText}>#{item.ID}</Text>
                                <Text style={styles.cardText}>
                                    {formatDate(item.date)}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <FlatList
            style={styles.container}
            data={orders}
            keyExtractor={(item, index) => `${item.ID}-${index}`}
            renderItem={renderItem}
            refreshing={loading}
            onRefresh={loadOrders}
            contentContainerStyle={[
                { margin: addMargin ? -17 : 0 },
                { paddingBottom: 30 },
            ]}
            ListFooterComponent={
                showLoadMore && hasMoreOrders ? (
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
        padding: 20,
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

export default RecentOrders;
