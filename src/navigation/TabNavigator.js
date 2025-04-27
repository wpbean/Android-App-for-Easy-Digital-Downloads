import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import DashboardStats from "../screens/DashboardStats";
import RecentOrders from "../screens/RecentOrders";
import CustomersList from "../screens/CustomersList";
import ProductsList from "../screens/ProductsList";
import ConfigScreen from "../screens/ConfigScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === "Dashboard") {
                        iconName = focused
                            ? "speedometer"
                            : "speedometer-outline";
                    } else if (route.name === "Sales") {
                        iconName = focused ? "cash" : "cash-outline";
                    } else if (route.name === "Customers") {
                        iconName = focused ? "person" : "person-outline";
                    } else if (route.name === "Products") {
                        iconName = focused ? "cube" : "cube-outline";
                    } else if (route.name === "Settings") {
                        iconName = focused ? "settings" : "settings-outline";
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#5271ff", // Change this to your desired focused color
                tabBarInactiveTintColor: "#888", // Change this to your desired unfocused color
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStats} />
            <Tab.Screen name="Sales" component={RecentOrders} />
            <Tab.Screen name="Customers" component={CustomersList} />
            <Tab.Screen name="Products" component={ProductsList} />
            <Tab.Screen name="Settings" component={ConfigScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
