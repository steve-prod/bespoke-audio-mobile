import React, { Component } from 'react';
import {
    AsyncStorage,
    Button,
    Dimensions,
    FlatList,
    Slider,
    StyleSheet,
    Text,
    View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Asset, Audio, Font, Video } from 'expo';
import Ionicons from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: BACKGROUND_COLOR,
    },
    // nameContainer: {
    //   height: FONT_SIZE,
    //   marginTop: 10,
    //   marginBottom: 10
    // },
    playbackContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      alignSelf: 'stretch',
      minHeight: BUTTON_HEIGHT * 0.85,
      maxHeight: BUTTON_HEIGHT * 0.85,
      marginLeft: 10,
      marginRight: 10
    },
    playbackSlider: {
      alignSelf: 'stretch',
      minWidth: DEVICE_WIDTH / 1.0,
      maxWidth: DEVICE_WIDTH / 1.0,
      marginLeft: 10,
    },
    // timestampRow: {
    //   flex: 1,
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   justifyContent: 'space-between',
    //   alignSelf: 'stretch',
    //   minHeight: FONT_SIZE,
    // },
    // text: {
    //   fontSize: FONT_SIZE,
    //   minHeight: FONT_SIZE,
    // },
    // buffering: {
    //   textAlign: 'left',
    //   paddingLeft: 20,
    // },
    // timestamp: {
    //   textAlign: 'right',
    //   paddingRight: 20,
    // },
    // button: {
    //   backgroundColor: BACKGROUND_COLOR,
    // },
    // buttonsContainerBase: {
    //   flex: 1,
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   justifyContent: 'space-around',
    //   maxHeight: BUTTON_HEIGHT,
    //   marginTop: 10
    // },
});

class PlaylistItem {
  constructor(name, uri) {
    this.name = name;
    this.uri = uri;
  }
}

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Login'})]
});

const BUTTON_HEIGHT = 50;

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#FFF8ED';
const DISABLED_OPACITY = 0.5;
const FONT_SIZE = 14;
const LOADING_STRING = '... loading ...';
const BUFFERING_STRING = '...buffering...';

export default class InboxScreen extends Component {
    constructor(props) {
        super(props);
        this.index = 0;
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.playbackInstance = null;
        this.state = {
            activeMessage: null,
            isPlaying: false,
            messages: [],
            shouldPlay: false,
            shouldCorrectPitch: true,
            feedback: ""
        };
        this._onPlaybackStatusUpdate = this._onPlaybackStatusUpdate.bind(this);
    }

