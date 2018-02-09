import React, { Component } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import PrivateMessage from './PrivateMessage.js';

const BACKGROUND_COLOR = '#FFF8ED';

export default class PrivateMessageList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };
    }

    componentDidMount() {
        this.getMessages();
    }

    getMessages() {
        var that = this;
        var messagesXHR = new XMLHttpRequest();
        messagesXHR.addEventListener('load', (event) => {
            if (event.target.status === 200) {
                this.setState({messages: JSON.parse(event.target.responseText)});
            } else {
                // TODO: alert user login failed
                alert(event.target.status);
                alert(event.target.responseText);
            }
        });
        messagesXHR.addEventListener('error', function(event) {
            // TODO: alert user login failed
            alert(event.target.status)
        });
        messagesXHR.open('GET', 'https://bespoke-audio.com/messages');
        messagesXHR.setRequestHeader('Accept', 'application/json');
        messagesXHR.send();
    }

    render() {
        return (
            <FlatList
                style={styles.privateMessageList}
                data={this.state.messages}
                keyExtractor={ (item, index) => item.messageID}
                renderItem={({item}) => (
                    <PrivateMessage messageID={item.messageID} creatorID={item.creatorID} />
                )}
            />
        )
    }
}

const styles = StyleSheet.create({
    privateMessageList: {
        borderTopWidth: 1
    }
});
