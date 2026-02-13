import React, { useState } from "react";
import PropTypes from "prop-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function AppInput({
  placeholder,
  logo,
  color = "#999",
  onChangeText,
  value,
  style,
  ...rest
}) {
  const [internalValue, setInternalValue] = useState("");

  const inputValue = value !== undefined ? value : internalValue;

  const handleChange = (text) => {
    if (value === undefined) {
      setInternalValue(text);
    }
    if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <View style={[styles.container, { borderColor: color }, style]}>
      {logo && (
        <MaterialCommunityIcons
          color={color}
          name={logo}
          size={20}
          style={styles.icon}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={inputValue}
        onChangeText={handleChange}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
    </View>
  );
}

AppInput.propTypes = {
  placeholder: PropTypes.string,
  logo: PropTypes.string,
  color: PropTypes.string,
  onChangeText: PropTypes.func,
  value: PropTypes.string,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    margin: 5,
    paddingHorizontal: 12,
    height: 45,
    minWidth: 170,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  icon: {
    marginRight: 8,
  },
});
