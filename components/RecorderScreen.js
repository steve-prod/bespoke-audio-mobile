import React, { Component } from 'react';
import { AsyncStorage, Button, Text, View } from 'react-native';
import { NavigationActions } from 'react-navigation';

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Login'})]
});

export default class RecorderScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {response: ""};
    }

    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            headerRight: (
                <Button
                    onPress={async () => {
                            try {
                                await AsyncStorage.setItem('session', "");
                                navigation.dispatch(resetAction);
                            } catch (e) {
                                // TODO: alert user
                                alert(JSON.stringify(e));
                            }
                        }
                    }
                    type="button"
                    title="Logout"
                    color="#000"
                />
            )
        };
    };

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Recorder</Text>
                <Text>{this.state.response}</Text>
                <Button
                    title="Go to Inbox"
                    onPress={() => this.props.navigation.navigate('Inbox')}
                />
                <Button
                    title="Go to Browse"
                    onPress={() => this.props.navigation.navigate('Browse')}
                />
            </View>
        );
    }
}
