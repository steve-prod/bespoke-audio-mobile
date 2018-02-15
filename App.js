import React, { Component } from "react";
import { StackNavigator } from "react-navigation";
import LoginScreen from "./components/LoginScreen.js";
import SignupScreen from "./components/SignupScreen.js";
import MainScreen from "./components/MainScreen.js";

export default StackNavigator(
    {
        Login: { screen: LoginScreen },
        Signup: { screen: SignupScreen },
        Main: { screen: MainScreen }
    },
    { initialRouteName: "Login" }
);
