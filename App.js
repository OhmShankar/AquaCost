import { SafeAreaView, Platform } from 'react-native';

if (Platform.OS !== 'web') {
  var { WebView } = require('react-native-webview');
}

export default function App() {
  // On web, redirect to the actual website
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://example.com';
    }
    return null;
  }

  // On iOS/Android, use WebView
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView source={{ uri: 'https://example.com' }} />
    </SafeAreaView>
  );
}
