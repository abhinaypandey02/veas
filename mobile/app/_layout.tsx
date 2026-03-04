import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { AuthWrapper, useAuthFetch } from "naystack/auth/email/client";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ApolloWrapper, useAuthQuery } from "naystack/graphql/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_CURRENT_USER } from "@/constants/graphql/queries";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function LayoutWrapper() {
  return (
    <AuthWrapper
      onTokenUpdate={(token) => {
        if (token) {
          AsyncStorage.setItem("refresh", token);
        } else {
          AsyncStorage.removeItem("refresh");
        }
      }}
    >
      <ApolloWrapper>
        <RootLayout />
      </ApolloWrapper>
    </AuthWrapper>
  );
}

function RootLayout() {
  const colorScheme = useColorScheme();
  const [token] = useAuthQuery(GET_CURRENT_USER);
  useAuthFetch(() => AsyncStorage.getItem("refresh"));

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <button
        onClick={() => {
          token().then((res) => {
            console.log(res.data?.getCurrentUser?.name);
          });
        }}
      >
        test
      </button>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
