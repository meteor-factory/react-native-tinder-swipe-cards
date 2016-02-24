# Tinder Cards for React Native
A package based on [@brentvatne](https://github.com/brentvatne/)'s awesome [example](https://github.com/brentvatne/react-native-animated-demo-tinder), based in turn on the Tinder swipe interface.

## Quick Start
1. `npm install --save react-native-swipe-cards`
2. Create a module e.g. `Tinder.js`
3. Import it `import Tinder from './Tinder.js'`
4. Render it `<Tinder />`

```javascript
// Tinder.js
'use strict';

import React, { StyleSheet, Text, View,Image} from 'react-native';

let SwipeCards = require('react-native-swipe-cards');

let Card = React.createClass({
  render() {
    return (
      <View style={[styles.card, {backgroundColor: this.props.backgroundColor}]}>
        <Text>{this.props.text}</Text>
      </View>
    )
  }
})

const Cards = [
  {text: 'Tomato', backgroundColor: 'red'},
  {text: 'Aubergine', backgroundColor: 'purple'},
  {text: 'Courgette', backgroundColor: 'green'},
  {text: 'Blueberry', backgroundColor: 'blue'},
  {text: 'Umm...', backgroundColor: 'cyan'},
  {text: 'orange', backgroundColor: 'orange'},
]

export default React.createClass({
  getInitialState() {
    return {
      cards: Cards
    }
  },
  handleYup (card) {
    console.log(`Yup for ${card.text}`)
  },
  handleNope (card) {
    console.log(`Nope for ${card.text}`)
  },
  render() {
    return (
      <SwipeCards
        cards={this.state.cards}

        renderCard={(cardData) => <Card {...cardData} />}
        renderNoMoreCards={() => <NoMoreCards />}

        handleYup={this.handleYup}
        handleNope={this.handleNope}
      />
    )
  }
})

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
  }
})

```

### More complex example
```javascript
'use strict';

import React, { StyleSheet, Text, View,Image} from 'react-native';

let SwipeCards = require('react-native-swipe-cards');

let Card = React.createClass({
  render() {
    return (
      <View style={[styles.card, {backgroundColor: this.props.backgroundColor}]}>
        <Text>{this.props.text}</Text>
      </View>
    )
  }
})

let NoMoreCards = React.createClass({
  render() {
    return (
      <View style={styles.noMoreCards}>
        <Text>No more cards</Text>
      </View>
    )
  }
})

const Cards = [
  {text: 'RED RED', backgroundColor: 'red'},
  {text: 'ppppppp', backgroundColor: 'purple'},
  {text: 'vegetarian', backgroundColor: 'green'},
  {text: 'sea', backgroundColor: 'blue'},
  {text: 'cyanara?', backgroundColor: 'cyan'},
  {text: 'orange', backgroundColor: 'orange'},
]

const Cards2 = [
  {text: 'lemon', backgroundColor: 'yellow'},
  {text: 'Moo Moo 5', backgroundColor: 'maroon'}
]

export default React.createClass({
  getInitialState() {
    return {
      cards: Cards,
      outOfCards: false
    }
  },
  handleYup (card) {
    console.log("yup")
  },
  handleNope (card) {
    console.log("nope")
  },
  cardRemoved (index) {
    console.log(`The index is ${index}`);

    let CARD_REFRESH_LIMIT = 3

    if (this.state.cards.length - index <= CARD_REFRESH_LIMIT + 1) {
      console.log(`There are only ${this.state.cards.length - index - 1} cards left.`);

      if (!this.state.outOfCards) {
        console.log(`Adding ${Cards2.length} more cards`)

        this.setState({
          cards: this.state.cards.concat(Cards2),
          outOfCards: true
        })
      }

    }

  },
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
        cardRemoved={this.cardRemoved}
      />
    )
  }
})

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
    backgroundColor: 'grey'
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
```

### Props
| Props name        | Type     | Description                                          | Default |
|-------------------|----------|------------------------------------------------------|---------|
| cards*            | Array    | Data that will be provided as props for the cards    |         |
| loop              | Boolean  | If true, start again when run out of cards           | `false` |
| renderCard*        | Function | Renders the card with the current data               |         |
| renderNoMoreCards | Function | Renders what is shown after swiped last card         |         |
| showYup           | Boolean  | Shows the 'Yup' component                            | `true`  |
| showNope          | Boolean  | Shows the 'Nope'                                     | `true`  |
| handleYup         | Function | Called when card is 'passed' with that card's data   |         |
| handleNope        | Function | Called when card is 'rejected' with that card's data |         |

`*` required 

### Todo
- [ ] Default props
- [ ] prop types
- [ ] renderYup
- [ ] renderNope
