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
import { fetchDiscounts } from "../api/discountsApi";
import { useNavigation } from "@react-navigation/native";
import { Card } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

const DiscountItem = React.memo(({ item, onPress }) => {
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
                        title={item.name ? item.name : item.code}
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
                            <Text style={styles.cardText}>{item.code}</Text>
                            <Text style={styles.cardText}>
                                {item.type === "percent" && (
                                    <Text>{item.amount}%</Text>
                                )}
                                {item.type === "flat" && (
                                    <Text>${item.amount}</Text>
                                )}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
});

const DiscountsList = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); // For "Load More" button
    const [hasMoreDiscounts, setHasMoreDiscounts] = useState(true);
    const [currentLimit, setCurrentLimit] = useState(10); // Default limit for queryParams
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
        loadDiscounts();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Discount Codes",
        });
    }, [navigation]);

    const loadDiscounts = async (isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
    
            let fetchedDiscounts = [];
            let activeDiscounts = isLoadMore ? [...discounts] : [];
            let offset = isLoadMore ? discounts.length : 0;
    
            while (activeDiscounts.length < currentLimit) {
                const data = await fetchDiscounts({number: (offset + 10).toString()}); // Fetch 10 more discounts
                const discountsBatch = data?.discounts ?? []; // Fallback to an empty array
    
                // Filter only active discounts from the batch
                const activeBatch = discountsBatch.filter(
                    (discount) => discount.status === "active"
                );
    
                // Add active discounts to the list
                activeDiscounts = [...activeDiscounts, ...activeBatch];
    
                // Update offset
                offset += discountsBatch.length;
    
                // Break if there are no more discounts to fetch
                if (discountsBatch.length < 10) {
                    break;
                }
            }
    
            // Limit the active discounts to the current limit
            activeDiscounts = activeDiscounts.slice(0, currentLimit);
    
            setDiscounts(activeDiscounts);
    
            // Determine if there are more discounts to load
            setHasMoreDiscounts(activeDiscounts.length >= currentLimit && offset > activeDiscounts.length);
        } catch (error) {
            console.error("Failed to fetch discounts", error);
            setDiscounts([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        loadDiscounts(true); // Pass the new limit directly
    };

    const handlePress = React.useCallback(
        (discountId) => {
            navigation.navigate("DiscountDetails", {
                discountId,
            });
        },
        [navigation]
    );

    const renderItem = ({ item }) => (
        <DiscountItem item={item} onPress={() => handlePress(item.ID)} />
    );

    if (loading && !loadingMore) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#5271ff" />
                <Text style={{ marginTop: 10 }}>Loading discounts...</Text>
            </View>
        );
    }

    if (!discounts.length) {
        return (
            <View style={styles.loaderContainer}>
                <Text>No discount found.</Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.container}
            data={discounts}
            keyExtractor={(item, index) => `${item.ID}-${index}`}
            renderItem={renderItem}
            refreshing={loading}
            onRefresh={loadDiscounts}
            contentContainerStyle={{ paddingBottom: 30 }}
            ListFooterComponent={
                hasMoreDiscounts ? (
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

export default DiscountsList;
