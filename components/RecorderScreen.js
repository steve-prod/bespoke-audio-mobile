import React, { Component } from 'react';
import { AsyncStorage, Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import Recorder from './Recorder.js';
import RCTNetworking from 'RCTNetworking';

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Login'})]
});

const BACKGROUND_COLOR = '#FFF8ED';
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

export default class RecorderScreen extends Component {

    constructor(props) {
        super(props);
        this._reloadRecorder = this._reloadRecorder.bind(this);
    }

    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            headerLeft: null,
            headerRight: (
                <Button
                    onPress={() => {
                            try {
                                RCTNetworking.clearCookies(() => {navigation.dispatch(resetAction)})
                            } catch (e) {
                                // TODO: alert user
                                console.log(e);
                            }
                        }
                    }
                    type="button"
                    title="Logout"
                    color="#000"
                />
            ),
            headerTitle: "Bespoke-Audio"
        };
    };

    _reloadRecorder() {
        this.props.navigation.navigate('Recorder', {creatorID: ""});
    }

    render() {
        const { params } = this.props.navigation.state;
        const creatorID = params ? params.creatorID || "" : "";
        const isReplying = creatorID === "" ? false : true;

        return (
            <View style={styles.recorderScreen}>
                <View style={styles.recorderText}>
                    <Text>Recorder</Text>
                </View>
                <Recorder creatorID={creatorID} isReplying={isReplying} reloadRecorder={this._reloadRecorder}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    recorderScreen: {
        // top: 30,
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
    },
    recorderText: {
        paddingVertical: 10,
        alignSelf: 'center',
    }
});
