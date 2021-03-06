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
        this.messageID;
        this.state = {
            recipientEmail: "",
            isSending: false,
            isSent: false,
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
        sendMessageXHR.addEventListener("load", (event) => {
            that.creatorID = "";
            that.messageID = "";
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
                console.log(event.target.responseText);
            }
        });
        sendMessageXHR.addEventListener("error", function(event) {
            this.setState({ isSending: false });
            // TODO: alert user login failed
            alert(event.target.status);
            alert("XHR Error: eventMessage");
        });
        if ((this.creatorID === "" && this.messageID === "") ||
                this.creatorID !== "") {
            sendMessageXHR.open("POST", "https://bespoke-audio.com/messages");
        } else {
            sendMessageXHR.open("POST", "https://bespoke-audio.com/reply/" + this.messageID);
        }
        sendMessageXHR.send(formData);
        this.setState({ isSending: true });
    }

    render() {
        const params = this.props.screenProps;
        const creatorID = params ? params.creatorID || "" : this.props.creatorID;
        this.creatorID = creatorID;
        const messageID = params ? params.messageID || "" : "";
        this.messageID = messageID;
        this.reloadRecorder = params ? params.reloadRecorder : this.props.reloadRecorder;
        this.recording = params ? params.recording : this.props.recording;

        return (
            <View>
                <View>
                    {creatorID === "" && messageID !== "" && (
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
                            <TextInput
                                id="recipient-email"
                                style={styles.recipientInput}
                                value="Anonymous Recipient"
                            />
                        </View>
                    )}
                    {creatorID === "" && messageID === "" && (
                        <View>
                            <View style={styles.replyButtons}>
                                <Text style={styles.replyingTo}>
                                    Send To:
                                </Text>
                            </View>
                            <TextInput
                                id="recipient-email"
                                style={styles.recipientInput}
                                value={this.state.recipientEmail}
                                placeholder="Recipient Email"
                                onChangeText={(text) => {
                                    this.setState({recipientEmail: text})}}
                            />
                        </View>
                    )}
                    {creatorID !== "" && (
                        <View>
                            <View style={styles.privateReplyButtons}>
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
                                title={"Send Private Message"}
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
    privateReplyButtons: {
        marginTop: 56,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    recipientInput: {
        height: BUTTON_HEIGHT,
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 20,
        paddingLeft: 10,
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
        fontSize: 20,
        marginBottom: 5
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
