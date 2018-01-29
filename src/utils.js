import moment from 'moment';
import { Dimensions, Platform } from 'react-native';

const DEPRECATION_MESSAGE = 'isSameUser and isSameDay should be imported from the utils module instead of using the props functions';

export function isSameDay(currentMessage = {}, diffMessage = {}) {

  if (!diffMessage.createdAt) {
    return false
  }

  let currentCreatedAt = moment(currentMessage.createdAt);
  let diffCreatedAt = moment(diffMessage.createdAt);

  if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
    return false;
  }

  return currentCreatedAt.isSame(diffCreatedAt, 'day');

}

export function isSameUser(currentMessage = {}, diffMessage = {}) {

  return !!(diffMessage.user && currentMessage.user && diffMessage.user._id === currentMessage.user._id);

}

export function warnDeprecated(fn) {

  return (...args) => {
    console.warn(DEPRECATION_MESSAGE);
    return fn(...args);
  };

}

export const isIphoneX = () => {
  let d = Dimensions.get('window');
  const { height, width } = d;

  return (
  Platform.OS === 'ios' &&
  // Accounting for the height in either orientation
  (height === 812 || width === 812)
  );
}
