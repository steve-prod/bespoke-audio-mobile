import React, { Component } from "react";
import {
    Button,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

const BUTTON_HEIGHT = 50;

export default class PrivateScreen extends Component {
    constructor(props) {
        super(props);
        this.recording;
        this.creatorID;
        this.state = {
            recipientEmail: "",
            isSending: false,
            isSent: false,
            isReplying: false
        }
        this._sendPrivateMessage = this._sendPrivateMessage.bind(this);
    }

    _sendPrivateMessage() {
        var that = this;
        var formData = new FormData();
        formData.append("blob", {
            uri: that.recording.getURI(),
            name: "blob",
            type: "audio/x-caf"
        });
        formData.append("recipient", that.creatorID || that.state.recipientEmail);
        formData.append("isPublic", false);
        var sendMessageXHR = new XMLHttpRequest();
        sendMessageXHR.addEventListener("load", event => {
            if (event.target.status === 201) {
                this.setState({
                    isSending: false,
                    isSent: true
                });
                setTimeout(() => {
                    this.setState({
                        isSent: false,
                        recipientEmail: "",
                        isPlaybackAllowed: false
                    });
                }, 1000);
                this.recording = null;
                this.sound = null;
                this.reloadRecorder();
            } else {
                this.setState({ isSending: false });
                // TODO: indicate message send failure
            }
        });
        sendMessageXHR.addEventListener("error", function(event) {
            this.setState({ isSending: false });
            // TODO: alert user login failed
            alert(event.target.status);
            alert("XHR Error: eventMessage");
        });
        sendMessageXHR.open("POST", "https://bespoke-audio.com/messages");
        sendMessageXHR.send(formData);
        this.setState({ isSending: true });
    }

    render() {
        const params = this.props.screenProps;
        const creatorID = params ? params.creatorID || "" : "";
        this.creatorID = creatorID;
        const isReplying = params.isReplying;
        this.reloadRecorder = params.reloadRecorder;
        this.recording = params.recording;

        return (
            <View>
                <View>
                    {!isReplying && (
                        <TextInput
                            id="recipient-email"
                            style={styles.recipientInput}
                            placeholder="Recipient email here"
                            value={this.props.recipientEmail}
                            onChangeText={text => {
                                this.setState({ recipientEmail: text });
                            }}
                        />
                    )}
                    {isReplying && (
                        <View>
                            <View style={styles.replyButtons}>
                                <Text style={styles.replyingTo}>
                                    Replying To:
                                </Text>
                                <Button
                                    title="Reset"
                                    onPress={this.reloadRecorder}
                                />
                            </View>
                            <Text style={styles.replyingToCreatorID}>
                                {creatorID}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.sendButtonContainer}>
                    {(this.state.recipientEmail.indexOf("@")!== -1 || {creatorID}) &&
                        !this.state.isSending &&
                        !this.state.isSent && (
                            <Button
                                title={"Send Message"}
                                size={BUTTON_HEIGHT}
                                onPress={this._sendPrivateMessage}
                                disabled={this.state.isLoading}
                                style={styles.sendPrivateMessageButton}
                            />
                        )}
                    <Text
                        style={
                            this.state.isSending
                                ? styles.sendingBanner
                                : styles.removed
                        }
                    >
                        Sending...
                    </Text>
                    <Text
                        style={
                            this.state.isSent
                                ? styles.sentBanner
                                : styles.removed
                        }
                    >
                        Message Sent
                    </Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({

    recipientInput: {
        height: BUTTON_HEIGHT,
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 20,
        paddingLeft: 10,
        marginTop: 38
    },
    removed: {
        display: "none"
    },
    replyButtons: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    replyingTo: {
        marginTop: 10,
        fontSize: 20
    },
    replyingToCreatorID: {
        height: BUTTON_HEIGHT,
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 20,
        paddingTop: 10,
        paddingLeft: 10
    },
    sendButtonContainer: {
        marginTop: 30
    },
    sendPrivateMessageButton: {},
    sendingBanner: {
        color: "yellow",
        alignSelf: "center"
    },
    sentBanner: {
        color: "green",
        alignSelf: "center"
    }
});
