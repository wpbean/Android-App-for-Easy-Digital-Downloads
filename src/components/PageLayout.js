import { SafeAreaView, ScrollView } from "react-native";

const PageLayout = ({ children }) => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{
                    paddingBottom: 80,
                    paddingHorizontal: 16,
                }}
            >
                {children}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PageLayout;
