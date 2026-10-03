import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../theme/ThemeContext";
import SplashScreen from "../screens/SplashScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ResultScreen from "../screens/ResultScreen";
import { ScanRecord } from "../types/scan";
import { NavigatorScreenParams } from "@react-navigation/native";
import TabNavigator, { TabParamList } from "./TabNavigator";
import AboutScreen from "../screens/AboutScreen";
import LegalScreen from "../screens/LegalScreen";

export type RootStackParamList = {
  Splash: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  Settings: undefined;
  Result: { scan: ScanRecord };
  About: undefined;
  Legal: { doc: "privacy" | "terms" };
};





const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { theme } = useTheme();
  const base = theme.dark ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false, animation: "fade" }}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false, animation: "fade" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings", headerShadowVisible: false }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{
            title: "Scan Result",
            headerBackTitle: "Back",
            headerShadowVisible: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: "About", headerShadowVisible: false }}
        />
        <Stack.Screen
          name="Legal"
          component={LegalScreen}
          options={({ route }) => ({
            title: route.params.doc === "privacy" ? "Privacy Policy" : "Terms of Use",
            headerShadowVisible: false,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}