import React, { Component } from 'react';
import { Button, Text, View } from 'react-native';

export default class SigninScreen extends Component {
    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Signin View</Text>
                <Button
                    title="Go to LoginScreen"
                    onPress={() => this.props.navigation.navigate('Login')}
                />
                <Button
                    title="Go to MainScreen"
                    onPress={() => this.props.navigation.navigate('Main')}
                />
            </View>
        );
    };
}
