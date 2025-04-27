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
import { fetchCustomers } from "../api/customersApi";
import { useNavigation } from "@react-navigation/native";
import { Card, TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

const CustomerItem = React.memo(({ item, onPress }) => {
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
                        title={
                            item.info.display_name
                                ? item.info.display_name
                                : item.info.first_name
                        }
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
                            <Text style={styles.cardText}>
                                {item.info.email}
                            </Text>
                            <Text style={styles.cardText}>
                                ${parseFloat(item.stats.total_spent).toFixed(2)}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
});

const CustomersList = () => {
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
                        Customers
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

            const data = await fetchCustomers(queryParams);
            const sales = data?.customers ?? []; // fallback to empty array

            if (isLoadMore) {
                setOrders((prevOrders) => {
                    const combinedOrders = [...prevOrders, ...sales];
                    const uniqueOrders = combinedOrders.filter(
                        (order, index, self) =>
                            index ===
                            self.findIndex(
                                (o) =>
                                    o.info.customer_id ===
                                    order.info.customer_id
                            )
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
            console.error("Failed to fetch customers", error);
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
        (customerId) => {
            navigation.navigate("CustomerDetails", {
                customerId,
                fromOrder: false,
            });
        },
        [navigation]
    );

    const renderItem = ({ item }) => (
        <CustomerItem
            item={item}
            onPress={() => handlePress(item.info.customer_id)}
        />
    );

    if (loading && !loadingMore) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#5271ff" />
                <Text style={{ marginTop: 10 }}>
                    Loading recent customers...
                </Text>
            </View>
        );
    }

    if (!orders.length) {
        return (
            <View style={styles.loaderContainer}>
                <Text>No customer found.</Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.container}
            data={orders}
            keyExtractor={(item, index) => `${item.info.customer_id}-${index}`}
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

export default CustomersList;
