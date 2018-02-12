import React, { Component } from 'react';
import {
  Button,
  Dimensions,
  Slider,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Expo, { Audio, FileSystem, Permissions } from 'expo';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BUTTON_HEIGHT = 50;
const FONT_SIZE = 14;

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#FFF8ED';
const LIVE_COLOR = '#FF0000';
const DISABLED_OPACITY = 0.5;

export default class Recorder extends Component {
  constructor(props) {
    super(props);
    this.recording = null;
    this.sound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      haveRecordingPermissions: false,
      isLoading: false,
      isPlaybackAllowed: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isRecording: false,
      shouldCorrectPitch: true,
      recipientEmail: "",
    };
    this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY));
    this._sendPrivateMessage = this._sendPrivateMessage.bind(this);
    // // UNCOMMENT THIS TO TEST maxFileSize:
    // this.recordingSettings.android['maxFileSize'] = 12000;
  }

  componentDidMount() {
    this._askForPermissions();
  }

  _askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
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
        isPlaybackAllowed: true,
      });
    } else {
      this.setState({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false,
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
        recordingDuration: status.durationMillis,
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true,
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
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false,
    });
  }

  async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true,
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
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
    const { sound, status } = await this.recording.createNewLoadedSound(
      {
        isLooping: false,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
        progressUpdateIntervalMillis: 10
      },
      this._updateScreenForSoundStatus
    );
    this.sound = sound;
    this.setState({
      isLoading: false,
    });
  }

  _onRecordPressed = () => {
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
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
        return '0' + string;
      }
      return string;
    };
    return padWithZero(minutes) + ':' + padWithZero(seconds);
  }

  _getPlaybackTimestamp() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return `${this._getMMSSFromMillis(this.state.soundPosition)} / ${this._getMMSSFromMillis(
        this.state.soundDuration
      )}`;
    }
    return '';
  }

  _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
    }
    return `${this._getMMSSFromMillis(0)}`;
  }

  _sendPrivateMessage() {
      var that = this;
      var formData = new FormData();
      formData.append("blob", {uri:that.recording.getURI(), name:"blob", type:"audio/x-caf"});
      formData.append("recipient", that.state.recipientEmail);
      formData.append("isPublic", false);
      console.log(formData);
      var resetsXHR = new XMLHttpRequest();
      resetsXHR.addEventListener('load', function(event) {
          if (event.target.status === 201) {
              // TODO: alert user upload was successful
          } else {
              // TODO: alert user login failed
              alert(event.target.responseText);
              alert("200 error: messageFromServer");
          }
      });
      resetsXHR.addEventListener('error', function(event) {
          // TODO: alert user login failed
          alert(event.target.status)
          alert("XHR Error: eventMessage")
      });
      resetsXHR.open('POST', 'https://bespoke-audio.com/messages');
      resetsXHR.send(formData);
  }

  render() {
    return !this.state.haveRecordingPermissions ? (
      <View style={styles.recorderContainer}>
        <Text style={[styles.noPermissionsText]}>
          You must enable audio recording permissions in order to use this app.
        </Text>
        <View />
      </View>
    ) : (
      <View style={styles.recorderContainer}>
        <View style={{opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0}}>
            <Text style={this.state.isRecording ? styles.recordingStatus : {opacity: 0.0}}>
                RECORDING
            </Text>
          <View style={styles.recordingPanel}>
            <Button
                title={this.state.isRecording ? "Stop\nRecording" : "Start\nRecording"}
                size={BUTTON_HEIGHT}
                onPress={this._onRecordPressed}
                disabled={this.state.isLoading}
                style={styles.recordButton}
            />
            <Text style={[styles.recordingTimestamp]}>
                {this.state.isRecording ? this._getRecordingTimestamp() : ""}
            </Text>
          </View>
          <Ionicons
              name="ios-mic"
              style={[styles.recordingIcon, { opacity: this.state.isRecording ? 1.0 : 0.5 }]}
              size={BUTTON_HEIGHT}
              color={this.state.isRecording ? LIVE_COLOR : '#000000'}
          />
        </View>
        <View
          style={{opacity: !this.state.isPlaybackAllowed || this.state.isLoading ? DISABLED_OPACITY : 1.0}}>
          <View style={styles.playbackContainer}>
              <Ionicons
                  name={this.state.isPlaying ? "ios-pause" : "ios-play"}
                  size={BUTTON_HEIGHT}
                  onPress={this._onPlayPausePressed}
                  disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              />
              <Slider
                  style={styles.playbackSlider}
                  value={this._getSeekSliderPosition()}
                  onValueChange={this._onSeekSliderValueChange}
                  onSlidingComplete={this._onSeekSliderSlidingComplete}
                  disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              />
              <Text style={styles.playbackTimestamp}>
                  {!this.state.isPlaybackAllowed ? "00:00" : this._getPlaybackTimestamp()}
              </Text>
          </View>
        </View>
        <View>
            <TextInput
                style={styles.recipientInput}
                placeholder="Recipient email here"
                onChangeText={(text) => this.setState({recipientEmail: text})}
            />
        </View>
        <View style={styles.sendButtonContainer}>
            <Button
                title={"Send Message"}
                size={BUTTON_HEIGHT}
                onPress={this._sendPrivateMessage}
                disabled={this.state.isLoading}
                style={styles.sendPrivateMessageButton}
            />
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
        marginTop: 30
    },
    recordButton: {

    },
    recorderContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingTop: 20,
        paddingHorizontal: 20,
        padding: 20,
        marginBottom: 50,
        overflow: 'visible'
    },
    recordingIcon: {
        alignSelf: 'center',
        transform: [{translateY: -50}]
    },
    recordingPanel: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'space-between'
    },
    recordingStatus: {
        alignSelf: 'center',
        color: LIVE_COLOR
    },
    recordingTimestamp: {
        alignSelf: 'center'
    },
    playerButton: {
        minHeight: BUTTON_HEIGHT
    },
    playbackContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: BUTTON_HEIGHT,
        maxHeight: BUTTON_HEIGHT,

    },
    playbackSlider: {
        minWidth: DEVICE_WIDTH / 1.8,
        maxWidth: DEVICE_WIDTH / 1.8,
    },
    playbackTimestamp: {
        textAlign: 'right',
        alignSelf: 'center',
        minHeight: FONT_SIZE,
    },
    sendButtonContainer: {
        marginTop: 30
    },
    sendPrivateMessageButton: {

    }
});
