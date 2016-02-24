'use strict';

import React, { StyleSheet, Text, View, Image, Component} from 'react-native';

class NoMoreCards extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View>
        <Text style={styles.noMoreCardsText}>No more cards</Text>
      </View>
    )
  }
}

export default {
  NoMoreCards: NoMoreCards
}

const styles = StyleSheet.create({
  noMoreCardsText: {
    fontSize: 22,
  }
})
