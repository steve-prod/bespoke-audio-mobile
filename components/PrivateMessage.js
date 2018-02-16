import React, { Component } from "react";
import {
    Button,
    Dimensions,
    Image,
    Slider,
    StyleSheet,
    Text,
    View
} from "react-native";
import { NavigationActions } from "react-navigation";
import { Audio } from "expo";
import Ionicons from "react-native-vector-icons/Ionicons";

const BUTTON_HEIGHT = 50;

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const FONT_SIZE = 14;
const BUFFERING_STRING = "...buffering...";

export default class PrivateMessage extends Component {
    constructor(props) {
        super(props);
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.playbackInstance = null;
        this.state = {
            playbackInstanceName: BUFFERING_STRING,
            playbackInstancePosition: null,
            playbackInstanceDuration: null,
            shouldPlay: false,
            isPlaying: false,
            isBuffering: true
        };
        this._deleteMessage = this._deleteMessage.bind(this);
        this._updatePrivateMessageList = this._updatePrivateMessageList.bind(
            this
        );
        this._reply = this._reply.bind(this);
    }

    componentDidMount() {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
        });
        this._loadNewPlaybackInstance();
    }

    async _loadNewPlaybackInstance() {
        const source = {
            uri: "https://bespoke-audio.com/audio/" + this.props.messageID
        };
        const initialStatus = {
            shouldPlay: false,
            progressUpdateIntervalMillis: 10
            // // UNCOMMENT THIS TO TEST THE OLD androidImplementation:
            // androidImplementation: 'MediaPlayer',
        };
        try {
            const { sound, status } = await Audio.Sound.create(
                source,
                initialStatus,
                this._onPlaybackStatusUpdate
            );
            this.playbackInstance = sound;
        } catch (e) {
            console.log(e);
        }
    }

    _onPlaybackStatusUpdate = status => {
        if (status.isLoaded) {
            this.setState({
                playbackInstancePosition: status.positionMillis,
                playbackInstanceDuration: status.durationMillis,
                shouldPlay: status.shouldPlay,
                isPlaying: status.isPlaying,
                isBuffering: status.isBuffering
            });
            if (status.didJustFinish) {
                this.playbackInstance.stopAsync();
            }
        } else {
            if (status.error) {
                console.log(`FATAL PLAYER ERROR: ${status.error}`);
            }
        }
    };

    _onPlayPausePressed = () => {
        if (this.playbackInstance != null) {
            if (this.state.isPlaying) {
                this.playbackInstance.pauseAsync();
            } else {
                this.playbackInstance.playAsync();
            }
        }
    };

    _onSeekSliderValueChange = value => {
        if (this.playbackInstance != null && !this.isSeeking) {
            this.isSeeking = true;
            this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
            this.playbackInstance.pauseAsync();
        }
    };

    _onSeekSliderSlidingComplete = async value => {
        if (this.playbackInstance != null) {
            this.isSeeking = false;
            const seekPosition = value * this.state.playbackInstanceDuration;
            if (this.shouldPlayAtEndOfSeek) {
                this.playbackInstance.playFromPositionAsync(seekPosition);
            } else {
                this.playbackInstance.setPositionAsync(seekPosition);
            }
        }
    };

    _getSeekSliderPosition() {
        if (
            this.playbackInstance != null &&
            this.state.playbackInstancePosition != null &&
            this.state.playbackInstanceDuration != null
        ) {
            return (
                this.state.playbackInstancePosition /
                this.state.playbackInstanceDuration
            );
        }
        return 0;
    }

    _getMMSSFromMillis(millis) {
        const totalSeconds = millis / 1000;
        const seconds = Math.floor(totalSeconds % 60);
        const minutes = Math.floor(totalSeconds / 60);

        const padWithZero = number => {
            const string = number.toString();
            if (number < 10) {
                return "0" + string;
            }
            return string;
        };
        return padWithZero(minutes) + ":" + padWithZero(seconds);
    }

    _getTimestamp() {
        if (
            this.playbackInstance != null &&
            this.state.playbackInstancePosition != null &&
            this.state.playbackInstanceDuration != null
        ) {
            return `${this._getMMSSFromMillis(
                this.state.playbackInstancePosition
            )} / ${this._getMMSSFromMillis(
                this.state.playbackInstanceDuration
            )}`;
        }
        return (
            "00:00 / " +
            this._getMMSSFromMillis(this.state.playbackInstanceDuration)
        );
    }

    _deleteMessage() {
        var deleteXHR = new XMLHttpRequest();
        deleteXHR.addEventListener("load", event => {
            if (event.target.status === 204) {
                this._updatePrivateMessageList();
            } else {
                // TODO: alert user login failed
                alert(event.target.responseText);
            }
        });
        deleteXHR.addEventListener("error", function(event) {
            // TODO: alert user login failed
            alert(event.target.status);
        });
        deleteXHR.open(
            "DELETE",
            "https://bespoke-audio.com/messages/" + this.props.messageID
        );
        deleteXHR.send();
    }

    _updatePrivateMessageList() {
        this.props.onPrivateMessageListChange();
    }

    _reply(creatorID) {
        this.props.onReplyPressed(creatorID);
    }

    render() {
        return (
            <View style={styles.messageContainer}>
                <View style={styles.fromContainer}>
                    <Text>From: {this.props.creatorID}</Text>
                </View>
                <View style={[styles.playerContainer, { opacity: 1.0 }]}>
                    {!this.state.isPlaying && (
                        <Ionicons
                            style={styles.playerButton}
                            name="ios-play"
                            size={BUTTON_HEIGHT}
                            onPress={this._onPlayPausePressed}
                        />
                    )}
                    {this.state.isPlaying && (
                        <Ionicons
                            style={styles.playerButton}
                            name="ios-pause"
                            size={BUTTON_HEIGHT}
                            onPress={this._onPlayPausePressed}
                        />
                    )}
                    {this.state.isBuffering && (
                        <Text style={[styles.text, styles.buffering]}>
                            {BUFFERING_STRING}
                        </Text>
                    )}
                    {!this.state.isBuffering && (
                        <Slider
                            style={styles.playerSlider}
                            value={this._getSeekSliderPosition()}
                            onValueChange={this._onSeekSliderValueChange}
                            onSlidingComplete={
                                this._onSeekSliderSlidingComplete
                            }
                            disabled={this.state.isBuffering}
                        />
                    )}
                    <Text style={styles.playerTracking}>
                        {this._getTimestamp()}
                    </Text>
                </View>
                <View style={styles.privateMessageButtonContainer}>
                    <Button
                        title="Reply"
                        onPress={() => this._reply(this.props.creatorID)}
                    />
                    <Button
                        title="Delete"
                        onPress={this._deleteMessage}
                        style={styles.deleteButton}
                        color="red"
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    fromContainer: {
        // marginLeft: 10
    },
    messageContainer: {
        paddingTop: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        padding: 20
    },
    playerContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: BUTTON_HEIGHT,
        maxHeight: BUTTON_HEIGHT
    },
    playerButton: {
        minHeight: BUTTON_HEIGHT
    },
    playerSlider: {
        minWidth: DEVICE_WIDTH / 1.8,
        maxWidth: DEVICE_WIDTH / 1.8
    },
    playerTracking: {
        minHeight: FONT_SIZE
    },
    privateMessageButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around"
    }
});
