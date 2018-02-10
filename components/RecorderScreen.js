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

    render() {
        return (
            <View style={styles.recorderScreen}>
                <View style={styles.recorderText}>
                    <Text>Recorder</Text>
                </View>
                <Recorder />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    recorderScreen: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
    },
    recorderText: {
        paddingVertical: 10,
        alignSelf: 'center',
    }
});
