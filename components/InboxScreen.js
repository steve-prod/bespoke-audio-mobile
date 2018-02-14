import React, { Component } from 'react';
import {
    AsyncStorage,
    Button,
    StyleSheet,
    Text,
    View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Audio } from 'expo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrivateMessageList from './PrivateMessageList.js';

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Login'})]
});

const BACKGROUND_COLOR = '#FFF8ED';

export default class InboxScreen extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.doesValidSessionExist();
    }

    doesValidSessionExist = async () => {
        try {
            const session = await AsyncStorage.getItem('session')
            if (session === null) {
                this.props.navigation.navigate('Login')
            }
        } catch (e) {
            try {
                async (session) => {
                    await AsyncStorage.setItem('session', "")
                    this.props.navigation.navigate('Login')
                }
            } catch (e) {
                // TODO: alert user
            }
        }
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
            <View style={styles.inbox}>
                <PrivateMessageList />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    inbox: {
        backgroundColor: BACKGROUND_COLOR,
        flex: 1,
    },
});
