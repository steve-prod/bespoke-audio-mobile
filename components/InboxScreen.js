import React, { Component } from 'react';
import {
    AsyncStorage,
    Button,
    StyleSheet,
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
        this._reply = this._reply.bind(this);
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

    _reply(creatorID) {
        this.props.navigation.navigate('Recorder', {creatorID: creatorID})
    }

    render() {
        return (
            <View style={styles.inboxScreen}>
                <PrivateMessageList onReplyPressed={(creatorID) => this._reply(creatorID)}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    inboxScreen: {
        top: 30,
        backgroundColor: BACKGROUND_COLOR,
        flex: 1,
    },
});
