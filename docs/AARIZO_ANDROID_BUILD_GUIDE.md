# AARIZO 2.0: ANDROID APK & MOBILE DEPLOYMENT GUIDE

## 1. Mobile Technology Architecture
- **Framework:** Capacitor 8
- **Android Target:** Android 14+ (API Level 34/35)
- **Minimum SDK:** API Level 24 (Android 7.0)
- **JDK Requirement:** OpenJDK 21 (Eclipse Adoptium)
- **Native Plugins:** App, Camera, Haptics, Push Notifications, Status Bar

---

## 2. Compilation & APK Build Instructions

### Step 1: Frontend Production Build
```powershell
npm run build
```

### Step 2: Sync Capacitor Assets & Plugins
```powershell
npx cap sync android
```

### Step 3: Compile Android Debug APK
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
cd android
.\gradlew.bat assembleDebug
```

The compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 3. Direct Installation via ADB
With an Android smartphone or emulator connected over USB/Wi-Fi:
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r "android/app/build/outputs/apk/debug/app-debug.apk"
```

