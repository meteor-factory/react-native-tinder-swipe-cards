/* Gratefully copied from https://github.com/brentvatne/react-native-animated-demo-tinder */
'use strict';

import React, {Component} from 'react';

import {
    StyleSheet,
    Text,
    View,
    Animated,
    PanResponder,
    Image
} from 'react-native';

import clamp from 'clamp';

import Defaults from './Defaults.js';

const SWIPE_THRESHOLD = 120;

export default class SwipeCards extends Component {

  static propTypes = {
    cards: React.PropTypes.array,
    renderCards: React.PropTypes.func,
    loop: React.PropTypes.bool,
    renderNoMoreCards: React.PropTypes.func,
    showYup: React.PropTypes.bool,
    showNope: React.PropTypes.bool,
    handleYup: React.PropTypes.func,
    handleNope: React.PropTypes.func,
    yupText: React.PropTypes.string,
    noText: React.PropTypes.string,
  };

  static defaultProps = {
    cards: [],
    loop: false,
    showYup: true,
    showNope: true,
    nopeText: "Nope!",
    yupText: "Yup!",
    handleNope: (card) => null,
    handleYup: (card) => null,
    cardRemoved: (card) => null,
    renderCard: (card) => null
  };

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

  componentWillReceiveProps(nextProps){
    if(nextProps.cards && nextProps.cards.length > 0){
      this.setState({
        card: nextProps.cards[0]
      })
    }
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
        let velocity;

        if (vx >= 0) {
          velocity = clamp(vx, 3, 5);
        } else if (vx < 0) {
          velocity = clamp(vx * -1, 3, 5) * -1;
        }

        if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {

          if (this.state.pan.x._value > 0) {
            this.props.handleYup(this.state.card);
          } else {
            this.props.handleNope(this.state.card);
          }

          this.props.cardRemoved(this.props.cards.indexOf(this.state.card));

          Animated.decay(this.state.pan, {
            velocity: {x: velocity, y: vy},
            deceleration: 0.98
          }).start(this._resetState.bind(this))
        } else {
          Animated.spring(this.state.pan, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start();
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
    if (this.props.renderNoMoreCards) {
      return this.props.renderNoMoreCards();
    }

    return <Defaults.NoMoreCards />;
  }

  renderCard() {
    if (this.state.card) {
      let {pan, enter as scale} = this.state;

      let [translateX, translateY] = [pan.x, pan.y];

      let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ["-30deg", "0deg", "30deg"]});
      let opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5]});

      let animatedCardStyles = {transform: [{translateX}, {translateY}, {rotate}, {scale}], opacity};

      return <Animated.View style={[styles.card, animatedCardStyles]} {... this._panResponder.panHandlers}>
        {this.props.renderCard(this.state.card)}
      </Animated.View>
    }

    return this.renderNoMoreCards();
  }

  renderNope() {
    let {pan} = this.state;

    let nopeOpacity = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0]});
    let nopeScale = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0.5], extrapolate: 'clamp'});
    let animatedNopeStyles = {transform: [{scale: nopeScale}], opacity: nopeOpacity};

    if (this.props.renderNope) {
      return this.props.renderNope(pan);
    }

    if (this.props.showNope) {
      return <Animated.View style={[styles.nope, animatedNopeStyles]}>
        <Text style={styles.nopeText}>{this.props.noText}</Text>
      </Animated.View>;
    }

    return null;
  }

  renderYup() {
    let {pan} = this.state;

    let yupOpacity = pan.x.interpolate({inputRange: [0, 150], outputRange: [0, 1]});
    let yupScale = pan.x.interpolate({inputRange: [0, 150], outputRange: [0.5, 1], extrapolate: 'clamp'});
    let animatedYupStyles = {transform: [{scale: yupScale}], opacity: yupOpacity};

    if (this.props.renderYup) {
      return this.props.renderYup(pan);
    }

    if (this.props.showYup) {
      return <Animated.View style={[styles.yup, animatedYupStyles]}>
        <Text style={styles.yupText}>{this.props.yupText}</Text>
      </Animated.View>;
    }

    return null;
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderCard()}
        {this.renderNope()}
        {this.renderYup()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
