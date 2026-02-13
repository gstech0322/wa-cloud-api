import React from "react";
import PropTypes from "prop-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function AppButton({
  text,
  logo,
  color = "#E0E0E0",
  onPress,
  whiteText = false,
  style,
}) {
  const textColor = whiteText ? "#FFFFFF" : "#000000";

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
      {logo && (
        <MaterialCommunityIcons
          name={logo}
          size={20}
          color={textColor}
          style={styles.icon}
        />
      )}

      <Text style={[styles.buttonText, { color: textColor }]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

AppButton.propTypes = {
  text: PropTypes.string.isRequired,
  logo: PropTypes.string,
  color: PropTypes.string,
  onPress: PropTypes.func,
  whiteText: PropTypes.bool,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    margin: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 170,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  icon: {
    marginRight: 8,
  },
});
