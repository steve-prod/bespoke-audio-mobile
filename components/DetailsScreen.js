import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class DetailsScreen extends Component {
    render() {
        return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Message Details!</Text>
                </View>
        );
    }
}