    componentDidMount() {
        this.load();
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        });
    }

    getMessages() {
        var that = this;
        var messagesXHR = new XMLHttpRequest();
        messagesXHR.addEventListener('load', (event) => {
            if (event.target.status === 200) {
                var messages = JSON.parse(event.target.responseText);
                messages.forEach(function(message, index) {
                    message.playbackInstanceName = LOADING_STRING;
                    message.playbackInstancePosition = null;
                    message.playbackInstanceDuration = null;
                    message.isPlaying = false;
                    message.isBuffering = false;
                    message.isLoading = true;
                    that.getAndSetMessageAudio(message);
                })
                this.setState({messages: messages});
            } else {
                // TODO: alert user login failed
                alert(event.target.status);
                alert(event.target.responseText);
            }
        });
        messagesXHR.addEventListener('error', function(event) {
            // TODO: alert user login failed
            alert(event.target.status)
        });
        messagesXHR.open('GET', 'https://bespoke-audio.com/messages');
        messagesXHR.setRequestHeader('Accept', 'application/json');
        messagesXHR.send();
    }

    load = async () => {
        try {
            const session = await AsyncStorage.getItem('session')
            if (session === null) {
                this.props.navigation.navigate('Login')
            }
            // Get messages or goto login
            this.getMessages();
        } catch (e) {
            try {
                async (session) => {
                    await AsyncStorage.setItem('session', "")
                    this.props.navigation.navigate('Login')
                }
            } catch (e) {
                // TODO: alert user
            }
        }
    }

    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            headerRight: (
                <Button
                    onPress={async () => {
                            try {
                                await AsyncStorage.setItem('session', "");
                                navigation.dispatch(resetAction);
                            } catch (e) {
                                // TODO: alert user
                                alert(JSON.stringify(e));
                            }
                        }
                    }
                    type="button"
                    title="Logout"
                    color="#000"
                />
            )
        };
    };

    async getAndSetMessageAudio(message) {
        const source = { uri: "https://bespoke-audio.com/audio/" + message.messageID + ".mp3" };
        const initialStatus = {
          shouldPlay: false,
          shouldCorrectPitch: this.state.shouldCorrectPitch,
          // // UNCOMMENT THIS TO TEST THE OLD androidImplementation:
          // androidImplementation: 'MediaPlayer',
        };

        const { sound, status } = await Audio.Sound.create(
            source,
            initialStatus,
            this._onPlaybackStatusUpdate
        );
        message.playbackInstance = sound;
    }

    _onPlaybackStatusUpdate = status => {
        if (status.didJustFinish) {
            this.setState({feedback: JSON.stringify(status)});
            var updatedMessages = this.state.messages.slice();
            updatedMessages[this.state.activeMessage].isPlaying = false;
            this.setState({
                activeMessage: null,
                isPlaying: false,
                messages: updatedMessages
            });
        }
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
      if (this.playbackInstance != null) {
        this.playbackInstance.stopAsync();
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
        this.playbackInstance != null &&
        this.state.playbackInstancePosition != null &&
        this.state.playbackInstanceDuration != null
      ) {
        return `${this._getMMSSFromMillis(
          this.state.playbackInstancePosition
        )} / ${this._getMMSSFromMillis(this.state.playbackInstanceDuration)}`;
      }
      return '';
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Inbox</Text>
                <FlatList
                    data={this.state.messages}
                    keyExtractor={ (message, index) => message.messageID}
                    renderItem={({item, index}) => (
                        <View style={styles.container}>
                          <View style={styles.nameContainer}>
                            <Text>From: {item.creatorID}</Text>
                            <Text>
                                {item.isPlaying ? "IS playing" : "is NOT playing"}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.playbackContainer,
                              {
                                opacity: item.isLoading ? DISABLED_OPACITY : 1.0,
                              },
                            ]}>
                            {!item.isPlaying &&
                            <Ionicons
                              name="ios-play"
                              underlayColor={BACKGROUND_COLOR}
                              size={BUTTON_HEIGHT}
                              onPress={() => {
                                  if (!this.state.isPlaying) {
                                      this.index = index;
                                      var updatedMessages = this.state.messages.slice();
                                      updatedMessages[index].isPlaying = true;
                                      this.setState({
                                          activeMessage: index,
                                          isPlaying: true,
                                          messages: updatedMessages
                                      });
                                      item.playbackInstance.playAsync();
                                  }
                              }}
                          />}
                            {item.isPlaying &&
                            <Ionicons
                              name="ios-pause"
                              underlayColor={BACKGROUND_COLOR}
                              size={BUTTON_HEIGHT}
                              onPress={() => {
                                  var updatedMessages = this.state.messages.slice();
                                  updatedMessages[index].isPlaying = false;
                                  this.setState({
                                      isPlaying: false,
                                      messages: updatedMessages
                                  });
                                  item.playbackInstance.pauseAsync();
                              }} />}
                            <Slider
                              style={styles.playbackSlider}
                              value={this._getSeekSliderPosition()}
                              onValueChange={this._onSeekSliderValueChange}
                              onSlidingComplete={this._onSeekSliderSlidingComplete}
                              disabled={item.isLoading}
                            />
                            <View style={styles.timestampRow}>
                              <Text style={[styles.text, styles.buffering]}>
                                {item.isBuffering ? BUFFERING_STRING : ''}
                              </Text>
                              <Text style={[styles.text, styles.timestamp]}>
                                {this._getTimestamp()}
                              </Text>
                            </View>
                          </View>
                        </View>
                    )}
                />
                <Text>{this.state.feedback}</Text>
                <Button
                    title="Go to Message Details"
                    onPress={() => this.props.navigation.navigate('Details')}
                />
            </View>
        );
    }
}
