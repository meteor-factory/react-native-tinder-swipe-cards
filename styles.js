import React, {StyleSheet, Dimensions, PixelRatio} from "react-native";
const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 1 * vmax,
    overflow: 'hidden',
    borderColor: '#000000',
    borderWidth: 0.5,
  },
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
  styles as default
};
