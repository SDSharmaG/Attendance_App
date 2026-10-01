# Attendance Management App

Offline attendance management application built with React, Vite, Capacitor, and Electron.

The app stores attendance records locally on each device. It does not require an online database, cloud account, or internet connection after it has been packaged and installed.

## 1. Project Requirements

Build machine:

- Windows 10 or Windows 11
- Node.js LTS and npm
- Android Studio for Android APK builds
- Android SDK installed through Android Studio
- Java runtime from Android Studio, or a compatible JDK

The other device does not need Node.js, npm, VS Code, or the source code. It only needs the APK or Windows installer.

## 2. Install Dependencies

Open PowerShell in the project folder:

```powershell
cd C:\Sharma\attendance-app
npm install
```

Run this again whenever `package.json` or `package-lock.json` changes.

## 3. Run Locally in a Browser

Start the development server:

```powershell
npm run dev
```

Open this address in the browser:

```text
http://localhost:5173/
```

Stop the server with `Ctrl+C`.

The local browser version needs the Vite server. The packaged Android and Windows versions do not.

## 4. Check the Application Before Packaging

Create a production web build:

```powershell
npm run build
```

The output is written to `dist/`.

Optional checks:

```powershell
npm run lint
```

The build may show a warning about large JavaScript chunks. That warning does not prevent packaging.

## 5. Create the Android APK

### First-time Android setup

1. Install Android Studio.
2. Open Android Studio once and install the Android SDK and SDK Platform tools.
3. Confirm that this folder exists, or adjust the path for your installation:

```text
C:\Program Files\Android\Android Studio\jbr
```

### Build commands

From the project folder:

```powershell
cd C:\Sharma\attendance-app
npm run build
npx cap sync android

$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:Path="$env:JAVA_HOME\bin;$env:Path"

Push-Location android
.\gradlew.bat assembleDebug
Pop-Location
```

The APK is created here:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

### Install the APK on an Android device

1. Copy `app-debug.apk` to the phone or tablet.
2. Open the file on the device.
3. Allow installation from that file manager if Android asks.
4. Install and open **Attendance Management**.

The debug APK is suitable for private sharing and testing. A Play Store release needs a signed release key and a release build.

### Android build troubleshooting

If Gradle says that Java or `JAVA_HOME` is missing, run:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

If `Bridge.java` reports a Java error at a line containing only `0`, the installed Capacitor package is corrupted. Reinstall the package first:

```powershell
npm install @capacitor/android@8.5.2 @capacitor/core@8.5.2
```

Then check this file:

```text
node_modules\@capacitor\android\capacitor\src\main\java\com\getcapacitor\Bridge.java
```

There must not be a line containing only `0` immediately before the `if (!isDeployDisabled()` statement. Remove only that stray line if it is still present, then run the Gradle command again.

## 6. Create the Windows EXE Installer

The Windows version uses Electron and packages the built local files. It does not need a web server when installed.

Run:

```powershell
cd C:\Sharma\attendance-app
npm run desktop:build
```

The installer is created here:

```text
dist\Attendance Management Setup 0.0.0.exe
```

Copy that `.exe` to the other Windows PC and double-click it to install.

Do not open or share the `.blockmap` file. It is only an update metadata file.

### Test the Windows app before creating the installer

```powershell
npm run desktop:dev
```

This builds the web files and opens the Electron desktop window.

## 7. What to Share

Share only the packaged application for the target device:

### Android

```text
C:\Sharma\attendance-app\android\app\build\outputs\apk\debug\app-debug.apk
```

### Windows

```text
C:\Sharma\attendance-app\dist\Attendance Management Setup 0.0.0.exe
```

You can copy these files to a USB drive or send them through a file-sharing service.

Do not share these folders or files:

- The project source folder
- `src/`
- `node_modules/`
- `android/` as a project folder
- `dist/win-unpacked/`
- Any `.blockmap` file
- `package.json` or `package-lock.json`

## 8. Offline Behavior and Data Storage

- Attendance data is stored in local IndexedDB.
- PDF generation happens locally.
- The Android and Windows builds do not need the internet to run.
- Data is separate on each device. Records entered on one PC or phone do not automatically appear on another device.
- Uninstalling or clearing application data may remove local attendance records. Export monthly PDFs if records must be preserved.

## 9. Normal Daily Workflow

1. Select a date and choose `Working`, `Holiday`, or `Leave`.
2. For a working day, enter Entry Time and save. The table shows `In progress`.
3. When work finishes, click Edit for that date.
4. Enter Out Time and click Update Attendance.
5. The app then calculates Actual time, Shortage, or Extra.
6. Download the monthly PDF when required.

Shortage and extra are mutually exclusive in the monthly summary. If compensation extra offsets a shortage, the summary keeps only the applicable net value.

## 10. Rebuild After Code Changes

After changing application code:

```powershell
cd C:\Sharma\attendance-app
npm run build
npx cap sync android
```

Then rebuild the Android APK or Windows installer using the commands above. Always share the newly generated files, not an older copy.

## 11. Common Mistakes

| Problem | Correct action |
| --- | --- |
| Windows asks which app should open a `.blockmap` file | Close it and open the `.exe` installer instead |
| Other PC says Node.js is missing | Use the packaged `.exe`, not `npm run dev` |
| Android refuses to install the APK | Allow installation from the file manager, then retry |
| APK contains old code | Run `npm run build` and `npx cap sync android` before Gradle |
| Records are missing on another device | Data is local per device; it is not synchronized |
| Gradle cannot find Java | Set `JAVA_HOME` to Android Studio's `jbr` folder |