import React, { Component } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { NavigationActions } from "react-navigation";
import PublicMessageList from "./PublicMessageList.js";
import RCTNetworking from "RCTNetworking";

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: "Login" })]
});

const BACKGROUND_COLOR = "#FFF8ED";

export default class BrowseScreen extends Component {
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

    _replyPrivately(messageID) {
        this.props.navigation.navigate("Recorder", { creatorID: "", messageID: messageID, isPublic: false });
    }

    _replyPublicly(messageID) {
        this.props.navigation.navigate("Recorder", { creatorID: "", messageID: messageID, isPublic: true });
    }

    render() {
        return (
            <View style={styles.browseScreen}>
                <PublicMessageList
                    onReplyPrivatelyPressed={(messageID) => this._replyPrivately(messageID)}
                    onReplyPubliclyPressed={(messageID) => this._replyPublicly(messageID)}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    browseScreen: {
        backgroundColor: BACKGROUND_COLOR,
        flex: 1
    },
    browseText: {
        paddingVertical: 10,
        alignSelf: "center"
    }
});
