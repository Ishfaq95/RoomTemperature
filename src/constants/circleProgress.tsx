import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Rect} from 'react-native-svg';

const LineProgressWithTitle = ({value, width, height, title, text}) => {
  const filledWidth = (value / 100) * width;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Svg width={width} height={height} style={styles.svg}>
        <Rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="#59a1b9"
          rx={2}
          ry={2}
        />
        <Rect
          x="0"
          y="0"
          width={filledWidth}
          height={height}
          fill="#64de50"
          rx={2}
          ry={2}
        />
      </Svg>
      <Text style={styles.progressText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    // justifyContent: 'center',
    // padding: 10,
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  svg: {
    marginBottom: 5,
    // borderRadius: 10,
  },
  progressText: {
    fontSize: 10,
    color: '#',
    textAlign: 'right',
  },
});

export default LineProgressWithTitle;
