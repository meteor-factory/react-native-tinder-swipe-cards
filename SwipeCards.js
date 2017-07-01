/* Gratefully copied from https://github.com/brentvatne/react-native-animated-demo-tinder */


import React, { Component } from "react";

import {
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
} from "react-native";

import clamp from "clamp";

import Defaults from "./Defaults";

const SWIPE_THRESHOLD = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  yup: {
    borderColor: "red",
    borderWidth: 1,
    position: "absolute",
    padding: 10,
    bottom: 20,
    borderRadius: 2,
    right: 0,
  },
  yupText: {
    fontSize: 12,
    color: "red",
  },
  maybe: {
    borderColor: "blue",
    borderWidth: 1,
    position: "absolute",
    padding: 10,
    bottom: 20,
    borderRadius: 2,
    right: 20,
  },
  maybeText: {
    fontSize: 12,
    color: "blue",
  },
  nope: {
    borderColor: "green",
    borderWidth: 1,
    position: "absolute",
    bottom: 20,
    padding: 10,
    borderRadius: 2,
    left: 0,
  },
  nopeText: {
    fontSize: 12,
    color: "green",
  }
});

// Components could be unloaded and loaded and we will loose the users currentIndex, we can persist it here.
const currentIndex = {};
let guid = 0;

export default class SwipeCards extends Component {

  static propTypes = {
    cards: React.PropTypes.array,
    cardKey: React.PropTypes.string,
    hasMaybeAction: React.PropTypes.bool,
    loop: React.PropTypes.bool,
    onLoop: React.PropTypes.func,
    allowGestureTermination: React.PropTypes.bool,
    stack: React.PropTypes.bool,
    stackDepth: React.PropTypes.number,
    stackOffsetX: React.PropTypes.number,
    stackOffsetY: React.PropTypes.number,
    renderNoMoreCards: React.PropTypes.func,
    showYup: React.PropTypes.bool,
    showMaybe: React.PropTypes.bool,
    showNope: React.PropTypes.bool,
    handleYup: React.PropTypes.func,
    handleMaybe: React.PropTypes.func,
    handleNope: React.PropTypes.func,
    yupText: React.PropTypes.string,
    yupView: React.PropTypes.element,
    maybeText: React.PropTypes.string,
    maybeView: React.PropTypes.element,
    noText: React.PropTypes.string,
    noView: React.PropTypes.element,
    onClickHandler: React.PropTypes.func,
    renderCard: React.PropTypes.func,
    cardRemoved: React.PropTypes.func,
    dragY: React.PropTypes.bool,
    smoothTransition: React.PropTypes.bool
  };

  static defaultProps = {
    cards: [],
    cardKey: "key",
    hasMaybeAction: false,
    loop: false,
    onLoop: () => null,
    allowGestureTermination: true,
    stack: false,
    stackDepth: 5,
    stackOffsetX: 25,
    stackOffsetY: 0,
    showYup: true,
    showMaybe: true,
    showNope: true,
    handleYup: card => null,
    handleMaybe: card => null,
    handleNope: card => null,
    nopeText: "Nope!",
    maybeText: "Maybe!",
    yupText: "Yup!",
    onClickHandler: () => {},
    onDragStart: () => {},
    onDragRelease: () => {},
    cardRemoved: ix => null,
    renderCard: card => null,
    style: styles.container,
    dragY: true,
    smoothTransition: false
  };

  constructor(props) {
    super(props);

    // Use a persistent variable to track currentIndex instead of a local one.
    this.guid = this.props.guid || guid++;
    if (!currentIndex[this.guid]) currentIndex[this.guid] = 0;

    this.state = {
      pan: new Animated.ValueXY(0),
      enter: new Animated.Value(0.5),
      cards: [].concat(this.props.cards),
      card: this.props.cards[currentIndex[this.guid]],
    };

    this.lastX = 0;
    this.lastY = 0;

    this.cardAnimation = null;

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: (e, gestureState) => {
        this.props.onDragStart();
        this.lastX = gestureState.moveX;
        this.lastY = gestureState.moveY;
        return false;
      },
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        if (Math.abs(gestureState.dx) < Math.abs(gestureState.dy)) return false;
        if ((gestureState.dx === 0) && (gestureState.dy === 0)) return false;
        return (Math.abs(this.lastX - gestureState.moveX) > 5 || Math.abs(this.lastY - gestureState.moveY) > 5);
      },

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({ x: this.state.pan.x._value, y: this.state.pan.y._value });
        this.state.pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderTerminationRequest: (evt, gestureState) => this.props.allowGestureTermination,

