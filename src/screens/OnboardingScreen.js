import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Illustration1Icon from '../assets/Illustration.svg';
import HeroIcon from '../assets/Hero Graphic Area_margin.svg';
import Illustration3Icon from '../assets/Illustration (1).svg';
import { StorageService } from '../services/StorageService';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to MedTrack',
    subtitle: 'Your personal companion for medication management and health tracking.',
    description: 'Digitize your medicine cabinet effortlessly. Keep track of what you take, when to take it, and never miss a dose again.',
    Icon: Illustration1Icon,
  },
  {
    id: 2,
    title: 'Never Miss a Dose',
    subtitle: null,
    description: 'Get timely notifications tailored to your schedule and never worry about forgetting again.',
    Icon: HeroIcon,
  },
  {
    id: 3,
    title: 'Track Your Progress',
    subtitle: null,
    description: 'View adherence charts and gain insights into your health journey over time with the Health Trends feature.',
    Icon: Illustration3Icon,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      StorageService.setHasOnboarded(true);
      navigation.replace('Home');
    }
  };

  const handleSkip = () => {
    StorageService.setHasOnboarded(true);
    navigation.replace('Home');
  };

  const currentData = onboardingData[currentStep];
  const CurrentIcon = currentData.Icon;

  return (
    <View style={styles.container}>

      <View style={styles.imageContainer}>
        <CurrentIcon width={width * 0.75} height={width * 0.75} />
      </View>


      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          {currentData.title}
        </Text>
        {currentData.subtitle && (
          <Text style={styles.subtitle}>{currentData.subtitle}</Text>
        )}
        <Text style={styles.description}>{currentData.description}</Text>
      </View>


      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentStep === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>


      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingData.length - 1 ? 'Get Started \u2192' : 'Next'}
          </Text>
        </TouchableOpacity>

        {currentStep !== onboardingData.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  textContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 180, // ensures the title stays at the same vertical position across all screens
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0285FF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#0285FF',
  },
  inactiveDot: {
    backgroundColor: '#CBD5E1',
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#0285FF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#0285FF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
