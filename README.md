# Tourist Safety App

A React Native Expo app with Google authentication and Supabase integration for tourist safety features.

## Features

- 🔐 Google OAuth authentication
- 📱 Modern, responsive UI design with Expo Router
- 🗄️ Supabase database integration
- 🛡️ User session management
- 📊 User profile display
- ⚡ TypeScript support
- 🚀 Bun package manager

## Prerequisites

Before running this app, you'll need:

1. **Bun** (latest version) - `curl -fsSL https://bun.sh/install | bash`
2. **Expo CLI** (`bun install -g @expo/cli`)
3. **Supabase account** and project
4. **Google Cloud Console** project with OAuth credentials

## Setup Instructions

### 1. Install Dependencies

```bash
bun install
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

Update the `app.json` file with your actual credentials in the `extra` section:

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
bun start
```

This will start the Expo development server. You can then:

- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Scan the QR code with Expo Go app on your device

### Alternative Commands

```bash
# Start with tunnel (for testing on physical device)
bunx expo start --tunnel

# Start with clear cache
bunx expo start --clear
```

## Project Structure

```
├── app/
│   ├── _layout.tsx       # Root layout with Expo Router
│   ├── index.tsx         # Entry point (redirects to register)
│   ├── login.tsx         # Login screen
│   ├── register.tsx      # Registration screen
│   └── success.tsx       # Success screen after auth
├── lib/
│   ├── supabase.ts       # Supabase client configuration
│   └── authService.ts    # Authentication service
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── babel.config.js       # Babel configuration
```

## Authentication Flow

1. **Index Screen**: Redirects to registration
2. **Registration Screen**: Users can sign up with Google
3. **Login Screen**: Existing users can sign in with Google
4. **Success Screen**: Shows user information and app features after successful authentication

## Technologies Used

- **React Native** - Mobile app framework
- **Expo Router** - File-based routing
- **TypeScript** - Type safety
- **Bun** - Fast package manager and runtime
- **Supabase** - Backend as a Service
- **Google OAuth** - Authentication provider

## Troubleshooting

### Common Issues

1. **Google Sign-In not working**: Ensure all client IDs are correctly configured in app.json
2. **Supabase connection issues**: Verify your URL and anon key in app.json
3. **Build errors**: Make sure all dependencies are installed with `bun install`
4. **TypeScript errors**: Check tsconfig.json configuration

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Review [Supabase documentation](https://supabase.com/docs)
- Check [Google Sign-In documentation](https://developers.google.com/identity/sign-in/web)
- [Bun documentation](https://bun.sh/docs)

## License

This project is licensed under the MIT License.