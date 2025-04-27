import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthCheckScreen from "../screens/AuthCheckScreen";
import TabNavigator from "./TabNavigator";
import OrderDetails from "../screens/OrderDetails";
import CustomerDetails from "../screens/CustomerDetails";
import ProductDetails from "../screens/ProductDetails";
import ConfigScreen from "../screens/ConfigScreen";
import DiscountsList from "../screens/DiscountsList";
import DiscountDetails from "../screens/DiscountDetails";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="AuthCheckScreen"
                component={AuthCheckScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="HomeTabs"
                component={TabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="OrderDetails" component={OrderDetails} />
            <Stack.Screen name="CustomerDetails" component={CustomerDetails} />
            <Stack.Screen name="ProductDetails" component={ProductDetails} />
            <Stack.Screen
                title="Discount Codes"
                name="DiscountsList"
                component={DiscountsList}
            />
            <Stack.Screen name="DiscountDetails" component={DiscountDetails} />
            <Stack.Screen
                title="API Settings"
                name="ConfigScreen"
                component={ConfigScreen}
            />
        </Stack.Navigator>
    );
};

export default StackNavigator;
