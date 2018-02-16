import React, { Component } from "react";
import { AsyncStorage, Button, StyleSheet, View } from "react-native";
import { NavigationActions } from "react-navigation";
import { Audio } from "expo";
import Ionicons from "react-native-vector-icons/Ionicons";
import PrivateMessageList from "./PrivateMessageList.js";
import RCTNetworking from "RCTNetworking";

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: "Login" })]
});

const BACKGROUND_COLOR = "#FFF8ED";

export default class InboxScreen extends Component {
    constructor(props) {
        super(props);
        this._reply = this._reply.bind(this);
    }

    componentDidMount() {
        this.doesValidSessionExist();
    }

    doesValidSessionExist = () => {
        var statusXHR = new XMLHttpRequest();
        statusXHR.addEventListener("load", function(event) {
            if (event.target.status === 200) {
                // user is logged in, do nothing
            } else {
                // user is NOT logged in, navigate to login screen
                RCTNetworking.clearCookies(cookiesEaten => {
                    navigation.dispatch(resetAction);
                });
            }
        });
        statusXHR.addEventListener("error", function(event) {
            navigation.dispatch(resetAction);
        });
        statusXHR.open("GET", "https://bespoke-audio.com/status");
        statusXHR.send();
    };

    static navigationOptions = ({ navigation, navigationOptions }) => {
        return {
            headerLeft: null,
            headerRight: (
                <Button
                    onPress={() => {
                        try {
                            RCTNetworking.clearCookies(() => {
                                navigation.dispatch(resetAction);
                            });
                        } catch (e) {
                            // TODO: alert user
                            console.log(e);
                        }
                    }}
                    type="button"
                    title="Logout"
                    color="#000"
                />
            ),
            headerTitle: "Bespoke-Audio"
        };
    };

    _reply(creatorID) {
        this.props.navigation.navigate("Recorder", { creatorID: creatorID, messageID: "" });
    }

    render() {
        return (
            <View style={styles.inboxScreen}>
                <PrivateMessageList
                    onReplyPressed={creatorID => this._reply(creatorID)}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    inboxScreen: {
        backgroundColor: BACKGROUND_COLOR,
        flex: 1
    }
});
