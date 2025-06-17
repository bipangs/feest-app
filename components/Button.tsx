import { CustomColors } from "@/constants/Colors";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ButtonProps {
  text: string;
  onPress: () => void;
}

export const Button = ({ text, onPress }: ButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: CustomColors.blue,
    paddingBlock: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  text: {
    color: CustomColors.white,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 20,
  },
});
