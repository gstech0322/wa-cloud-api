import React from "react";
import PropTypes from "prop-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export default function PreviewIcon({
  visible = true,
  name,
  color = "#8696A0",
  size = 18,
  style,
}) {
  if (!visible || !name) return null;

  return (
    <MaterialCommunityIcons
      name={name}
      color={color}
      size={size}
      style={[styles.icon, style]}
    />
  );
}

PreviewIcon.propTypes = {
  visible: PropTypes.bool,
  name: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  icon: {
    marginRight: 4,
  },
});
