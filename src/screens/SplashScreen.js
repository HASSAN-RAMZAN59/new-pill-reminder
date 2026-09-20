import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import SplashIcon from '../assets/Frame 833 (1).svg';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar over 3 seconds and then transition
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false, // width animation does not support native driver
    }).start(({ finished }) => {
      if (finished) {
        navigation.replace('Onboarding');
      }
    });
  }, [navigation, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SplashIcon />
        <Text style={styles.title}>MedTrack</Text>
        <Text style={styles.subtitle}>
          Never forget to take your{'\n'}medications again with this app.
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light clean background
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0285FF',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8F99',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  bottomContainer: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
  },
  progressBarBackground: {
    width: width * 0.6,
    height: 6,
    backgroundColor: '#D8E9FF',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0285FF',
    borderRadius: 3,
  },
});

export default SplashScreen;
