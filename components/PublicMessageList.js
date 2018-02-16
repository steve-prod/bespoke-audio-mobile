import React, { Component } from "react";
import { Button,
    FlatList,
    StyleSheet,
    Text,
    View } from "react-native";
import PublicMessage from "./PublicMessage.js";

const BACKGROUND_COLOR = "#FFF8ED";
const FONT_SIZE = 20;

export default class PrivateMessageList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };
    }

    componentDidMount() {
        this.getMessages();
    }

    getMessages() {
        var that = this;
        var messagesXHR = new XMLHttpRequest();
        messagesXHR.addEventListener("load", event => {
            if (event.target.status === 200) {
                this.setState({
                    messages: JSON.parse(event.target.responseText)
                });
            } else {
                // TODO: alert user login failed
                alert(event.target.status);
                alert(event.target.responseText);
            }
        });
        messagesXHR.addEventListener("error", function(event) {
            // TODO: alert user login failed
            alert(event.target.status);
        });
        messagesXHR.open("GET", "https://bespoke-audio.com/public");
        messagesXHR.setRequestHeader("Accept", "application/json");
        messagesXHR.send();
    }

    _updatePublicMessagesList() {
        this.getMessages();
    }

    _replyPrivately(messageID) {
        this.props.onReplyPrivatelyPressed(messageID);
    }

    _replyPublicly(messageID) {
        this.props.onReplyPubliclyPressed(messageID);
    }

    render() {
        return (
            <View style={styles.publicMessagesListContainer}>
                <View style={styles.refreshPublicMessagesButtonContainer}>
                    <Text style={styles.browseText}>Browse</Text>
                    <Button
                        title="Refresh"
                        onPress={() => this._updatePublicMessagesList()}
                        style={styles.resfreshButton}
                    />
                </View>
                <FlatList
                    style={styles.publicMessagesList}
                    data={this.state.messages}
                    keyExtractor={(item, index) => item.messageID}
                    renderItem={({ item }) => (
                        <PublicMessage
                            messageID={item.messageID}
                            tags={item.tags}
                            onReplyPrivatelyPressed={(messageID) =>this._replyPrivately(messageID)}
                            onReplyPubliclyPressed={(messageID) =>this._replyPublicly(messageID)}
                        />
                    )}
                />
                <View style={styles.tabMenuBuffer} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    browseText: {
        paddingVertical: 10,
        marginLeft: 20,
        fontSize: FONT_SIZE
    },
    publicMessagesList: {
        borderTopWidth: 1
    },
    publicMessagesListContainer: {
        overflow: "scroll"
    },
    refreshButton: {},
    refreshPublicMessagesButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    tabMenuBuffer: {
        height: 40
    }
});
