'use strict'

import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Image,
  ListView,
  Navigator,
  TouchableOpacity,
} from 'react-native';

const PULLDOWN_DISTANCE = 40;
import SendBird from 'sendbird'
const ContactsList = require('react-native-contacts');
import NavButton from './navButton';
import NavMenu from './navMenu';

export default class Contacts extends Component {
  constructor() {
    super();
    sb = SendBird.getInstance();
    this.state = {
      dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      contactList: []
    };
  }

  navigate() {
    this.props.navigator.pop()
  }

  componentDidMount() {
    ContactsList.getAll((err, contacts) => {
      if(err && err.type === 'permissionDenied'){

      } else {
        console.log('before filter', contacts);

        const contactList = this.filterContacts(contacts);

        this.setState({
          contactList: contactList
        })
      }
    })
  }

  filterContacts(contacts) {
     fetch('https://temo-api.herokuapp.com/users/show', {
        method: 'post',
        headers: { 'Accept': 'application/json','Content-Type': 'application/json'},
        body: JSON.stringify({
        contacts: contacts,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson !== null) {
        this.setState({
          contactList: responseJson
        })
      }
    })
    .catch((error) => {
      throw new Error(error)
    })
  }

  handleContactChoice(rowData){
    const number = rowData['phoneNumbers'][0]['number']
    this.onContactPress(number)
  }


  render() {
    const dataSource = this.state.dataSource.cloneWithRows(this.state.contactList || [])
    return (
      <View style={styles.container}>
        <ListView
          enableEmptySections
          dataSource={dataSource}
          renderRow={(rowData, sectionID, rowID) => (
              <TouchableOpacity
                onPress={() => this.handleContactChoice(rowData)}
              >
                <Text style={{ fontSize: 50, borderWidth: 1 }}>{rowData.familyName}</Text>
              </TouchableOpacity>
          )}
        />
      </View>
   );
  }


    onContactPress(usertwo_phone){
      global.userTwo = usertwo_phone
      var _self = this
      sb.OpenChannel.createChannel("rand", "", "", [sb.currentUser.userId], function (channel, error) {
        _self.setState({channel: channel})
        console.log(channel)
        global.currentChannel = channel
        console.log("in here")
        console.log(channel.url)


          if (error) {
              console.log("error");
              return;
          }
          channel.enter(function(response, error){
            console.log("now here")
              if (error) {
                  console.log(error);
                  console.log("error2");
                  return;
              }
              fetch('https://temo-api.herokuapp.com/conversations', {
                method: 'post',
                headers: { 'Accept': 'application/json','Content-Type': 'application/json'},
                body: JSON.stringify({
                channel_url: channel,
                user_one: sb.currentUser.nickname,
                user_two: usertwo_phone,
              })
            })
            .then((response) => response.json())
            .then((responseJson) => {
              if (responseJson) {
                console.log("good");
                _self.props.navigator.push({name: 'chat', channel: channel.url});
              } else {
                console.error("bad");
              }

            })
          });
      });
    }
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  listView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