      onPanResponderMove: Animated.event([
        null, { dx: this.state.pan.x, dy: this.props.dragY ? this.state.pan.y : 0 },
      ]),

      onPanResponderRelease: (e, { vx, vy, dx, dy }) => {
        this.props.onDragRelease();
        this.state.pan.flattenOffset();
        let velocity;
        if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5)   // meaning the gesture did not cover any distance
        {
          this.props.onClickHandler(this.state.card);
        }

        if (vx > 0) {
          velocity = clamp(vx, 3, 5);
        } else if (vx < 0) {
          velocity = clamp(vx * -1, 3, 5) * -1;
        } else {
          velocity = dx < 0 ? -3 : 3;
        }

        const hasSwipedHorizontally = Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD;
        const hasSwipedVertically = Math.abs(this.state.pan.y._value) > SWIPE_THRESHOLD;
        if (hasSwipedHorizontally || (hasSwipedVertically && this.props.hasMaybeAction)) {
          let cancelled = false;

          const hasMovedRight = hasSwipedHorizontally && this.state.pan.x._value > 0;
          const hasMovedLeft = hasSwipedHorizontally && this.state.pan.x._value < 0;
          const hasMovedUp = hasSwipedVertically && this.state.pan.y._value < 0;

          if (hasMovedRight) {
            cancelled = this.props.handleYup(this.state.card);
          } else if (hasMovedLeft) {
            cancelled = this.props.handleNope(this.state.card);
          } else if (hasMovedUp && this.props.hasMaybeAction) {
            cancelled = this.props.handleMaybe(this.state.card);
          } else {
            cancelled = true;
          }

          // Yup or nope was cancelled, return the card to normal.
          if (cancelled) {
            this._resetPan();
            return;
          }

          this.props.cardRemoved(currentIndex[this.guid]);

          if (this.props.smoothTransition) {
            this._advanceState(hasMovedRight, hasMovedLeft, hasMovedUp);
          } else {
            this.cardAnimation = Animated.decay(this.state.pan, {
              velocity: { x: velocity, y: vy },
              deceleration: 0.98
            });
            this.cardAnimation.start((status) => {
              if (status.finished) this._advanceState(hasMovedRight, hasMovedLeft, hasMovedUp);
              else this._resetState();

              this.cardAnimation = null;
            }
            );
          }
        } else {
          this._resetPan();
        }
      }
    });
  }

  _forceLeftSwipe() {
    this.cardAnimation = Animated.timing(this.state.pan, {
      toValue: { x: -500, y: 0 },
    }).start((status) => {
      if (status.finished) this._advanceState(false, true, false);
      else this._resetState();

      this.cardAnimation = null;
    }
      );
    this.props.cardRemoved(currentIndex[this.guid]);
  }

  _forceUpSwipe() {
    this.cardAnimation = Animated.timing(this.state.pan, {
      toValue: { x: 0, y: 500 },
    }).start((status) => {
      if (status.finished) this._advanceState(false, false, true);
      else this._resetState();

      this.cardAnimation = null;
    }
      );
    this.props.cardRemoved(currentIndex[this.guid]);
  }

  _forceRightSwipe() {
    this.cardAnimation = Animated.timing(this.state.pan, {
      toValue: { x: 500, y: 0 },
    }).start((status) => {
      if (status.finished) this._advanceState(true, false, false);
      else this._resetState();

      this.cardAnimation = null;
    }
      );
    this.props.cardRemoved(currentIndex[this.guid]);
  }

  _goToNextCard() {
    currentIndex[this.guid]++;

    // Checks to see if last card.
    // If props.loop=true, will start again from the first card.
    if (currentIndex[this.guid] > this.state.cards.length - 1 && this.props.loop) {
      this.props.onLoop();
      currentIndex[this.guid] = 0;
    }

    this.setState({
      card: this.state.cards[currentIndex[this.guid]]
    });
  }

  _goToPrevCard() {
    this.state.pan.setValue({ x: 0, y: 0 });
    this.state.enter.setValue(0);
    this._animateEntrance();

    currentIndex[this.guid]--;

    if (currentIndex[this.guid] < 0) {
      currentIndex[this.guid] = 0;
    }

    this.setState({
      card: this.state.cards[currentIndex[this.guid]]
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.cards !== this.props.cards) {
      if (this.cardAnimation) {
        this.cardAnimation.stop();
        this.cardAnimation = null;
      }

      currentIndex[this.guid] = 0;
      this.setState({
        cards: [].concat(nextProps.cards),
        card: nextProps.cards[0]
      });
    }
  }

  _resetPan() {
    Animated.spring(this.state.pan, {
      toValue: { x: 0, y: 0 },
      friction: 4
    }).start();
  }

  _resetState() {
    this.state.pan.setValue({ x: 0, y: 0 });
    this.state.enter.setValue(0);
    this._animateEntrance();
  }

  _advanceState(right = false, left = false, up = false) {
    console.log("advancd state");
    this.state.pan.setValue({ x: 0, y: 0 });
    this.state.enter.setValue(0);
    this._animateEntrance();
    if (right) {
      this._goToPrevCard();
    } else {
      this._goToNextCard();
    }
  }

  /**
   * Returns current card object
   */
  getCurrentCard() {
    return this.state.cards[currentIndex[this.guid]];
  }

  renderNoMoreCards() {
    if (this.props.renderNoMoreCards) {
      return this.props.renderNoMoreCards();
    }

    return <Defaults.NoMoreCards />;
  }

  /**
   * Renders the cards as a stack with props.stackDepth cards deep.
   */
  renderStack() {
    if (!this.state.card) {
      return this.renderNoMoreCards();
    }

    // Get the next stack of cards to render.
    const cards = this.state.cards.slice(currentIndex[this.guid], currentIndex[this.guid] + this.props.stackDepth).reverse();

    return cards.map((card, i) => {
      const offsetX = this.props.stackOffsetX * cards.length - i * this.props.stackOffsetX;
      const lastOffsetX = offsetX + this.props.stackOffsetX;

      const offsetY = this.props.stackOffsetY * cards.length - i * this.props.stackOffsetY;
      const lastOffsetY = offsetY + this.props.stackOffsetY;

      const opacity = 0.25 + (0.75 / cards.length) * (i + 1);
      const lastOpacity = 0.25 + (0.75 / cards.length) * i;

      const scale = 0.85 + (0.15 / cards.length) * (i + 1);
      const lastScale = 0.85 + (0.15 / cards.length) * i;

      const style = {
        position: "absolute",
        top: this.state.enter.interpolate({ inputRange: [0, 1], outputRange: [lastOffsetY, offsetY] }),
        left: this.state.enter.interpolate({ inputRange: [0, 1], outputRange: [lastOffsetX, offsetX] }),
        opacity: this.props.smoothTransition ? 1 : this.state.enter.interpolate({ inputRange: [0, 1], outputRange: [lastOpacity, opacity] }),
        transform: [{ scale: this.state.enter.interpolate({ inputRange: [0, 1], outputRange: [lastScale, scale] }) }],
        elevation: i * 10
      };

      // Is this the top card?  If so animate it and hook up the pan handlers.
      if (i + 1 === cards.length) {
        const { pan } = this.state;
        const [translateX, translateY] = [pan.x, pan.y];

        const rotate = pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ["-30deg", "0deg", "30deg"] });
        const opacity = this.props.smoothTransition ? 1 : pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5] });

        const animatedCardStyles = {
          ...style,
          transform: [
            { translateX },
            { translateY },
            { rotate },
            { scale: this.state.enter.interpolate({ inputRange: [0, 1], outputRange: [lastScale, scale] }) }
          ]
        };

        return (<Animated.View key={card[this.props.cardKey]} style={[styles.card, animatedCardStyles]} {... this._panResponder.panHandlers}>
          {this.props.renderCard(this.state.card)}
        </Animated.View>);
      }

      return <Animated.View key={card[this.props.cardKey]} style={style}>{this.props.renderCard(card)}</Animated.View>;
    });
  }

  renderCard() {
    if (!this.state.card) {
      return this.renderNoMoreCards();
    }

    const { pan, enter } = this.state;
    const [translateX, translateY] = [pan.x, pan.y];

    const rotate = pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ["-30deg", "0deg", "30deg"] });
    const opacity = pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5] });

    const scale = enter;

    const animatedCardStyles = { transform: [{ translateX }, { translateY }, { rotate }, { scale }], opacity };

    return (<Animated.View ref="animatedCard" key={"top"} style={[styles.card, animatedCardStyles]} {... this._panResponder.panHandlers}>
      {this.props.renderCard(this.state.card)}
    </Animated.View>);
  }

  renderNope() {
    const { pan } = this.state;

    const nopeOpacity = pan.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, -(SWIPE_THRESHOLD / 2)], outputRange: [1, 0], extrapolate: "clamp" });
    const nopeScale = pan.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: "clamp" });
    const animatedNopeStyles = { transform: [{ scale: nopeScale }], opacity: nopeOpacity };

    if (this.props.renderNope) {
      return this.props.renderNope(pan);
    }

    if (this.props.showNope) {
      const inner = this.props.noView
        ? this.props.noView
        : <Text style={styles.nopeText}>{this.props.nopeText}</Text>;

      return (<Animated.View style={[styles.nope, animatedNopeStyles]}>
        {inner}
      </Animated.View>);
    }

    return null;
  }

  renderMaybe() {
    if (!this.props.hasMaybeAction) return null;

    const { pan } = this.state;

    const maybeOpacity = pan.y.interpolate({ inputRange: [-SWIPE_THRESHOLD, -(SWIPE_THRESHOLD / 2)], outputRange: [1, 0], extrapolate: "clamp" });
    const maybeScale = pan.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], outputRange: [0, 1, 0], extrapolate: "clamp" });
    const animatedMaybeStyles = { transform: [{ scale: maybeScale }], opacity: maybeOpacity };

    if (this.props.renderMaybe) {
      return this.props.renderMaybe(pan);
    }


    if (this.props.showMaybe) {
      const inner = this.props.maybeView
        ? this.props.maybeView
        : <Text style={styles.maybeText}>{this.props.maybeText}</Text>;

      return (<Animated.View style={[styles.maybe, animatedMaybeStyles]}>
        {inner}
      </Animated.View>);
    }

    return null;
  }

  renderYup() {
    const { pan } = this.state;

    const yupOpacity = pan.x.interpolate({ inputRange: [(SWIPE_THRESHOLD / 2), SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: "clamp" });
    const yupScale = pan.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0.5, 1], extrapolate: "clamp" });
    const animatedYupStyles = { transform: [{ scale: yupScale }], opacity: yupOpacity };

    if (this.props.renderYup) {
      return this.props.renderYup(pan);
    }

    if (this.props.showYup) {
      const inner = this.props.yupView
        ? this.props.yupView
        : <Text style={styles.yupText}>{this.props.yupText}</Text>;

      return (<Animated.View style={[styles.yup, animatedYupStyles]}>
        {inner}
      </Animated.View>);
    }

    return null;
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.stack ? this.renderStack() : this.renderCard()}
        {this.renderNope()}
        {this.renderMaybe()}
        {this.renderYup()}
      </View>
    );
  }
}
