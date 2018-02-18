import React, { Component } from "react";
import { Button, Modal, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { NavigationActions } from "react-navigation";
import { CheckBox } from 'react-native-elements';
import Ionicons from "react-native-vector-icons/Ionicons";

const BUTTON_HEIGHT = 50;

const loginAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: "Main" })]
});

export default class SignupScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            isSent: false,
            isAgree: false,
            isModalVisible: false
        };
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
                <Modal
                    visible={this.state.isModalVisible}
                    animationType={'slide'}
                >
                    <ScrollView style={styles.eula}>
                        <Text style={styles.eulaHeader}>Terms and conditions</Text>
                        <Text>There is no tolerance for objectionable content or abusive users on the Bespoke-Audio platform.
                        Content that is offensive, insensitive, upsetting, intended to disgust, or in exceptionally poor taste
                        is prohibited. Examples of such content include:</Text>
                        <Text></Text>
                        <Text>1. Defamatory, discriminatory, or mean-spirited content, including references or commentary about religion,
                        race, sexual orientation, gender, national/ethnic origin, or other targeted groups, particularly if the
                        content is likely to humiliate, intimidate, or place a targeted individual or group in harm’s way. Professional
                        political satirists and humorists are generally exempt from this requirement.</Text>
                        <Text></Text>
                        <Text>2. Realistic portrayals of people or animals being killed, maimed, tortured, or abused, or content that
                        encourages violence.</Text>
                        <Text></Text>
                        <Text>3. Depictions that encourage illegal or reckless use of weapons and dangerous objects, or facilitate the
                        purchase of firearms.</Text>
                        <Text></Text>
                        <Text>4. Overtly sexual or pornographic material, defined by Webster's Dictionary as "explicit descriptions or
                        displays of sexual organs or activities intended to stimulate erotic rather than aesthetic or emotional
                        feelings."</Text>
                        <Text></Text>
                        <Text>5. Inflammatory religious commentary or inaccurate or misleading quotations of religious texts.</Text>
                        <Text></Text>
                        <Text>Intellectual property infringment and anonymous bullying are prohibited.</Text>
                        <Text></Text>
                        <Text>Content that is pornographic, objectifies real people (e.g. “hot-or-not” voting), makes physical threats,
                        or bullies is prohibited.</Text>
                        <Text></Text>
                        <Text>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
                        LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
                         IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
                         WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
                         SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</Text>
                        <Button
                            onPress={() => this.setState({isModalVisible: false})}
                            title="Back to Signup Screen"
                        />
                    </ScrollView>
                </Modal>
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
                        <View style={styles.complianceContainer}>
                            <Ionicons
                                name={this.state.isAgree ? "ios-checkbox-outline" : "ios-square-outline"}
                                size={BUTTON_HEIGHT}
                                color={"#000000"}
                                onPress={() => {this.setState({isAgree: !this.state.isAgree})}}
                            />
                            <View style={styles.complianceTextAndButtonContainer}>
                                <Text style={styles.complianceText}>I agree to comply with the </Text>
                                <Button title="terms and conditions" onPress={() => this.setState({isModalVisible: true})} />
                            </View>
                        </View>
                        <View style={styles.buttonsContainer}>
                            <Button
                                title="Signup Now"
                                onPress={() => {
                                    var that = this;
                                    var formData = new FormData();
                                    formData.append("first-name",this.state.firstName);
                                    formData.append("last-name",this.state.lastName);
                                    formData.append("email", this.state.email);
                                    formData.append("password",this.state.password);
                                    formData.append("agrees-to-comply", this.state.isAgree);
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
                                disabled={!this.state.isAgree || this.state.firstName === "" ||
                                this.state.lastName === "" || this.state.email.indexOf("@") === -1
                                || this.state.password === ""}
                            />
                            <Button
                                title="Go back to login"
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
    complianceContainer: {
        marginTop: 20,
        flexDirection: 'row',
    },
    complianceText: {
        marginLeft: 8
    },
    complianceTextAndButtonContainer: {
        marginLeft: 20,
        flexDirection: 'column'
    },
    eula: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 10,
        marginVertical: 50,
    },
    eulaHeader: {
        alignSelf: 'center'
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
