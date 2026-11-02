// =====================================================
// Red Parcel v4 - CONFIG FILE
// =====================================================
// 1. Copy this file and rename it to:  config.js
// 2. Paste your real keys below
// 3. NEVER upload config.js to GitHub
// =====================================================

const CONFIG = {
  // 1. SUPABASE
  SUPABASE_URL: "https://zkblpglhwkjqtzidfzvq.supabase.co",
  SUPABASE_ANON_KEY: "PASTE_YOUR_SUPABASE_ANON_KEY_HERE",

  // 2. GOOGLE MAPS
  GOOGLE_MAPS_KEY: "PASTE_YOUR_GOOGLE_MAPS_KEY_HERE",

  // 3. RAZORPAY (only Key ID is safe in frontend)
  RAZORPAY_KEY_ID: "PASTE_YOUR_RAZORPAY_KEY_ID_HERE",

  // App
  APP_NAME: "Red Parcel",
  BRAND_COLOR: "#E30613",
  VERSION: "4.0"
};

window.RED_PARCEL_CONFIG = CONFIG;
console.log("Red Parcel Config loaded");
