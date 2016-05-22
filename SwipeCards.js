/* Gratefully copied from https://github.com/brentvatne/react-native-animated-demo-tinder */
'use strict';

import React, { StyleSheet, Text, View, Animated, Component, PanResponder, Image, TouchableOpacity, Dimensions} from 'react-native';
import clamp from 'clamp';

import Defaults from './Defaults.js';

var SWIPE_THRESHOLD = 120;

class SwipeCards extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY(),
      enter: new Animated.Value(0.5),
      card: this.props.cards[0],
    }
  }

  _goToNextCard() {
    let currentCardIdx = this.props.cards.indexOf(this.state.card);
    let newIdx = currentCardIdx + 1;

    // Checks to see if last card.
    // If props.loop=true, will start again from the first card.
    let card = newIdx > this.props.cards.length - 1
      ? this.props.loop ? this.props.cards[0] : null
      : this.props.cards[newIdx];

    this.setState({
      card: card
    });
  }

  _goToPreviousCard() {
    let currentCardIdx = this.props.cards.indexOf(this.state.card);
    let newIdx = currentCardIdx - 1;

    // Checks to see if first card.
    // If true, will start again from the first card.
    let card = newIdx < 0
      ? this.props.cards[0] : this.props.cards[newIdx];

    this.setState({
      card: card
    });
  }

  componentDidMount() {
    this._animateEntrance();
  }

  _animateEntrance() {
    Animated.spring(
      this.state.enter,
      { toValue: 1, friction: 8 }
    ).start();
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({x: 0, y: 0});
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y},
      ]),

      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset();
        var velocity;

        if (vx >= 0) {
          velocity = clamp(vx, 3, 5);
        } else if (vx < 0) {
          velocity = clamp(vx * -1, 3, 5) * -1;
        }

        if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {

          this.state.pan.x._value > 0
            ? this.props.handleYup(this.state.card)
            : this.props.handleNope(this.state.card)

          this.props.cardRemoved
            ? this.props.cardRemoved(this.props.cards.indexOf(this.state.card))
            : null

          Animated.decay(this.state.pan, {
            velocity: {x: velocity, y: vy},
            deceleration: 0.98
          }).start(this._resetState.bind(this))
        } else {
          Animated.spring(this.state.pan, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start()
        }
      }
    })
  }

  _resetState() {
    this.state.pan.setValue({x: 0, y: 0});
    this.state.enter.setValue(0);
    this._goToNextCard();
    this._animateEntrance();
  }

  _previousState() {
    this.state.pan.setValue({x: 0, y: 0});
    this.state.enter.setValue(0);
    this._goToPreviousCard();
    this._animateEntrance();
  }

  renderNoMoreCards() {
    if (this.props.renderNoMoreCards)
      return this.props.renderNoMoreCards();

    return (
      <Defaults.NoMoreCards />
    )
  }

  renderCard(cardData) {
    return this.props.renderCard(cardData)
  }

  _backButton() {
    this._previousState();
  }

  _yupButton() {
    this.props.handleRight(this.state.card);
    this.props.cardRemoved
      ? this.props.cardRemoved(this.props.cards.indexOf(this.state.card))
      : null;
    Animated.timing(this.state.pan, {
      toValue: {x: 1000, y: 0},
    }).start(this._resetState.bind(this));
  }

  _nopeButton() {
    this.props.handleLeft(this.state.card);
    this.props.cardRemoved
      ? this.props.cardRemoved(this.props.cards.indexOf(this.state.card))
      : null;
    Animated.timing(this.state.pan, {
      toValue: {x: -1000, y: 0},
    }).start(this._resetState.bind(this));
  }

  render() {
    let { pan, enter, } = this.state;

    let [translateX, translateY] = [pan.x, pan.y];

    let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ["-30deg", "0deg", "30deg"]});
    let opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5]});
    let scale = enter;

    let animatedCardstyles = {transform: [{translateX}, {translateY}, {rotate}, {scale}], opacity};

    let yupOpacity = pan.x.interpolate({inputRange: [0, 150], outputRange: [0, 1]});
    let yupScale = pan.x.interpolate({inputRange: [0, 150], outputRange: [0.5, 1], extrapolate: 'clamp'});
    let animatedYupStyles = {transform: [{scale: yupScale}], opacity: yupOpacity}

    let nopeOpacity = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0]});
    let nopeScale = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0.5], extrapolate: 'clamp'});
    let animatedNopeStyles = {transform: [{scale: nopeScale}], opacity: nopeOpacity}

    return (
      <View style={styles.container}>
      <View style={styles.buttonFooterContainer}>
        <TouchableOpacity onPress={this._backButton.bind(this)} style={styles.buttonFooter}><Text>Back</Text></TouchableOpacity>
        <TouchableOpacity onPress={this._nopeButton.bind(this)} style={styles.buttonFooter}><Text>Nope!</Text></TouchableOpacity>
        <TouchableOpacity onPress={this._yupButton.bind(this)} style={styles.buttonFooter}><Text>Yup!</Text></TouchableOpacity>
      </View>
        { this.state.card
            ? (
            <Animated.View style={[styles.card, animatedCardstyles]} {...this._panResponder.panHandlers}>
              {this.renderCard(this.state.card)}
            </Animated.View>
            )
            : this.renderNoMoreCards() }


        { this.props.renderNope
          ? this.props.renderNope(pan)
          : (
              this.props.showNope
              ? (
                <Animated.View style={[styles.nope, animatedNopeStyles]}>
                  <Text style={styles.nopeText}>Nope!</Text>
                </Animated.View>
                )
              : null
            )
        }

        { this.props.renderYup
          ? this.props.renderYup(pan)
          : (
              this.props.showYup
              ? (
                <Animated.View style={[styles.yup, animatedYupStyles]}>
                  <Text style={styles.yupText}>Yup!</Text>
                </Animated.View>
              )
              : null
            )
        }

      </View>
    );
  }
}

SwipeCards.propTypes = {
  cards: React.PropTypes.array,
  renderCard: React.PropTypes.func,
  loop: React.PropTypes.bool,
  renderNoMoreCards: React.PropTypes.func,
  showYup: React.PropTypes.bool,
  showNope: React.PropTypes.bool,
  handleYup: React.PropTypes.func,
  handleNope: React.PropTypes.func
};

SwipeCards.defaultProps = {
  loop: false,
  showYup: true,
  showNope: true
};

const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

var styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  yup: {
    alignItems: 'center',
    borderColor: 'green',
    borderWidth: 5,
    position: 'absolute',
    top: 4 * vh,
    left: 4 * vw,
    width: 60 * vmin,
    padding: 5 * vmin,
    borderRadius: 10,
  },
  yupText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'green',
    backgroundColor: 'transparent',
  },
  nope: {
    alignItems: 'center',
    borderColor: 'red',
    borderWidth: 5,
    position: 'absolute',
    top: 4 * vh,
    right: 4 * vw,
    width: 60 * vmin,
    padding: 5 * vmin,
    borderRadius: 10,
  },
  nopeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'red',
    backgroundColor: 'transparent',
  },
  buttonFooterContainer: {
    flexDirection: 'row',
    width: 90 * vw,
    height: 10 * vh,
    marginLeft: 5 * vmin,
    marginRight: 5 * vmin,
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0 * vh,
  },
  buttonFooter: {
    width: 10 * vh,
    borderWidth: 1 * vmin,
    borderRadius: 10 * vmin,
    borderColor: '#F2F2F2',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SwipeCards
