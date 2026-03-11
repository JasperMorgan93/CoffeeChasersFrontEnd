# Known Issues

## 1. Mapbox Does Not Run In Expo Go

- Symptom: QR scan from Expo Go spins and then returns without a useful error.
- Cause: `@rnmapbox/maps` is a native module and is not supported in Expo Go.
- Current behavior: use a development build for full map rendering.

## 2. How To Run Full Map Experience

Use an Expo development build instead of Expo Go.

```bash
npx expo install expo-dev-client
npx expo run:android
```

Then open the installed development client app and load this project.

## 3. Metro Port Conflicts

- Symptom: Expo asks to switch from port 8081 to another port.
- Cause: another Metro server is already running.
- Fix: stop the other process or accept the new port when prompted.
