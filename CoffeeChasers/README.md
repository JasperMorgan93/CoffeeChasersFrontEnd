# CoffeeChasers Frontend

## Mapbox Local Android Workflow

Mapbox uses native modules, so testing it is different from running Expo Go.

### One-time machine setup (Windows)

1. Install JDK 17.
2. Install Android Studio.
3. Ensure Android SDK and platform tools are installed.
4. Ensure these env vars are available in your shell/system:
	- `JAVA_HOME`
	- `ANDROID_HOME`
	- `ANDROID_SDK_ROOT`
5. In your local env file, set:
	- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (public runtime token)
	- `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` (private build-time token)

### First native install on a physical Android device

1. Enable Developer Options on your phone.
2. Enable USB debugging.
3. Connect phone over USB and accept the RSA prompt.
4. From this project root, run:

```bash
npx expo run:android
```

This builds native Android code, installs the dev build, and starts Metro.

### Daily development loop

After the dev build is installed on the phone:

1. Start Metro:

```bash
npx expo start
```

2. Open the installed CoffeeChasers dev build on your phone.

Run `npx expo run:android` again when native code/config changes, for example:

- Adding/changing native packages (like `@rnmapbox/maps`)
- Changing Expo plugins in `app.json`
- Native Android config changes

### Common device authorization fix

If you see "not authorized" for your device:

```bash
adb kill-server
adb start-server
adb devices -l
```

Then re-accept the USB debugging prompt on your phone.
