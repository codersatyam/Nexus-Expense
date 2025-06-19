import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  useEffect(() => {
    // Hide the splash screen on mount
    // SplashScreen.hide();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Your app content goes here */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
