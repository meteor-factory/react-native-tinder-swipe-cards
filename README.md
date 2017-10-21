# Swipe Cards for React Native

A [package](https://www.npmjs.com/package/react-native-swipe-cards) based on [@brentvatne](https://github.com/brentvatne/)'s awesome [example](https://github.com/brentvatne/react-native-animated-demo-tinder).


![React Native Swipe Cards](https://github.com/meteor-factory/react-native-tinder-swipe-cards/raw/master/screenshots/swiper-cards.gif
)

## Quick Start
1. `npm install --save react-native-swipe-cards`
2. Create a module e.g. `SwipeCards.js`
3. Import it `import SwipeCards from './SwipeCards.js'`
4. Render it `<SwipeCards style={{flex: 1}} />`

```javascript
// SwipeCards.js
'use strict';

import React, { Component } from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';

import SwipeCards from 'react-native-swipe-cards';

class Card extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={[styles.card, {backgroundColor: this.props.backgroundColor}]}>
        <Text>{this.props.text}</Text>
      </View>
    )
  }
}

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

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [
        {text: 'Tomato', backgroundColor: 'red'},
        {text: 'Aubergine', backgroundColor: 'purple'},
        {text: 'Courgette', backgroundColor: 'green'},
        {text: 'Blueberry', backgroundColor: 'blue'},
        {text: 'Umm...', backgroundColor: 'cyan'},
        {text: 'orange', backgroundColor: 'orange'},
      ]
    };
  }

  handleYup (card) {
    console.log(`Yup for ${card.text}`)
  }
  handleNope (card) {
    console.log(`Nope for ${card.text}`)
  }
  handleMaybe (card) {
    console.log(`Maybe for ${card.text}`)
  }
  render() {
    // If you want a stack of cards instead of one-per-one view, activate stack mode
    // stack={true}
    return (
      <SwipeCards
        cards={this.state.cards}
        renderCard={(cardData) => <Card {...cardData} />}
        renderNoMoreCards={() => <NoMoreCards />}

        handleYup={this.handleYup}
        handleNope={this.handleNope}
        handleMaybe={this.handleMaybe}
        hasMaybeAction
      />
    )
  }
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
  },
  noMoreCardsText: {
    fontSize: 22,
  }
})
```

### More complex example
```javascript
'use strict';

import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';

import SwipeCards from 'react-native-swipe-cards';

class Card extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.card}>
        <Image style={styles.thumbnail} source={{uri: this.props.image}} />
        <Text style={styles.text}>This is card {this.props.name}</Text>
      </View>
    )
  }
}

class NoMoreCards extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.noMoreCards}>
        <Text>No more cards</Text>
      </View>
    )
  }
}

const cards = [
  {name: '1', image: 'https://media.giphy.com/media/GfXFVHUzjlbOg/giphy.gif'},
  {name: '2', image: 'https://media.giphy.com/media/irTuv1L1T34TC/giphy.gif'},
  {name: '3', image: 'https://media.giphy.com/media/LkLL0HJerdXMI/giphy.gif'},
  {name: '4', image: 'https://media.giphy.com/media/fFBmUMzFL5zRS/giphy.gif'},
  {name: '5', image: 'https://media.giphy.com/media/oDLDbBgf0dkis/giphy.gif'},
  {name: '6', image: 'https://media.giphy.com/media/7r4g8V2UkBUcw/giphy.gif'},
  {name: '7', image: 'https://media.giphy.com/media/K6Q7ZCdLy8pCE/giphy.gif'},
  {name: '8', image: 'https://media.giphy.com/media/hEwST9KM0UGti/giphy.gif'},
  {name: '9', image: 'https://media.giphy.com/media/3oEduJbDtIuA2VrtS0/giphy.gif'},
]

const cards2 = [
  {name: '10', image: 'https://media.giphy.com/media/12b3E4U9aSndxC/giphy.gif'},
  {name: '11', image: 'https://media4.giphy.com/media/6csVEPEmHWhWg/200.gif'},
  {name: '12', image: 'https://media4.giphy.com/media/AA69fOAMCPa4o/200.gif'},
  {name: '13', image: 'https://media.giphy.com/media/OVHFny0I7njuU/giphy.gif'},
]

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: cards,
      outOfCards: false
    }
  }

  handleYup (card) {
    console.log("yup")
  }

  handleNope (card) {
    console.log("nope")
  }

  cardRemoved (index) {
    console.log(`The index is ${index}`);

    let CARD_REFRESH_LIMIT = 3

    if (this.state.cards.length - index <= CARD_REFRESH_LIMIT + 1) {
      console.log(`There are only ${this.state.cards.length - index - 1} cards left.`);

      if (!this.state.outOfCards) {
        console.log(`Adding ${cards2.length} more cards`)

        this.setState({
          cards: this.state.cards.concat(cards2),
          outOfCards: true
        })
      }

    }

  }

  render() {
    return (
      <SwipeCards
        cards={this.state.cards}
        loop={false}

        renderCard={(cardData) => <Card {...cardData} />}
        renderNoMoreCards={() => <NoMoreCards />}
        showYup={true}
        showNope={true}

        handleYup={this.handleYup}
        handleNope={this.handleNope}
        cardRemoved={this.cardRemoved.bind(this)}
      />
    )
  }
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 5,
    overflow: 'hidden',
    borderColor: 'grey',
    backgroundColor: 'white',
    borderWidth: 1,
    elevation: 1,
  },
  thumbnail: {
    width: 300,
    height: 300,
  },
  text: {
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 10
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
```

### Props
| Props name        | Type     | Description                                                 | Default      |
|-------------------|----------|-------------------------------------------------------------|--------------|
| cards*            | Array    | Data that will be provided as props for the cards           |              |
| renderCard*       | Function | Renders the card with the current data                      |              |
| loop              | Boolean  | If true, start again when run out of cards                  | `false`      |
| onLoop            | Function | Called when card list returns to the beginning              |              |
| renderNoMoreCards | Function | Renders what is shown after swiped last card                |              |
| showYup           | Boolean  | Shows the 'Yup' component                                   | `true`       |
| showNope          | Boolean  | Shows the 'Nope'                                            | `true`       |
| showMaybe         | Boolean  | Shows the 'Maybe'                                           | `true`       |
| hasMaybeAction    | Boolean  | Includes the possibility to swipe up and its components     | `false`      |
| renderYup         | Function | Renders Yup                                                 |              |
| renderNope        | Function | Renders Nope                                                |              |
| renderMaybe       | Function | Renders Maybe                                               |              |
| handleYup         | Function | Called when card is 'passed' with that card's data          |              |
| handleNope        | Function | Called when card is 'rejected' with that card's data        |              |
| containerStyle    | style    | Override default style                                      |              |
| yupStyle          | style    | Override default style                                      |              |
| yupTextStyle      | style    | Override default style                                      |              |
| nopeStyle         | style    | Override default style                                      |              |
| nopeTextStyle     | style    | Override default style                                      |              |
| maybeStyle        | style    | Override default style                                      |              |
| maybeTextStyle    | style    | Override default style                                      |              |
| yupView           | element  | React component to render on a Yes vote                     |              |
| yupText           | string   | Text to render on Yes vote                                  | `Yep`        |
| noView            | element  | React component to render on a No vote                      |              |
| noText            | string   | Text to render on No vote                                   | `Nope`       |
| maybeView         | element  | React component to render on a Maybe vote                   |              |
| maybeText         | string   | Text to render on Maybe vote                                | `Maybe`      |
| smoothTransition  | Boolean  | Disables a slow transition fading the current card out      | `false`      |
| cardKey           | String   | React key to be used to for each card                       |              |
| dragY             | Boolean  | Allows dragging cards vertically                            | `true`       |
| stack             | Boolean  | Enables the stack mode                                      | `false`      |
| stackOffsetX      | Number   | Horizontal offset between cards in stack                    | 25           |
| stackOffsetY      | Number   | Vertical offset between cards in stack                      | 0            |
| cardRemoved       | Function | A callback passing the card reference that just got removed |              |
| onClickHandler    | Function | A callback clicking the card                                 | alert('tap') |




*required

### Todo (PRs welcome!)
- [ ] Show next card underneath current card
- [ ] Shadow when card is being dragged
- [ ] Example with backend
- [ ] Example with polaroids
- [ ] Submit to repos
- [x] renderYup
- [x] renderNope
- [ ] Testing
- [ ] Add more args to `cardRemoved`?
- [ ] `class extends` all components
