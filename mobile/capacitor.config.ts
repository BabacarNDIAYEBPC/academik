import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "fr.academik.app",
  appName: "Academik",
  webDir: "../dist/public",
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#6366f1",
    },
    StatusBar: {
      style: "Default",
      backgroundColor: "#ffffff",
    },
  },
  android: {
    buildOptions: {
      releaseType: "AAB",
    },
    versionCode: 2,
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
