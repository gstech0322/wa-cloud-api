import React from "react";
import PropTypes from "prop-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function IconButton({
  style,
  color = "#8696A0",
  name,
  size = 25,
  onPress,
  disabled = false,
  accessibilityLabel,
}) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || name}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialCommunityIcons
        color={disabled ? "#CCC" : color}
        name={name}
        size={size}
      />
    </TouchableOpacity>
  );
}

IconButton.propTypes = {
  style: PropTypes.object,
  color: PropTypes.string,
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  onPress: PropTypes.func,
  disabled: PropTypes.bool,
  accessibilityLabel: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
