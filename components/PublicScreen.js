import React, { Component } from "react";
import {
    StyleSheet,
    Text
} from "react-native";

const BACKGROUND_COLOR = "#FFF8ED";

export default class PublicScreen extends Component {
    constructor(props) {
        super(props);

    }

    static navigationOptions = ({ navigation, navigationOptions }) => {
        return {
            tabBarOptions: {
                activeBackgroundColor: "#FFF8ED",
                inactiveBackgroundColor: "#FFF8ED"
            }
        };
    };

    render() {
        
        return (
            <Text>Public Screen</Text>
        );
    }
}
