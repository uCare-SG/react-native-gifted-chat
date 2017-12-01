import PropTypes from 'prop-types';
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default class SectionHeader extends React.Component {
  render() {
    if (this.props.section.title) {
      return (
        <View style={styles.container}>
          <View style={styles.wraper}>
            <Text style={styles.text}>{this.props.section.title}</Text>
          </View>
        </View>
      );
    }
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: 5,
    marginBottom: 10,
  },
  wraper: {
    backgroundColor: "#2ecc71",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 8,
    paddingRight: 8,
    minWidth: 60,
    borderRadius: 4,
  },
  text: {
    backgroundColor: "transparent",
    color: "#fff",
    fontSize: 12,
    fontWeight: "normal",
    textAlign: "center",
  }
});
SectionHeader.defaultProps = {
  section: {},
};

SectionHeader.propTypes = {
  section: PropTypes.object,
};
