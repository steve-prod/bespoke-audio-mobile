import React, { Component } from 'react';
import {
    Button,
    Dimensions,
    Slider,
    StyleSheet,
    Text,
    View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Audio } from 'expo';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BUTTON_HEIGHT = 50;

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const DISABLED_OPACITY = 0.5;
const FONT_SIZE = 14;
const LOADING_STRING = '... loading ...';
const BUFFERING_STRING = '...buffering...';

export default class PrivateMessage extends Component {
    constructor(props) {
        super(props);
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.state = {
            info: "",
            shouldPlay: false,
            shouldCorrectPitch: true,
            playbackInstance: null,
            playbackInstanceName: LOADING_STRING,
            playbackInstancePosition: 0,
            playbackInstanceDuration: 0,
            isPlaying: false,
            isBuffering: true
        };
    }

    componentDidMount() {
        this.getAndSetMessageAudio();
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        });
    }

    async getAndSetMessageAudio() {
        const source = { uri: "https://bespoke-audio.com/audio/" + this.props.messageID + ".mp3" };
        const initialStatus = {
          shouldPlay: false,
          shouldCorrectPitch: this.state.shouldCorrectPitch,
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
            this.setState({
                isBuffering: false,
                playbackInstance: sound,
                playbackInstanceDuration: Math.floor(status.playableDurationMillis / 1000)
            })
        } catch (e) {
            // this.setState({info: JSON.stringify(e)});
        }
    }

    _onPlaybackStatusUpdate = status => {
        this.setState({
            playbackInstancePosition: status.positionMillis / 1000,
            isPlaying: status.isPlaying,
            isBuffering: status.isBuffering,
            shouldCorrectPitch: status.shouldCorrectPitch,
        });
    }

    _onLoadStart = () => {
        console.log(`ON LOAD START`);
    };

    _onLoad = status => {
        console.log(`ON LOAD : ${JSON.stringify(status)}`);
    };

    _onError = error => {
        console.log(`ON ERROR : ${error}`);
    };

    _onStopPressed = () => {
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.stopAsync();
        }
    };

    _onSeekSliderValueChange = value => {
      if (!this.state.isSeeking) {
        this.isSeeking = true;
        this.state.playbackInstance.pauseAsync();
      }
    };

    _onSeekSliderSlidingComplete = async value => {
        this.isSeeking = false;
        const seekPosition = value * this.state.playbackInstanceDuration;
        this.state.playbackInstance.setPositionAsync(seekPosition);
    };

    _getSeekSliderPosition() {
        if (
            this.state.playbackInstance != null &&
            this.state.playbackInstancePosition != null &&
            this.state.playbackInstanceDuration != null
        ) {
            return this.state.playbackInstancePosition / this.state.playbackInstanceDuration;
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
                return '0' + string;
            }
            return string;
        };
        return padWithZero(minutes) + ':' + padWithZero(seconds);
    }

    _getTimestamp() {
      if (
        this.state.playbackInstance != null &&
        this.state.playbackInstancePosition != null &&
        this.state.playbackInstanceDuration != null
      ) {
        return `${this._getMMSSFromMillis(
          this.state.playbackInstancePosition
      )} / ${this._getMMSSFromMillis(this.state.playbackInstanceDuration)}`;
      }
      return this.state.playbackInstancePosition;
    }

    render() {
        return (
            <View style={styles.messageContainer}>
                <View style={styles.fromContainer}>
                    <Text>From: {this.props.creatorID}</Text>
                </View>
                <View style={[styles.playerContainer,{opacity: 1.0}]}>
                    {!this.state.isPlaying &&
                    <Ionicons
                        style={styles.playerButton}
                        name="ios-play"
                        size={BUTTON_HEIGHT}
                        onPress={() => {
                          if (!this.state.isPlaying) {
                              this.setState({isPlaying: true});
                              this.state.playbackInstance.playAsync();
                          }
                        }}
                    />}
                    {this.state.isPlaying &&
                    <Ionicons
                        style={styles.playerButton}
                        name="ios-pause"
                        size={BUTTON_HEIGHT}
                        onPress={() => {
                          this.setState({isPlaying: false});
                          this.state.playbackInstance.pauseAsync();
                        }}
                    />}
                    {this.state.isBuffering &&
                    <Text style={[styles.text, styles.buffering]}>
                        {BUFFERING_STRING}
                    </Text>}
                    {!this.state.isBuffering &&<Slider
                      style={styles.playerSlider}
                      value={this.state.playbackInstancePosition/this.state.playbackInstanceDuration}
                      onValueChange={this._onSeekSliderValueChange}
                      onSlidingComplete={this._onSeekSliderSlidingComplete}
                      disabled={this.state.isBuffering}
                    />}
                    <Text style={styles.playerTracking}>
                        {Math.floor(this.state.playbackInstancePosition)} / {this.state.playbackInstanceDuration}
                    </Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    messageContainer: {
      paddingTop: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      padding: 20
    },
    fromContainer: {
        // marginLeft: 10
    },
    playerContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: BUTTON_HEIGHT,
      maxHeight: BUTTON_HEIGHT,

    },
    playerButton: {
        minHeight: BUTTON_HEIGHT
    },
    playerSlider: {
      minWidth: DEVICE_WIDTH / 1.8,
      maxWidth: DEVICE_WIDTH / 1.8,
    },
    playerTracking: {
      minHeight: FONT_SIZE,
    }
});
