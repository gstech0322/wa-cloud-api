import React, { useEffect } from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AddContactScreenWA from "./app/screens/AddContactScreenWA";
import ChatScreenWA from "./app/screens/ChatScreenWA";
import InboxScreenWA from "./app/screens/InboxScreenWA";
import SendTemplateScreen from "./app/screens/SendTemplateScreen";
import http from "./app/services/client";

// npm start
// eslint --ext .js app/ --fix
// eas build -p android --profile development

function handleWebUserToken() {
  // Only execute on web
  if (Platform.OS !== "web") return;

  const fragment = window?.location?.hash; // #access_token=USER_TOKEN

  if (!fragment?.includes("access_token")) return;

  try {
    const params = new URLSearchParams(fragment.replace("#", ""));
    const userToken = params.get("access_token");

    if (!userToken) return;

    http
      .put("add_ig_account", { user_token: userToken })
      .catch((err) => {
        console.warn("Failed to register IG account:", err?.message);
      })
      .finally(() => {
        window.location.hash = "";
      });
  } catch (error) {
    console.warn("Error parsing access token:", error?.message);
  }
}

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    handleWebUserToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="WhatsAppInbox"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="WhatsAppInbox"
          component={InboxScreenWA}
          options={{ orientation: "all" }}
        />
        <Stack.Screen
          name="ChatWhatsApp"
          component={ChatScreenWA}
          options={{ orientation: "all" }}
        />
        <Stack.Screen
          name="AddContactWA"
          component={AddContactScreenWA}
          options={{ orientation: "all" }}
        />
        <Stack.Screen
          name="SendTemplate"
          component={SendTemplateScreen}
          options={{ orientation: "all" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
