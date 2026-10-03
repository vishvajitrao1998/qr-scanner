import { Ionicons }  from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "../theme/ThemeContext";
import HeaderRight from "../components/HeaderRight";
import ScannerScreen from "../screens/ScannerScreen";
import HistoryScreen from "../screens/HistoryScreen";
import CreateQRScreen from "../screens/CreateQRScreen";


export type TabParamList = {
  Scanner: undefined;
  History: undefined;
  CreateQR: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<string, [string, string]> = {
  Scanner: ["scan", "scan-outline"],
  History: ["time", "time-outline"],
  CreateQR: ["qr-code", "qr-code-outline"],
};




export default function TabNavigator() {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => <HeaderRight />,
        headerRightContainerStyle: { paddingRight: 16 },
        headerTitleAlign: "left",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: c.background },
        headerTitleStyle: { fontSize: 24, fontWeight: "700", color: c.text },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.subtext,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.border,
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={ICONS[route.name][focused ? 0 : 1] as any}
            size={size + 2}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen
        name="CreateQR"
        component={CreateQRScreen}
        options={{ title: "Create QR" }}
      />
    </Tab.Navigator>
  );
}