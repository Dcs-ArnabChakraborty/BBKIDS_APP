// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// class ErrorBoundary extends React.Component
//   { children: React.ReactNode },
//   { hasError: boolean; error: Error | null }
// > {
//   state = { hasError: false, error: null };
  
//   static getDerivedStateFromError(error: Error) {
//     return { hasError: true, error };
//   }
  
//   componentDidCatch(error: Error, info: React.ErrorInfo) {
//     console.error('Error caught by boundary:', error, info);
//   }
  
//   render() {
//     if (this.state.hasError) {
//       return (
//         <View style={styles.container}>
//           <Text style={styles.text}>Something went wrong</Text>
//           <Text style={styles.errorText}>
//             {this.state.error?.message}
//           </Text>
//         </View>
//       );
//     }
//     return this.props.children;
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000000',
//     padding: 20,
//   },
//   text: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   errorText: {
//     color: '#FF4444',
//     fontSize: 14,
//     textAlign: 'center',
//   },
// });

// export default ErrorBoundary;