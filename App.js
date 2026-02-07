import { SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

if (Platform.OS === 'web') {
  window.addEventListener(
    'touchend',
    e => e.preventDefault(),
    { passive: false }
  );
}

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView source={{ uri: 'https://example.com' }} />
    </SafeAreaView>
  );
}
