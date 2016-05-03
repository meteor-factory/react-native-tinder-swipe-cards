import React, {StyleSheet, Dimensions, PixelRatio} from "react-native";
const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

const variables = Object.freeze({
  textColor: '#585050',
  primaryColor : '#5da782',
  primaryColorLight : '#75c09a',
  primaryColorDark : '#45906b',
  secondaryColor: '#b16d5d',
  infoColor: '#eccb48',
  infoColorLight: '#fadb62',
  dangerColor: '#970D15',
  warnColor:'#fe9525',
  successColor: '#5da782',
  primaryTextColor: 'white',
  infoTextColor: '#585050',
  dangerTextColor: 'white',
  warnTextColor: '#585050',
  successTextColor: 'white',
  btnDefaultColor: 'white',
  linkColor:'#4866a8',
  grayColor: '#585050',
  grayLightColor : '#aaaaaa',
  grayLighterColor : '#ededed',
  grayLightestColor : '#f4f4f4',
  paddingVerticalLarge : 16,
  paddingHorizontalLarge : 16,
  paddingHorizontal : 8,
  paddingVertical : 8,
  paddingHorizontalSmall : 4,
  paddingVerticalSmall : 4,
  labelColor : '#585050',
  inputColor : '#000000',
  errorColor : '#a94442',
  helpColor : '#999999',
  borderColor : '#cccccc',
  disabledColor : '#777777',
  disabledBackgroundColor : '#eeeeee',
  titleFontSize:20,
  fontSize : 14,
  fontSizeSmall : 13,
  fontSizeTiny : 10,
  iconSize: 13,
  fontWeight : '400',
  fontFamily : 'Roboto',
  topNavColor : 'white',
  borderRadius:2
});

const styles = StyleSheet.create({
  containerApp: {
    flex: 1,
    height: 100 * vh,
    paddingTop: 3 * vmax,
  },
  container: {
    flex: 1,
    height: 100 * vh,
  },
  buttonHeaderContainer: {
    flexDirection: 'row',
    width: 100 * vw,
    height: 10 * vh,
    justifyContent: 'space-between',
  },
  buttonFooterContainer: {
    flexDirection: 'row',
    width: 90 * vw,
    height: 10 * vh,
    marginLeft: 5 * vmin,
    marginRight: 5 * vmin,
    justifyContent: 'space-around',
  },
  buttonHeader: {
    width: 10 * vh,
    alignItems: 'center',
    justifyContent: 'center',
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

// Cards

  card: {
    alignItems: 'center',
    borderRadius: 1 * vmax,
    overflow: 'hidden',
    borderColor: '#000000',
    borderWidth: 0.5,
  },
  thumbnail: {
    flex: 1,
    width: 95 * vmin,
    height: 115 * vmin,
    backgroundColor: '#FFFFFF',
    resizeMode: 'contain',
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
  },

// SwipeCards

  containerSwipeCards: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    alignItems: 'center',
    borderColor: 'green',
    borderWidth: 5,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 4 * vh,
    left: 4 * vw,
    width: 60 * vmin,
    padding: 5 * vmin,
    borderRadius: 10,
  },
  rightText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'green',
    backgroundColor: 'transparent',
  },
  up: {
    alignItems: 'center',
    borderColor: 'purple',
    borderWidth: 5,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 10 * vh,
    width: 70 * vmin,
    padding: 5 * vmin,
    margin: 12.5 * vmin,
    borderRadius: 10,
  },
  upText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'purple',
    backgroundColor: 'transparent',
  },
  left: {
    alignItems: 'center',
    borderColor: 'red',
    borderWidth: 5,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 4 * vh,
    right: 4 * vw,
    width: 60 * vmin,
    padding: 5 * vmin,
    borderRadius: 10,
  },
  leftText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'red',
    backgroundColor: 'transparent',
  },
});

export {
  styles as default,
  variables
};
