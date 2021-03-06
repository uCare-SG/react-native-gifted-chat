import PropTypes from 'prop-types';
import React from 'react';

import {
  SectionList,
  ListView,
  View,
  StyleSheet,
} from 'react-native';

import shallowequal from 'shallowequal';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import md5 from 'md5';
import LoadEarlier from './LoadEarlier';
import Message from './Message';
import SectionHeader from './SectionHeader';

export default class MessageContainer extends React.Component {
  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);
    this.keyExtractor = this.keyExtractor.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderLoadEarlier = this.renderLoadEarlier.bind(this);

    const messagesData = this.prepareMessages(props.messages);
    this.state = {
      messagesData: messagesData
    };
  }

  prepareMessages(messages) {
    // Input may be:
    // [ {msg}, {msg}, {msg}, ...]
    // [ {data: [ {msg}, {msg}, {msg}, ...], title: 'section 1'}, ... ]
    // Output:
    // [ {data: [ {linked_msg}, ...], title: 'section 1'}, ... ]

    let flatterned = messages
    let sectioned = messages

    if (messages.length > 0) {
      if (messages[0].data && Array.isArray(messages[0].data)) {
        // sectioned input
        flatterned = messages.reduce((o, m, i) => {
          return o.concat(m.data)
        }, []);
      } else {
        // flatterned input
        sectioned = [{ data: messages }];
      }
    }

    // link messages
    const blob = flatterned.reduce((o, m, i) => {
      const previousMessage = flatterned[i + 1] || {};
      const nextMessage = flatterned[i - 1] || {};
      // add next and previous messages to hash to ensure updates
      const toHash = JSON.stringify(m) + previousMessage._id + nextMessage._id;
      o[m._id] = {
        ...m,
        previousMessage,
        nextMessage,
        hash: md5(toHash)
      };
      return o;
    }, {})

    // re-struct it to sections
    return sectioned.map((section, j, sectionsArr) => {
      return {
        ...section,
        data: section.data.map((m, i) => {
          return blob[m._id];
        })
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!shallowequal(this.props, nextProps)) {
      return true;
    }
    if (!shallowequal(this.state, nextState)) {
      return true;
    }
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.messages === nextProps.messages) {
      return;
    }
    const messagesData = this.prepareMessages(nextProps.messages);
    this.setState({
      // dataSource: this.state.dataSource.cloneWithRows(messagesData.blob, messagesData.keys)
      messagesData: messagesData
    });
  }

  renderFooter() {
    if (this.props.renderFooter) {
      const footerProps = {
        ...this.props,
      };
      return this.props.renderFooter(footerProps);
    }
    return null;
  }

  renderLoadEarlier() {
    if (this.props.loadEarlier === true) {
      const loadEarlierProps = {
        ...this.props,
      };
      if (this.props.renderLoadEarlier) {
        return this.props.renderLoadEarlier(loadEarlierProps);
      }
      return (
        <LoadEarlier {...loadEarlierProps}/>
      );
    }
    return null;
  }

  scrollTo(options) {
    this._invertibleScrollViewRef.scrollToLocation({
      animated: options.animated,
      itemIndex: 0,
      sectionIndex: 0,
      viewOffset: options.y,
    });
  }

  renderRow({item}) {
    const message = item
    if (!message._id && message._id !== 0) {
      console.warn('GiftedChat: `_id` is missing for message', JSON.stringify(message));
    }
    if (!message.user) {
      if (!message.system) {
        console.warn("GiftedChat: `user` is missing for message", JSON.stringify(message));
      }
      message.user = {};
    }

    const messageProps = {
      ...this.props,
      key: message._id,
      currentMessage: message,
      previousMessage: message.previousMessage,
      nextMessage: message.nextMessage,
      position: message.user._id === this.props.user._id ? 'right' : 'left',
    };

    if (this.props.renderMessage) {
      return this.props.renderMessage(messageProps);
    }
    return <Message {...messageProps}/>;
  }

  renderSectionHeader({section}) {
    if (this.props.renderSectionHeader) {
      return this.props.renderSectionHeader(section);
    }
    return <SectionHeader section={section} />
  }

  keyExtractor(item, index) {
    return (item._id) ? `id:${item._id}` : String(index)
  }

  render() {
    // TODO: support sticky section header.
    // as we use inverted SectionList, section footer is used as section header.
    // But RN's VirtualizedList does not support sticky section footer.
    // Discussions: https://github.com/facebook/react-native/issues/14520
    return (
      <View
        ref='container'
        style={styles.container}
      >
        <SectionList
          ref={component => this._invertibleScrollViewRef = component}

          automaticallyAdjustContentInsets={false}
	        initialNumToRender={20}
          maxToRenderPerBatch={20}
          {...this.props.listViewProps}
          {...this.props.invertibleScrollViewProps}
          inverted

          sections={this.state.messagesData}

          renderItem={this.renderRow}
          renderSectionFooter={this.renderSectionHeader}
          keyExtractor={this.keyExtractor}
          ListHeaderComponent={this.renderFooter()}
          ListFooterComponent={this.renderLoadEarlier()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

MessageContainer.defaultProps = {
  messages: [],
  user: {},
  renderFooter: null,
  renderMessage: null,
  onLoadEarlier: () => {
  },
};

MessageContainer.propTypes = {
  messages: PropTypes.array,
  user: PropTypes.object,
  renderFooter: PropTypes.func,
  renderMessage: PropTypes.func,
  onLoadEarlier: PropTypes.func,
  listViewProps: PropTypes.object,
};
