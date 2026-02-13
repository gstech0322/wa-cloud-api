import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  FlatList,
  Modal,
  StyleSheet,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";

import IconButton from "./IconButton";
import PickerItem from "./PickerItem";

export default function AttachmentPicker({ items = [], onPress }) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (item) => {
    setModalVisible(false);
    if (onPress) {
      onPress(item);
    }
  };

  return (
    <>
      <IconButton
        style={styles.rotate}
        name="attachment"
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Open attachment picker"
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <SafeAreaView style={styles.modal}>
                <IconButton
                  style={styles.close}
                  name="close"
                  onPress={() => setModalVisible(false)}
                  accessibilityLabel="Close attachment picker"
                />

                <FlatList
                  data={items}
                  keyExtractor={(item, index) =>
                    item?.value?.toString() || index.toString()
                  }
                  numColumns={3}
                  renderItem={({ item }) => (
                    <PickerItem
                      item={item}
                      label={item.label}
                      onPress={() => handleSelect(item)}
                    />
                  )}
                />
              </SafeAreaView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

AttachmentPicker.propTypes = {
  items: PropTypes.array,
  onPress: PropTypes.func,
};

const styles = StyleSheet.create({
  close: {
    alignSelf: "flex-end",
    paddingRight: 8,
    paddingTop: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingBottom: 15,
    maxHeight: "70%",
  },
  rotate: {
    transform: [{ rotate: "225deg" }],
  },
});
