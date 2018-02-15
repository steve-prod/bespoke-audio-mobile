import React, { Component } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { TabNavigator, TabBarBottom } from "react-navigation";
import DetailsScreen from "./DetailsScreen.js";
import InboxScreen from "./InboxScreen.js";
import RecorderScreen from "./RecorderScreen.js";
import BrowseScreen from "./BrowseScreen.js";
import LoginScreen from "./LoginScreen.js";

class MainScreen extends Component {
    render() {
        return <MainStack parentNavigation={this.props.navigation} />;
    }
}

export default TabNavigator(
    {
        Inbox: { screen: InboxScreen },
        Recorder: { screen: RecorderScreen },
        Browse: { screen: BrowseScreen }
    },
    {
        navigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ focused, tintColor }) => {
                const { routeName } = navigation.state;
                let iconName;
                if (routeName === "Inbox") {
                    iconName = `ios-filing${focused ? "" : "-outline"}`;
                } else if (routeName === "Recorder") {
                    iconName = `ios-mic${focused ? "" : "-outline"}`;
                } else if (routeName === "Browse") {
                    iconName = `ios-list${focused ? "" : "-outline"}`;
                }

                return <Ionicons name={iconName} size={25} color={tintColor} />;
            }
        }),
        tabBarOptions: {
            activeTintColor: "tomato",
            inactiveTintColor: "gray",
        },
        tabBarComponent: TabBarBottom,
        tabBarPosition: "bottom",
        animationEnabled: false,
        swipeEnabled: false
    }
);
