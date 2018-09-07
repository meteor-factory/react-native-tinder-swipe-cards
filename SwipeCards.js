/* Gratefully copied from https://github.com/brentvatne/react-native-animated-demo-tinder */
'use strict';
'use strict'
import PropTypes from 'prop-types';

import React, { Component } from 'react'

import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native'

import clamp from 'clamp'


const SWIPE_THRESHOLD = 70

const {width, height} = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  yup: {
    borderColor: '#4CAF50',
    borderWidth: 10,
    padding: 5,
    borderRadius: 5,
    zIndex: 100,
    left: 0,
    width: 220
  },
  yupText: {
    color: '#4CAF50',
    zIndex: 30,
    textAlign: 'left',
    fontWeight: 'bold',
    backgroundColor: 'transparent'
  },
  nope: {
    borderColor: '#f44336',
    borderWidth: 10,
    padding: 5,
    borderRadius: 5,
    zIndex: 100,
    left: 20,
    width: 250
  },
  nopeText: {
    color: '#f44336',
    zIndex: 30,
    textAlign: 'right',
    fontWeight: 'bold',
    backgroundColor: 'transparent'
  },
  card: {
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 15},
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 3
  }
})

// Components could be unloaded and loaded and we will loose the users currentIndex, we can persist it here.
let currentIndex = {}
let guid = 0

export default class SwipeCards extends Component {

  static propTypes = {
    cards: PropTypes.array,
    cardKey: PropTypes.string,
    loop: PropTypes.bool,
    allowGestureTermination: PropTypes.bool,
    stack: PropTypes.bool,
    stackGuid: PropTypes.string,
    stackDepth: PropTypes.number,
    stackOffsetX: PropTypes.number,
    stackOffsetY: PropTypes.number,
    renderNoMoreCards: PropTypes.func,
    showYup: PropTypes.bool,
    showNope: PropTypes.bool,
    handleYup: PropTypes.func,
    handleNope: PropTypes.func,
    yupText: PropTypes.string,
    noText: PropTypes.string,
    onClickHandler: PropTypes.func,
    renderCard: PropTypes.func,
    cardRemoved: PropTypes.func,
    dragY: PropTypes.bool,
    smoothTransition: PropTypes.bool,
    stackX: PropTypes.number,
    stackY: PropTypes.number
  };

  static defaultProps = {
    cards: [],
    cardKey: 'uid',
    loop: false,
    allowGestureTermination: true,
    stack: true,
    stackDepth: 5,
    stackOffsetX: 25,
    stackOffsetY: 0,
    stackOffsetFromScreenX: 10,
    stackOffsetFromScreenY: 80,
    showYup: true,
    showNope: true,
    handleYup: (card) => null,
    handleNope: (card) => null,
    nopeText: 'NOPE!',
    yupText: 'YUP!',
    onClickHandler: () => {
      alert('tap')
    },
    cardRemoved: (ix) => null,
    renderCard: (card) => null,
    style: styles.container,
    dragY: true,
    smoothTransition: false
  };

