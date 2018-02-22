import React, { Component } from "react";
import {
    Button,
    Dimensions,
    Slider,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import Expo, { Audio, FileSystem, Permissions } from "expo";
import { TabNavigator, TabBarTop } from "react-navigation";
import Ionicons from "react-native-vector-icons/Ionicons";
import PrivateScreen from "./PrivateScreen.js";
import PublicScreen from "./PublicScreen.js";

const BUTTON_HEIGHT = 50;
const FONT_SIZE = 14;

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFF8ED";
const LIVE_COLOR = "#FF0000";
const DISABLED_OPACITY = 0.5;

const recordingOptions = {
  android: {
    extension: '.3gp',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_THREE_GPP,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

const StatusNavigator = TabNavigator({
    Private: {screen: PrivateScreen},
    Public: {screen: PublicScreen}
}, {
    initialRouteName: 'Private',
    tabBarOptions: {
        activeTintColor: "tomato",
        inactiveTintColor: "gray",
        indicatorStyle: {
            backgroundColor: BACKGROUND_COLOR,
        },
        labelStyle: {
            fontSize: 20
        },
        style: {
            backgroundColor: BACKGROUND_COLOR,
        }
    },
    tabBarComponent: TabBarTop,
    tabBarPosition: "top",
    animationEnabled: false,
    swipeEnabled: false
});

export default class Recorder extends Component {
    constructor(props) {
        super(props);
        this.recording = null;
        this.sound = null;
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.state = {
            hasRecordingPermissions: false,
            isLoading: false,
            isPlaybackAllowed: false,
            soundPosition: null,
            soundDuration: null,
            recordingDuration: null,
            shouldPlay: false,
            isPlaying: false,
            isRecording: false,
            shouldCorrectPitch: true,
        };
        this.recordingSettings = recordingOptions;
        this._reloadRecorder = this._reloadRecorder.bind(this);
        // // UNCOMMENT THIS TO TEST maxFileSize:
        // this.recordingSettings.android['maxFileSize'] = 12000;
    }

    componentDidMount() {
        this._askForPermissions();
    }

    _askForPermissions = async () => {
        const response = await Permissions.askAsync(
            Permissions.AUDIO_RECORDING
        );
        this.setState({
            hasRecordingPermissions: response.status === "granted"
        });
    };

    _updateScreenForSoundStatus = status => {
        if (status.isLoaded) {
            this.setState({
                soundDuration: status.durationMillis,
                soundPosition: status.positionMillis,
                shouldPlay: status.shouldPlay,
                isPlaying: status.isPlaying,
                shouldCorrectPitch: status.shouldCorrectPitch,
                isPlaybackAllowed: true
            });
            if(status.didJustFinish) {
                this.sound.stopAsync();
            }
        } else {
            this.setState({
                soundDuration: null,
                soundPosition: null,
                isPlaybackAllowed: false,
                recipientEmail: this.props.creatorID
            });
            if (status.error) {
                console.log(`FATAL PLAYER ERROR: ${status.error}`);
            }
        }
    };

    _updateScreenForRecordingStatus = status => {
        if (status.canRecord) {
            this.setState({
                isRecording: status.isRecording,
                recordingDuration: status.durationMillis
            });
            if (status.isRecording && status.durationMillis > 60000) {
                this._stopRecordingAndEnablePlayback();
                alert("Recorder stopped after 60 seconds");
            }
        } else if (status.isDoneRecording) {
            this.setState({
                isRecording: false,
                recordingDuration: status.durationMillis
            });
            if (!this.state.isLoading) {
                this._stopRecordingAndEnablePlayback();
            }
        }
    };

    async _stopPlaybackAndBeginRecording() {
        this.setState({
            isLoading: true
        });
        if (this.sound !== null) {
            await this.sound.unloadAsync();
            this.sound.setOnPlaybackStatusUpdate(null);
            this.sound = null;
        }
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
        });
        if (this.recording !== null) {
            this.recording.setOnRecordingStatusUpdate(null);
            this.recording = null;
        }

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(this.recordingSettings);
        recording.setOnRecordingStatusUpdate(
            this._updateScreenForRecordingStatus
        );

        this.recording = recording;
        await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
        this.setState({
            isLoading: false
        });
    }

    async _stopRecordingAndEnablePlayback() {
        this.setState({
            isLoading: true
        });
        try {
            await this.recording.stopAndUnloadAsync();
        } catch (error) {
            // Do nothing -- we are already unloaded.
        }
        const info = await FileSystem.getInfoAsync(this.recording.getURI());
        console.log(`FILE INFO: ${JSON.stringify(info)}`);
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            playsInSilentLockedModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
        });
        const { sound, status } = await this.recording.createNewLoadedSound(
            {
                isLooping: false,
                shouldCorrectPitch: this.state.shouldCorrectPitch,
                progressUpdateIntervalMillis: 50
            },
            this._updateScreenForSoundStatus
        );
        this.sound = sound;
        this.setState({
            isLoading: false
        });
    }

    _onRecordPressed = () => {
        if (this.state.isRecording) {
            this._stopRecordingAndEnablePlayback();
        } else {
            this.setState({ isSent: false });
            this._stopPlaybackAndBeginRecording();
        }
    };

    _onPlayPausePressed = () => {
        if (this.sound != null) {
            if (this.state.isPlaying) {
                this.sound.pauseAsync();
            } else {
                this.sound.playAsync();
            }
        }
    };

    _onSeekSliderValueChange = value => {
        if (this.sound != null && !this.isSeeking) {
            this.isSeeking = true;
            this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
            this.sound.pauseAsync();
        }
    };

    _onSeekSliderSlidingComplete = async value => {
        if (this.sound != null) {
            this.isSeeking = false;
            const seekPosition = value * this.state.soundDuration;
            if (this.shouldPlayAtEndOfSeek) {
                this.sound.playFromPositionAsync(seekPosition);
            } else {
                this.sound.setPositionAsync(seekPosition);
            }
        }
    };

    _getSeekSliderPosition() {
        if (
            this.sound != null &&
            this.state.soundPosition != null &&
            this.state.soundDuration != null
        ) {
            return this.state.soundPosition / this.state.soundDuration;
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

    _getPlaybackTimestamp() {
        if (
            this.sound != null &&
            this.state.soundPosition != null &&
            this.state.soundDuration != null
        ) {
            return `${this._getMMSSFromMillis(
                this.state.soundPosition
            )} / ${this._getMMSSFromMillis(this.state.soundDuration)}`;
        }
        return "";
    }

    _getRecordingTimestamp() {
        if (this.state.recordingDuration != null) {
            return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
        }
        return `${this._getMMSSFromMillis(0)}`;
    }

    _reloadRecorder() {
        this.props.reloadRecorder();
    }

    render() {
        return !this.state.hasRecordingPermissions ? (
            <View style={styles.recorderContainer}>
                <Text style={[styles.noPermissionsText]}>
                    You must enable audio recording permissions in order to use
                    this app.
                </Text>
                <View />
            </View>
        ) : (
            <View style={styles.recorderContainer}>
                <View
                    style={{
                        opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0
                    }}
                >
                    <Text
                        style={
                            this.state.isRecording
                                ? styles.recordingStatus
                                : { opacity: 0.0 }
                        }
                    >
                        RECORDING
                    </Text>
                    <View style={styles.recordingPanel}>
                        <Button
                            title={
                                this.state.isRecording
                                    ? "Stop\nRecording"
                                    : "Start\nRecording"
                            }
                            size={BUTTON_HEIGHT}
                            onPress={this._onRecordPressed}
                            disabled={this.state.isLoading}
                            style={styles.recordButton}
                        />
                        <Text style={[styles.recordingTimestamp]}>
                            {this.state.isRecording
                                ? this._getRecordingTimestamp()
                                : ""}
                        </Text>
                    </View>
                    <Ionicons
                        name="ios-mic"
                        style={[
                            styles.recordingIcon,
                            { opacity: this.state.isRecording ? 1.0 : 0.5 }
                        ]}
                        size={BUTTON_HEIGHT}
                        color={this.state.isRecording ? LIVE_COLOR : "#000000"}
                    />
                </View>
                <View
                    style={{
                        opacity:
                            !this.state.isPlaybackAllowed ||
                            this.state.isLoading
                                ? DISABLED_OPACITY
                                : 1.0
                    }}
                >
                    <View style={styles.playbackContainer}>
                        <Ionicons
                            name={
                                this.state.isPlaying ? "ios-pause" : "ios-play"
                            }
                            size={BUTTON_HEIGHT}
                            onPress={this._onPlayPausePressed}
                            disabled={
                                !this.state.isPlaybackAllowed ||
                                this.state.isLoading
                            }
                        />
                        <Slider
                            style={styles.playbackSlider}
                            value={this._getSeekSliderPosition()}
                            onValueChange={this._onSeekSliderValueChange}
                            onSlidingComplete={
                                this._onSeekSliderSlidingComplete
                            }
                            disabled={
                                !this.state.isPlaybackAllowed ||
                                this.state.isLoading
                            }
                        />
                        <Text style={styles.playbackTimestamp}>
                            {!this.state.isPlaybackAllowed
                                ? "00:00"
                                : this._getPlaybackTimestamp()}
                        </Text>
                    </View>
                </View>
                {this.props.creatorID !== "" &&
                    <PrivateScreen
                        creatorID={this.props.creatorID}
                        messageID=""
                        reloadRecorder={this._reloadRecorder}
                        recording={this.recording}
                    />
                    }
                {this.props.messageID !== "" && !this.props.isPublic &&
                    <StatusNavigator screenProps={
                        {creatorID: "",
                        messageID: this.props.messageID,
                        recording: this.recording,
                        reloadRecorder: this._reloadRecorder}
                    } />
                }
                {this.props.messageID !== "" && this.props.isPublic &&
                    <PublicScreen
                        messageID={this.props.messageID}
                        reloadRecorder={this._reloadRecorder}
                        recording={this.recording}
                    />
                }
                {this.props.creatorID === "" && this.props.messageID === "" &&
                    <StatusNavigator screenProps={
                        {creatorID: "",
                        messageID: "",
                        recording: this.recording,
                        reloadRecorder: this._reloadRecorder}
                    } />
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    playbackSlider: {
        minWidth: DEVICE_WIDTH / 1.8,
        maxWidth: DEVICE_WIDTH / 1.8
    },
    playbackTimestamp: {
        textAlign: "right",
        alignSelf: "center",
        minHeight: FONT_SIZE
    },
    recordButton: {},
    recorderContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingTop: 20,
        paddingHorizontal: 20,
        padding: 20,
        marginBottom: 50,
        overflow: "visible"
    },
    recordingIcon: {
        alignSelf: "center",
        transform: [{ translateY: -50 }]
    },
    recordingPanel: {
        flexDirection: "row",
        alignSelf: "stretch",
        justifyContent: "space-between"
    },
    recordingStatus: {
        alignSelf: "center",
        color: LIVE_COLOR
    },
    recordingTimestamp: {
        alignSelf: "center"
    },
    playerButton: {
        minHeight: BUTTON_HEIGHT
    },
    playbackContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        minHeight: BUTTON_HEIGHT,
        maxHeight: BUTTON_HEIGHT
    }
});
