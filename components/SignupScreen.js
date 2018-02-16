import React, { Component } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { NavigationActions } from "react-navigation";

const loginAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: "Main" })]
});

export default class SignupScreen extends Component {
    constructor(props) {
        super(props);
        this.state = { isSent: false };
    }
    static navigationOptions = ({ navigation, navigationOptions }) => {
        this.navigation = navigation;
        return {
            header: null,
            tabBarVisible: false
        };
    };

    render() {
        return (
            <View style={styles.signupContainer}>
                {this.state.isSent && (
                    <View style={styles.signupConfirmationScreen}>
                        <Text>
                            A confirmation email has been sent to the email
                            address you provided. Please click the activation
                            link contained in the email.
                        </Text>
                        <Button
                            title="Then login."
                            onPress={() =>
                                this.props.navigation.navigate("Login")
                            }
                        />
                    </View>
                )}
                {!this.state.isSent && (
                    <View style={styles.signup}>
                        <TextInput
                            style={styles.signupInput}
                            placeholder="First Name"
                            type="text"
                            onChangeText={firstName =>
                                this.setState({ firstName: firstName })
                            }
                        />
                        <TextInput
                            style={styles.signupInput}
                            placeholder="Last Name"
                            type="text"
                            onChangeText={lastName =>
                                this.setState({ lastName: lastName })
                            }
                        />
                        <TextInput
                            style={styles.signupInput}
                            placeholder="Email Address"
                            type="email"
                            onChangeText={email =>
                                this.setState({ email: email })
                            }
                        />
                        <TextInput
                            style={styles.signupInput}
                            placeholder="Password"
                            secureTextEntry={true}
                            onChangeText={password =>
                                this.setState({ password: password })
                            }
                        />
                        <View style={styles.buttonsContainer}>
                            <Button
                                title="Signup Now"
                                onPress={() => {
                                    var that = this;
                                    var formData = new FormData();
                                    formData.append(
                                        "first-name",
                                        this.state.firstName
                                    );
                                    formData.append(
                                        "last-name",
                                        this.state.lastName
                                    );
                                    formData.append("email", this.state.email);
                                    formData.append(
                                        "password",
                                        this.state.password
                                    );
                                    var signupXHR = new XMLHttpRequest();
                                    signupXHR.addEventListener("load", (event) => {
                                        if (event.target.status === 201) {
                                            that.setState({ isSent: true });
                                        } else {
                                            // TODO: alert user sign up failed
                                            console.log(event);
                                        }
                                    });
                                    signupXHR.addEventListener("error", (event) => {
                                            // TODO: alert user sign up failed
                                            console.log(event);
                                        }
                                    );
                                    signupXHR.open(
                                        "POST",
                                        "https://bespoke-audio.com/signups"
                                    );
                                    signupXHR.send(formData);
                                }}
                            />
                            <Button
                                title="Go to login"
                                onPress={() =>
                                    this.props.navigation.navigate("Login")
                                }
                            />
                        </View>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonsContainer: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%"
    },
    signup: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    signupContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    signupInput: {
        height: 40,
        width: 300,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        fontSize: 20,
        marginTop: 10
    }
});