  constructor (props) {
    super(props)

    // Use a persistent variable to track currentIndex instead of a local one.
    this.guid = this.props.guid || guid++
    if (!currentIndex[this.guid]) currentIndex[this.guid] = 0

    this.state = {
      pan: new Animated.ValueXY(),
      enter: new Animated.Value(0.5),
      cards: [].concat(this.props.cards),
      card: this.props.cards[currentIndex[this.guid]]
    }

    this.lastX = 0
    this.lastY = 0

    this.cardAnimation = null

    const self = this

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: (e, gestureState) => {
        this.lastX = gestureState.moveX
        this.lastY = gestureState.moveY
        return false
      },
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        return (Math.abs(this.lastX - gestureState.moveX) > 5 || Math.abs(this.lastY - gestureState.moveY) > 5)
      },

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value})
        this.state.pan.setValue({x: 0, y: 0})
      },

      onPanResponderTerminate: (e, gestureState) => {
        console.log(gestureState)
      },

      onPanResponderTerminationRequest: (evt, gestureState) => this.props.allowGestureTermination,

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.props.dragY ? this.state.pan.y : 0}
      ]),

      onPanResponderRelease: (e, {vx, vy, dx, dy}) => {
        this.state.pan.flattenOffset()
        let velocity
        if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5)   // meaning the gesture did not cover any distance
        {
          // if (Platform.OS !== 'ios') {
          this.props.onClickHandler(this.state.card)
          //   }
        }

        const hasSwipedHorizontally = Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD
        const hasSwipedVertically = Math.abs(this.state.pan.y._value) > SWIPE_THRESHOLD
        if (hasSwipedHorizontally || (hasSwipedVertically && this.props.hasMaybeAction)) {
          let cancelled = false

          const hasMovedRight = hasSwipedHorizontally && this.state.pan.x._value > 0
          const hasMovedLeft = hasSwipedHorizontally && this.state.pan.x._value < 0

          if (hasMovedRight) {
            cancelled = this.props.handleYup(this.state.card)
          } else if (hasMovedLeft) {
            cancelled = this.props.handleNope(this.state.card)
          } else {
            cancelled = true
          }

          // Yup or nope was cancelled, return the card to normal.
          if (cancelled) {
            this._resetPan()
            return
          };

          this.props.cardRemoved(currentIndex[this.guid])

          if (this.props.smoothTransition) {
            this._advanceState()
          } else {
            this.cardAnimation = Animated.spring(this.state.pan, {
              toValue: {x: hasMovedLeft ? -500 : 500, y: 0},
              friction: 4,
              duration: 200
            }).start()

            const self = this

            setTimeout(function () {
              self._advanceState()
              self.cardAnimation = null
            }, 200)
          }
        } else {
          this._resetPan()
        }
      }
    })
  }

  _forceLeftSwipe () {
    this.cardAnimation = Animated.timing(this.state.pan, {
      toValue: {x: -500, y: 0}
    }).start(status => {
        if (status.finished) this._advanceState()
        else this._resetState()

        this.cardAnimation = null
      }
    )
    this.props.cardRemoved(currentIndex[this.guid])
  }

  _forceRightSwipe () {
    this.cardAnimation = Animated.timing(this.state.pan, {
      toValue: {x: 500, y: 0}
    }).start(status => {
        if (status.finished) this._advanceState()
        else this._resetState()

        this.cardAnimation = null
      }
    )
    this.props.cardRemoved(currentIndex[this.guid])
  }

  _goToNextCard () {
    currentIndex[this.guid]++

    // Checks to see if last card.
    // If props.loop=true, will start again from the first card.
    if (currentIndex[this.guid] > this.state.cards.length - 1 && this.props.loop) {
      currentIndex[this.guid] = 0
    }

    this.setState({
      card: this.state.cards[currentIndex[this.guid]]
    })
  }

  _goToPrevCard () {
    this.state.pan.setValue({x: 0, y: 0})
    this.state.enter.setValue(0)
    this._animateEntrance()

    currentIndex[this.guid]--

    if (currentIndex[this.guid] < 0) {
      currentIndex[this.guid] = 0
    }

    this.setState({
      card: this.state.cards[currentIndex[this.guid]]
    })
  }

  componentDidMount () {
    this._animateEntrance()
  }

  _animateEntrance () {
    Animated.spring(
      this.state.enter,
      {toValue: 1, friction: 8}
    ).start()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.cards !== this.props.cards) {
      if (this.cardAnimation) {
        this.cardAnimation.stop()
        this.cardAnimation = null
      }

      currentIndex[this.guid] = 0
      this.setState({
        cards: [].concat(nextProps.cards),
        card: nextProps.cards[0]
      })
    }
  }

  _resetPan () {
    Animated.spring(this.state.pan, {
      toValue: {x: 0, y: 0},
      friction: 4
    }).start()
  }

  _resetState () {
    this.state.pan.setValue({x: 0, y: 0})
    this.state.enter.setValue(0)
    this._animateEntrance()
  }

  _advanceState () {
    this.state.pan.setValue({x: 0, y: 0})
    this.state.enter.setValue(0)
    this._animateEntrance()
    this._goToNextCard()
  }

  /**
   * Returns current card object
   */
  getCurrentCard () {
    return this.state.cards[currentIndex[this.guid]]
  }

  renderNoMoreCards () {
    if (this.props.renderNoMoreCards) {
      return this.props.renderNoMoreCards()
    }
  }

  /**
   * Renders the cards as a stack with props.stackDepth cards deep.
   */
  renderStack () {
    const self = this
    if (!this.state.card) {
      return this.renderNoMoreCards()
    }

    // Get the next stack of cards to render.
    let cards = this.state.cards.slice(currentIndex[this.guid], currentIndex[this.guid] + this.props.stackDepth).reverse()

    return cards.map((card, i) => {
      let offsetX = (this.props.stackOffsetX * cards.length - i * this.props.stackOffsetX) + this.props.stackX
      let lastOffsetX = (offsetX + this.props.stackOffsetX)

      let offsetY = (this.props.stackOffsetY * cards.length - i * this.props.stackOffsetY) + this.props.stackY
      let lastOffsetY = (offsetY + this.props.stackOffsetY)

      let opacity = 0.25 + (0.75 / cards.length) * (i + 1)
      let lastOpacity = 0.25 + (0.75 / cards.length) * i

      let scale = 0.85 + (0.15 / cards.length) * (i + 1)
      let lastScale = 0.85 + (0.15 / cards.length) * i

      let style = {
        position: 'absolute',
        top: this.state.enter.interpolate({inputRange: [0, 1], outputRange: [lastOffsetY, offsetY]}),
        left: this.state.enter.interpolate({inputRange: [0, 1], outputRange: [lastOffsetX, offsetX]}),

        transform: [{
          scale: this.state.enter.interpolate({
            inputRange: [0, 1],
            outputRange: [lastScale, scale]
          })
        }],
        elevation: i * 10
      }

      // Is this the top card?  If so animate it and hook up the pan handlers.
      if (i + 1 === cards.length) {
        let {pan} = this.state
        let [translateX, translateY] = [pan.x, pan.y]

        let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ['-30deg', '0deg', '30deg']})
//        let opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5]});

        const transform = [
          {translateX: translateX},
          {translateY: translateY},
          {rotate: rotate},
          {scale: this.state.enter.interpolate({inputRange: [0, 1], outputRange: [lastScale, scale]})}
        ]

        let animatedCardStyles = {
          ...style,
          transform: transform
        }

        const yupNopContent = (
          <View style={{ position: 'absolute', top: 50, left: 10, right: 10, bottom: 10}}>
            <View>
              {this.renderYup()}
            </View>
            <View>
              {this.renderNope()}
            </View>
          </View>
        )

        return <Animated.View key={card[this.props.cardKey]}
                              style={[styles.card, animatedCardStyles]} {... this._panResponder.panHandlers}>

          {this.cardContainer(this.state.card, self, true)}

        </Animated.View>
      }

      return <Animated.View key={card[this.props.cardKey]} style={style}>
        {this.cardContainer(card, self, false)}
      </Animated.View>
    })
  }

  cardContainer (card, self, isTop) {
    let yupNopContent = (
      <View style={{ position: 'absolute', top: 50, left: 10, right: 10, bottom: 10}}>
        <View>
          {self.renderYup()}
        </View>
        <View>
          {self.renderNope()}
        </View>
      </View>
    )

    if (!isTop) {
      yupNopContent = <View />
    };

    if (Platform.OS === 'ios') {
      return (
        <TouchableWithoutFeedback
          key={card[self.props.cardKey]}
          onPress={() => {
            self.props.onClickHandler(self.state.card)
            console.log('didPress')
          }
          }>
          <View>
            {self.props.renderCard(card, yupNopContent)}
          </View>
        </TouchableWithoutFeedback>
      )
    } else {
      return self.props.renderCard(card, yupNopContent)
    }
  }

  renderCard () {
    if (!this.state.card) {
      return this.renderNoMoreCards()
    }

    let {pan, enter} = this.state
    let [translateX, translateY] = [pan.x, pan.y]

    let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ['-30deg', '0deg', '30deg']})
    let opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5]})

    let scale = enter

    let animatedCardStyles = {transform: [{translateX}, {translateY}, {rotate}, {scale}], opacity}

    return <Animated.View key={'top'}
                          style={[styles.card, animatedCardStyles]} {... this._panResponder.panHandlers}>
      {this.props.renderCard(this.state.card)}
    </Animated.View>
  }

  renderNope () {
    let {pan} = this.state

    let nopeOpacity = pan.x.interpolate({inputRange: [-30, 0], outputRange: [1, 0]})
    let nopeScale = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0.5], extrapolate: 'clamp'})
    let animatedNopeStyles = {transform: [{scale: nopeScale}], opacity: nopeOpacity}

    if (this.props.renderNope) {
      return this.props.renderNope(pan)
    }

    if (this.props.showNope) {
      return <Animated.View style={[styles.nope, animatedNopeStyles]} key='nope'>
        <Text style={styles.nopeText}>{this.props.nopeText}</Text>
      </Animated.View>
    }

    return null
  }

  renderYup () {
    let {pan} = this.state

    let yupOpacity = pan.x.interpolate({inputRange: [0, 30], outputRange: [0, 1]})
    let yupScale = pan.x.interpolate({inputRange: [0, 150], outputRange: [0.5, 1], extrapolate: 'clamp'})
    let animatedYupStyles = {transform: [{scale: yupScale}], opacity: yupOpacity}

    if (this.props.renderYup) {
      return this.props.renderYup(pan)
    }

    if (this.props.showYup) {
      return <Animated.View style={[styles.yup, animatedYupStyles]} key='yup'>
        <Text style={styles.yupText}>{this.props.yupText}</Text>
      </Animated.View>
    }

    return null
  }

  render () {
    return (
      <View style={styles.container} key='container'>
        {this.props.stack ? this.renderStack() : this.renderCard()}
      </View>
    )
  }
}
