import React, { Component } from 'react';
import { AsyncStorage, Button, Text, TextInput, View } from 'react-native';

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        };
    }

    componentDidMount() {
        var that = this;
        load = async () => {
            try {
                const session = await AsyncStorage.getItem('session')
                if (session != null) {
                    that.props.navigation.navigate('Main', {
                        response: session
                    });
                }
            } catch (e) {
                // TODO: alert the user
            }
        }
        load();
    }

    submitCredentials = async (session) => {
        try {
            await AsyncStorage.setItem('session', session);
            this.props.navigation.navigate('Main');
        } catch (e) {
            alert(JSON.stringify(e));
        }
    }

    static navigationOptions = {
        header: null,
        tabBarVisible: false
    };

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Please log in</Text>
                <TextInput
                    style={{height: 40, width:300, borderColor: 'gray', borderWidth: 1}}
                    placeholder="Email"
                    type="email"
                    onChangeText={(email) => this.setState({email: email})}
                />
                <TextInput
                    style={{height: 40, width:300, borderColor: 'gray', borderWidth: 1}}
                    placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={(password) => this.setState({password: password})}
                />
                <Button
                    title="Login"
                    onPress={() => {
                        var that = this;
                        var formData = new FormData();
                        formData.append("email", that.state.email);
                        formData.append("password", that.state.password);
                        var resetsXHR = new XMLHttpRequest();
                        resetsXHR.addEventListener('load', function(event) {
                            if (event.target.status === 200) {
                                const session = event.target.getResponseHeader("Set-Cookie").split(";")[0].slice(8);
                                that.submitCredentials(session);
                            } else {
                                // TODO: alert user login failed
                                alert(event.target.responseText);
                            }
                        });
                        resetsXHR.addEventListener('error', function(event) {
                            // TODO: alert user login failed
                            alert(event.target.status)
                        });
                        resetsXHR.open('POST', 'https://bespoke-audio.com/login');
                        resetsXHR.send(formData);
                    }}
                />
                <Button
                    title="Signup"
                    onPress={() => {
                        // TODO: navigate to signup

                    }}
                />
            </View>
        );
    };
}
