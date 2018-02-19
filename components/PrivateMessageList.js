import React, { Component } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import PrivateMessage from "./PrivateMessage.js";

const BACKGROUND_COLOR = "#FFF8ED";
const FONT_SIZE = 20;

export default class PrivateMessageList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };
        this._updatePrivateMessagesList = this._updatePrivateMessagesList.bind(
            this
        );
        this._reply = this._reply.bind(this);
    }

    componentDidMount() {
        this._getMessages();
    }

    _getMessages() {
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
        messagesXHR.open("GET", "https://bespoke-audio.com/messages");
        messagesXHR.setRequestHeader("Accept", "application/json");
        messagesXHR.send();
    }

    _updatePrivateMessagesList() {
        this._getMessages();
    }

    _reply(creatorID) {
        this.props.onReplyPressed(creatorID);
    }

    render() {
        return (
            <View style={styles.privateMessagesListContainer}>
                <View style={styles.refreshPrivateMessagesButtonContainer}>
                    <Text style={styles.inboxText}>Inbox</Text>
                    <Button
                        title="Refresh"
                        onPress={this._updatePrivateMessagesList}
                        style={styles.refreshButton}
                    />
                </View>
                {this.state.messages.length > 0 && (
                    <FlatList
                        style={styles.privateMessagesList}
                        data={this.state.messages}
                        keyExtractor={(item, index) => item.messageID}
                        renderItem={({ item }) => (
                            <PrivateMessage
                                messageID={item.messageID}
                                creatorID={item.creatorID}
                                onReplyPressed={creatorID =>
                                    this._reply(creatorID)
                                }
                                onPrivateMessagesListChange={
                                    this._updatePrivateMessagesList
                                }
                            />
                        )}
                    />
                )}
                {this.state.messages.length === 0 && (
                    <Text style={styles.noMessages}>No messages</Text>
                )}
                <View style={styles.tabMenuBuffer} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    inboxText: {
        paddingVertical: 10,
        marginLeft: 20,
        fontSize: FONT_SIZE
    },
    noMessages: {
        alignSelf: "center",
        fontSize: 20
    },
    privateMessagesList: {
        borderTopWidth: 1
    },
    privateMessagesListContainer: {
        overflow: "scroll"
    },
    refreshButton: {},
    refreshPrivateMessagesButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    tabMenuBuffer: {

    }
});
