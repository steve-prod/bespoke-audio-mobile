import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import LoginScreen from './components/LoginScreen.js'
import SigninScreen from './components/SigninScreen.js'
import MainScreen from './components/MainScreen.js'

export default StackNavigator({
    Login: { screen: LoginScreen },
    Signin: { screen: SigninScreen },
    Main: { screen: MainScreen }
},{ initialRouteName: 'Login' })
