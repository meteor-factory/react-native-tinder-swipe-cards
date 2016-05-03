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
            ? this.props.handleRight(this.state.card)
            : this.props.handleLeft(this.state.card)

          this.props.cardRemoved
            ? this.props.cardRemoved(this.props.cards.indexOf(this.state.card))
            : null

          Animated.decay(this.state.pan, {
            velocity: {x: vx, y: vy},
            deceleration: 0.975
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
    return this.props.renderNoMoreCards();
  }

  renderCard(cardData) {
    return this.props.renderCard(cardData)
  }

  render() {
    let { pan, enter, } = this.state;

    let [translateX, translateY] = [pan.x, pan.y];

    let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ["15deg", "0deg", "-15deg"]});
    let opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [1, 1, 1]});
    let scale = enter;

    let animatedCardstyles = {transform: [{translateX}, {translateY}, {rotate}, {scale}], opacity};

    let rightOpacity = pan.x.interpolate({inputRange: [50, 75], outputRange: [0, 1]});
    let rightScale = pan.x.interpolate({inputRange: [50, 150], outputRange: [0.5, 1], extrapolate: 'clamp'});
    let animatedRightStyles = {transform: [{scale: rightScale}], opacity: rightOpacity}

    let upOpacity = pan.y.interpolate({inputRange: [-150, -150], outputRange: [1, 0]});
    let upScale = pan.y.interpolate({inputRange: [-150, -150], outputRange: [1, 0.5], extrapolate: 'clamp'});
    let animatedUpStyles = {transform: [{scale: upScale}], opacity: upOpacity}

    let leftOpacity = pan.x.interpolate({inputRange: [-75, -50], outputRange: [1, 0]});
    let leftScale = pan.x.interpolate({inputRange: [-150, -50], outputRange: [1, 0.5], extrapolate: 'clamp'});
    let animatedLeftStyles = {transform: [{scale: leftScale}], opacity: leftOpacity}

    return (
      <View style={styles.containerSwipeCards}>
        { this.state.card
          ? (
          <Animated.View style={[styles.card, animatedCardstyles]} {...this._panResponder.panHandlers}>
            {this.renderCard(this.state.card)}

            { this.props.renderRight
              ? this.props.renderRight(pan)
              : (
                  this.props.showRight
                  ? (
                    <Animated.View style={[styles.right, animatedRightStyles]}>
                      <Text style={styles.rightText}>LIKE!</Text>
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

            { this.props.renderLeft
              ? this.props.renderLeft(pan)
              : (
                  this.props.showLeft
                  ? (
                    <Animated.View style={[styles.left, animatedLeftStyles]}>
                      <Text style={styles.leftText}>NOPE!</Text>
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
  showRight: React.PropTypes.bool,
  showUp: React.PropTypes.bool,
  showLeft: React.PropTypes.bool,
  handleRight: React.PropTypes.func,
  handleUp: React.PropTypes.func,
  handleLeft: React.PropTypes.func
};

SwipeCards.defaultProps = {
  loop: false,
  showRight: true,
  showUp: true,
  showLeft: true
};
