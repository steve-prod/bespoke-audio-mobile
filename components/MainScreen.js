import React, { Component } from 'react';
import { AsyncStorage, Button } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TabNavigator, TabBarBottom, StackNavigator } from 'react-navigation';
import DetailsScreen from './DetailsScreen.js';
import InboxScreen from './InboxScreen.js';
import RecorderScreen from './RecorderScreen.js';
import BrowseScreen from './BrowseScreen.js';
import LoginScreen from './LoginScreen.js';

class MainScreen extends Component {
    render() {
        return <MainStack parentNavigation={this.props.navigation} />
    };
}

const InboxStack = StackNavigator({
    Inbox: { screen: InboxScreen},
    Details: { screen: DetailsScreen },
    Login: { screen: LoginScreen}
});

const RecorderStack = StackNavigator({
    Recorder: { screen: RecorderScreen },
    Login: { screen: LoginScreen}
});

const BrowseStack = StackNavigator({
    Browse: { screen: BrowseScreen },
    Details: { screen: DetailsScreen },
    Login: { screen: LoginScreen}
});

export default TabNavigator({
    Inbox: { screen: InboxStack },
    Recorder: { screen: RecorderStack },
    Browse: { screen: BrowseStack }
}, {
    navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
            let iconName;
            if (routeName === 'Inbox') {
                iconName = `ios-filing${focused ? '' : '-outline'}`;
            } else if (routeName === 'Recorder') {
                iconName = `ios-mic${focused ? '' : '-outline'}`;
            } else if (routeName === 'Browse') {
                iconName = `ios-list${focused ? '' : '-outline'}`;
            }

            return <Ionicons name={iconName} size={25} color={tintColor} />;
        },
        header: null
    }),
    tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray'
    },
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false
});
