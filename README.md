# Tourist Safety App

A React Native Expo app with Google authentication and Supabase integration for tourist safety features.

## Features

- 🔐 Google OAuth authentication
- 📱 Modern, responsive UI design
- 🗄️ Supabase database integration
- 🛡️ User session management
- 📊 User profile display

## Prerequisites

Before running this app, you'll need:

1. **Node.js** (v16 or higher)
2. **Expo CLI** (`npm install -g @expo/cli`)
3. **Supabase account** and project
4. **Google Cloud Console** project with OAuth credentials

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Enable Google authentication in Authentication > Providers

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - For Web: Add your domain
   - For iOS: Add your bundle identifier
   - For Android: Add your package name and SHA-1 fingerprint

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your_google_client_id_ios_here
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_google_client_id_android_here
```

Or update the `app.json` file with your actual credentials in the `extra` section.

### 5. Update App Configuration

In `app.json`, replace the placeholder values:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "your_actual_supabase_url",
      "supabaseAnonKey": "your_actual_supabase_anon_key",
      "googleWebClientId": "your_actual_google_web_client_id",
      "googleIosClientId": "your_actual_google_ios_client_id",
      "googleAndroidClientId": "your_actual_google_android_client_id"
    }
  }
}
```

## Running the App

### Development

```bash
npm start
```

This will start the Expo development server. You can then:

- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Scan the QR code with Expo Go app on your device

### Building for Production

```bash
# For Android
expo build:android

# For iOS
expo build:ios
```

## Project Structure

```
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── lib/
│   └── supabase.js       # Supabase client configuration
├── services/
│   └── authService.js    # Authentication service
├── screens/
│   ├── RegistrationScreen.js
│   ├── LoginScreen.js
│   └── SuccessScreen.js
└── navigation/
    └── AppNavigator.js   # Navigation setup
```

## Authentication Flow

1. **Registration Screen**: Users can sign up with Google
2. **Login Screen**: Existing users can sign in with Google
3. **Success Screen**: Shows user information and app features after successful authentication

## Technologies Used

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **Supabase** - Backend as a Service
- **Google OAuth** - Authentication provider
- **React Navigation** - Navigation library

## Troubleshooting

### Common Issues

1. **Google Sign-In not working**: Ensure all client IDs are correctly configured
2. **Supabase connection issues**: Verify your URL and anon key
3. **Build errors**: Make sure all dependencies are installed

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Review [Supabase documentation](https://supabase.com/docs)
- Check [Google Sign-In documentation](https://developers.google.com/identity/sign-in/web)

## License

This project is licensed under the MIT License.
