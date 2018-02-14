import React, { Component } from 'react';
import { AsyncStorage, Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import Recorder from './Recorder.js';

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

    _reloadRecorder() {
        this.props.navigation.navigate('Recorder', {creatorID: ""});
    }

    render() {
        const { params } = this.props.navigation.state;
        const creatorID = params.creatorID || "";
        const isReplying = creatorID === "" ? false : true;

        return (
            <View style={styles.recorderScreen}>
                <View style={styles.recorderText}>
                    <Text>Recorder</Text>
                    <Button
                        title="Logout"
                        onPress={ async () => {
                            await AsyncStorage.setItem('session', "");
                            this.props.navigation.navigate('Login');
                        }}
                    />
                </View>
                <Recorder creatorID={creatorID} isReplying={isReplying} reloadRecorder={this._reloadRecorder}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    recorderScreen: {
        top: 30,
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
    },
    recorderText: {
        paddingVertical: 10,
        alignSelf: 'center',
    }
});
