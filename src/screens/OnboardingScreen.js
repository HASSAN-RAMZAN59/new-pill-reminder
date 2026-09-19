import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const onboardingData = [
  {
    id: 1,
    title: 'Onboarding Step 1',
    description: 'Welcome to the Pill Reminder app.',
  },
  {
    id: 2,
    title: 'Onboarding Step 2',
    description: 'Set up your personal medication schedule.',
  },
  {
    id: 3,
    title: 'Onboarding Step 3',
    description: 'Never miss a pill again. You are all set!',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to Home screen when onboarding is complete
      navigation.replace('Home');
    }
  };

  const currentData = onboardingData[currentStep];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentData.title}</Text>
      <Text style={styles.description}>{currentData.description}</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
          {currentStep === onboardingData.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default OnboardingScreen;
