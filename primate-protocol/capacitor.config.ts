import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bryanlazaroz.ethubengine",
  appName: "Primate Protocol",
  webDir: "out",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
};

export default config;
