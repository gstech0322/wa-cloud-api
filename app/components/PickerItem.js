import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import PickerIcon from "./PickerIcon";

export default function PickerItem({ item, onPress }) {
  if (!item) return null;

  const isDisabled = !!item.disabled;

  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress(item);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={item.label}
      >
        <PickerIcon
          colorTop={isDisabled ? "#A0A0A0" : item.colorTop}
          colorBottom={isDisabled ? "#D3D3D3" : item.colorBottom}
          name={item.icon}
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.label,
          isDisabled && styles.disabledLabel,
        ]}
      >
        {item.label}
      </Text>
    </View>
  );
}

PickerItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.string,
    colorTop: PropTypes.string,
    colorBottom: PropTypes.string,
    disabled: PropTypes.bool,
  }),
  onPress: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "33%",
  },
  label: {
    fontSize: 16,
    marginTop: 6,
    textAlign: "center",
  },
  disabledLabel: {
    color: "#A0A0A0",
  },
});
