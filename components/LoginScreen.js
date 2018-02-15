import React, { Component } from 'react';
import { AsyncStorage, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { NavigationActions } from 'react-navigation';

const loginAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Main'})]
});

const signupAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Signup'})]
});

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        };
        this.navigation = null;
    }

    componentDidMount() {
        var that = this;
        var statusXHR = new XMLHttpRequest();
        statusXHR.addEventListener('load', function(event) {
            if (event.target.status === 200) {
                that.props.navigation.navigate("Main");
            } else {
                // do nothing
            }
        });
        statusXHR.addEventListener('error', function(event) {
            // do nothing
        });
        statusXHR.open('GET', 'https://bespoke-audio.com/status');
        statusXHR.send();
    }

    static navigationOptions = ({navigation, navigationOptions}) => {
        this.navigation = navigation;
        return {
            header: null,
            tabBarVisible: false
        };
    };

    render() {
        return (
            <View style={styles.login}>
                <Text>Please log in</Text>
                <TextInput
                    style={styles.loginInput}
                    placeholder="Email"
                    type="email"
                    onChangeText={(email) => this.setState({email: email})}
                />
                <TextInput
                    style={styles.loginInput}
                    placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={(password) => this.setState({password: password})}
                />
                <View style={styles.buttonsContainer}>
                    <Button
                        title="Login"
                        onPress={() => {
                            var that = this;
                            var formData = new FormData();
                            formData.append("email", that.state.email);
                            formData.append("password", that.state.password);
                            var loginXHR = new XMLHttpRequest();
                            loginXHR.addEventListener('load', function(event) {
                                if (event.target.status === 200) {
                                    navigation.dispatch(loginAction);
                                } else {
                                    // TODO: alert user login failed
                                    alert(event.target.responseText);
                                }
                            });
                            loginXHR.addEventListener('error', function(event) {
                                // TODO: alert user login failed
                                alert(event.target.status)
                            });
                            loginXHR.open('POST', 'https://bespoke-audio.com/login');
                            loginXHR.send(formData);
                        }}
                    />
                    <Button
                        title="Signup"
                        onPress={() => {
                            // TODO: navigate to signup
                            navigation.dispatch(signupAction);
                        }}
                    />
                </View>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    buttonsContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%'
    },
    login: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loginInput: {
        height: 40,
        width:300,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        fontSize: 20,
        marginTop: 10
    }
});
