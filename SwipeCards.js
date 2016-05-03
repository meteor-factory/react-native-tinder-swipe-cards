/* Gratefully copied from https://github.com/brentvatne/react-native-animated-demo-tinder */
'use strict';

import React, { StyleSheet, Text, View, Animated, Component, PanResponder, Image} from 'react-native';
import clamp from 'clamp';

import Defaults from './Defaults';
import styles from './styles';

var SWIPE_X_THRESHOLD = 150;
var SWIPE_Y_THRESHOLD = 150;

export default class SwipeCards extends Component {
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
        if (Math.abs(this.state.pan.y._value) > SWIPE_Y_THRESHOLD) {
          if (this.state.pan.y._value < 0) {
            this.props.handleUp(this.state.card)

            this.props.cardRemoved(this.props.cards.indexOf(this.state.card))

            Animated.decay(this.state.pan, {
              velocity: {x: vx, y: vy},
              deceleration: 0.975
            }).start(this._resetState.bind(this))
          }else {
            Animated.spring(this.state.pan, {
              toValue: {x: 0, y: 0},
              friction: 4
            }).start()
          }
        }else if (Math.abs(this.state.pan.x._value) > SWIPE_X_THRESHOLD) {

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

    let upOpacity = pan.y.interpolate({inputRange: [-150, -150], outputRange: [1, 0]});
    let upScale = pan.y.interpolate({inputRange: [-150, -150], outputRange: [1, 0.5], extrapolate: 'clamp'});
    let animatedUpStyles = {transform: [{scale: upScale}], opacity: upOpacity}

    return (
      <View style={styles.containerSwipeCards}>
        { this.state.card
          ? (
          <Animated.View style={[styles.card, animatedCardstyles]} {...this._panResponder.panHandlers}>
            {this.renderCard(this.state.card)}

            { this.props.renderNope
              ? this.props.renderNope(pan)
              : (
                  this.props.showNope
                  ? (
                    <Animated.View style={[styles.nope, animatedNopeStyles]}>
                      <Text style={styles.nopeText}>NOPE!</Text>
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
                      <Text style={styles.yupText}>LIKE!</Text>
                    </Animated.View>
                    )
                  : null
                )
            }

            { this.props.renderUp
              ? this.props.renderUp(pan)
              : (
                  this.props.showUp
                  ? (
                    <Animated.View style={[styles.up, animatedUpStyles]}>
                      <Text style={styles.upText}>LOVE IT!</Text>
                    </Animated.View>
                    )
                  : null
                )
            }

          </Animated.View>
          )
          : this.renderNoMoreCards()
        }
      </View>
    );
  }
}

SwipeCards.propTypes = {
  cards: React.PropTypes.array,
  renderCards: React.PropTypes.func,
  loop: React.PropTypes.bool,
  renderNoMoreCards: React.PropTypes.func,
  showYup: React.PropTypes.bool,
  showUp: React.PropTypes.bool,
  showNope: React.PropTypes.bool,
  handleYup: React.PropTypes.func,
  handleUp: React.PropTypes.func,
  handleNope: React.PropTypes.func
};

SwipeCards.defaultProps = {
  loop: false,
  showYup: true,
  showUp: true,
  showNope: true
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  yup: {
    borderColor: 'green',
    borderWidth: 2,
    position: 'absolute',
    padding: 20,
    bottom: 20,
    borderRadius: 5,
    right: 20,
  },
  yupText: {
    fontSize: 16,
    color: 'green',
  },
  nope: {
    borderColor: 'red',
    borderWidth: 2,
    position: 'absolute',
    bottom: 20,
    padding: 20,
    borderRadius: 5,
    left: 20,
  },
  nopeText: {
    fontSize: 16,
    color: 'red',
  }
});
