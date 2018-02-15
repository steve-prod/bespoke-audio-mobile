import React, { Component } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import PublicMessageList from './PublicMessageList.js';
import RCTNetworking from 'RCTNetworking';


const resetAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Login'})]
});

const BACKGROUND_COLOR = '#FFF8ED';

export default class BrowseScreen extends Component {
    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            headerLeft: null,
            headerRight: (
                <Button
                    onPress={() => {
                            try {
                                RCTNetworking.clearCookies(() => {navigation.dispatch(resetAction);})
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

    render() {
        return (
            <View style={styles.browseScreen}>
                <View style={styles.browseText}>
                    <Text>Browse</Text>
                </View>
                <PublicMessageList />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    browseScreen: {
        // top: 30,
        backgroundColor: BACKGROUND_COLOR,
        flex: 1,
    },
    browseText: {
        paddingVertical: 10,
        alignSelf: 'center',
    }
});
