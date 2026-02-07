import { SafeAreaView, Platform } from 'react-native';

if (Platform.OS !== 'web') {
  var { WebView } = require('react-native-webview');
}

export default function App() {
  // On web, redirect to the actual website
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.location.href = 'http://localhost:8081';
    }
    return null;
  }

  // On iOS/Android, use WebView
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView source={{ uri: 'http://localhost:8081' }} />
    </SafeAreaView>
  );
}
