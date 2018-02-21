import React, { Component } from "react";
import {
    Button,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

const BUTTON_HEIGHT = 50;

export default class PublicScreen extends Component {
    constructor(props) {
        super(props);
        this.recording;
        this.state = {
            tags: "",
            isSending: false,
            isSent: false,
        }
        this._sendPublicMessage = this._sendPublicMessage.bind(this);
    }

    _sendPublicMessage() {
        var that = this;
        var formData = new FormData();
        formData.append("blob", {
            uri: that.recording.getURI(),
            name: "blob",
            type: "audio/mpeg"
        });
        formData.append("tags", that.state.tags);
        formData.append("isPublic", true);
        var publishMessageXHR = new XMLHttpRequest();
        publishMessageXHR.addEventListener("load", event => {
            if (event.target.status === 201) {
                this.setState({
                    isSending: false,
                    isSent: true
                });
                setTimeout(() => {
                    this.setState({
                        isSent: false,
                        tags: "",
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
        publishMessageXHR.addEventListener("error", function(event) {
            this.setState({ isSending: false });
            // TODO: alert user login failed
            alert(event.target.status);
            alert("XHR Error: eventMessage");
        });
        publishMessageXHR.open("POST", "https://bespoke-audio.com/messages");
        publishMessageXHR.send(formData);
        this.setState({ isSending: true });
    }

    render() {
        const params = this.props.screenProps;
        this.reloadRecorder = params ? params.reloadRecorder : this.props.reloadRecorder;
        const messageID = params ? params.messageID : this.props.messageID;
        this.recording = params ? params.recording : this.props.recording;

        return (
            <View>
                <View style={messageID === "" ? styles.resetButtonContainerWithoutMessageID : styles.resetButtonContainerWithMessageID}>
                    {messageID !== "" && <Button
                        title="Reset"
                        onPress={this.reloadRecorder}
                        style={styles.resetButton}
                    />}
                </View>
                <TextInput
                        id="tags"
                        style={styles.tags}
                        placeholder="#tags #here"
                        value={this.state.tags}
                        onChangeText={text => {
                            this.setState({ tags: text });
                        }}
                />
                <View style={styles.sendButtonContainer}>
                    {!this.state.isSending &&
                        !this.state.isSent && (
                            <Button
                                title={"Publicly Publish Message"}
                                size={BUTTON_HEIGHT}
                                onPress={this._sendPublicMessage}
                                disabled={this.state.isLoading}
                                style={styles.sendPublicMessageButton}
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

    tags: {
        height: BUTTON_HEIGHT,
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 20,
        paddingLeft: 10
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
    resetButton: {

    },
    resetButtonContainerWithMessageID: {
        paddingTop: 57,
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    resetButtonContainerWithoutMessageID: {
        paddingTop: 39,
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    sendButtonContainer: {
        marginTop: 30
    },
    sendPublicMessageButton: {},
    sendingBanner: {
        color: "yellow",
        alignSelf: "center"
    },
    sentBanner: {
        color: "green",
        alignSelf: "center"
    }
});
