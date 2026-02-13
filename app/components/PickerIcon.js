import React from "react";
import PropTypes from "prop-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export default function PickerIcon({
  name,
  colorTop = "#6C63FF",
  colorBottom = "#4A47A3",
  size = 80,
  iconSize = 40,
}) {
  const halfHeight = size / 2;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.halfCircle,
          { backgroundColor: colorTop, height: halfHeight, width: size },
        ]}
      />
      <View
        style={[
          styles.halfCircle,
          { backgroundColor: colorBottom, height: halfHeight, width: size },
        ]}
      />
      {name && (
        <MaterialCommunityIcons
          style={styles.icon}
          color="#FFFFFF"
          name={name}
          size={iconSize}
        />
      )}
    </View>
  );
}

PickerIcon.propTypes = {
  name: PropTypes.string.isRequired,
  colorTop: PropTypes.string,
  colorBottom: PropTypes.string,
  size: PropTypes.number,
  iconSize: PropTypes.number,
};

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  halfCircle: {},
  icon: {
    position: "absolute",
  },
});
