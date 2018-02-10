import React, { Component } from 'react';
import {
    AsyncStorage,
    Button,
    Dimensions,
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
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

export default class InboxScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            feedback: ""
        };
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
                <View style={styles.inboxText}>
                    <Text>Inbox</Text>
                </View>
                <PrivateMessageList />
                <Text>{this.state.feedback}</Text>
                <Button
                    title="Go to Message Details"
                    onPress={() => this.props.navigation.navigate('Details')}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    inbox: {
        backgroundColor: BACKGROUND_COLOR,
        flex: 1,
    },
    inboxText: {
        paddingVertical: 10,
        alignSelf: 'center',
    }
});
