import React, { Component } from 'react';
import {
    AsyncStorage,
    Button,
    Dimensions,
    FlatList,
    Slider,
    StyleSheet,
    Text,
    View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Asset, Audio, Font } from 'expo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Message from './Message.js';

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Login'})]
});

const BACKGROUND_COLOR = '#FFF8ED';

export default class InboxScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            feedback: ""
        };
    }

    componentDidMount() {
        this.load();
    }

    getMessages() {
        var that = this;
        var messagesXHR = new XMLHttpRequest();
        messagesXHR.addEventListener('load', (event) => {
            if (event.target.status === 200) {
                this.setState({messages: JSON.parse(event.target.responseText)});
            } else {
                // TODO: alert user login failed
                alert(event.target.status);
                alert(event.target.responseText);
            }
        });
        messagesXHR.addEventListener('error', function(event) {
            // TODO: alert user login failed
            alert(event.target.status)
        });
        messagesXHR.open('GET', 'https://bespoke-audio.com/messages');
        messagesXHR.setRequestHeader('Accept', 'application/json');
        messagesXHR.send();
    }

    load = async () => {
        try {
            const session = await AsyncStorage.getItem('session')
            if (session === null) {
                this.props.navigation.navigate('Login')
            }
            // Get messages or goto login
            this.getMessages();
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
                <Text style={styles.inboxText}>Inbox</Text>
                <FlatList
                    style={styles.inboxFlatList}
                    data={this.state.messages}
                    keyExtractor={ (item, index) => item.messageID}
                    renderItem={({item}) => (
                        <Message messageID={item.messageID} creatorID={item.creatorID} />
                    )}
                />
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
        paddingTop: 10,
        backgroundColor: BACKGROUND_COLOR,
        flex: 1,
    },
    inboxText: {
        alignSelf: 'center'
    }
});
