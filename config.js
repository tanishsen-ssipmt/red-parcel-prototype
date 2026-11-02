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
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprYmxwZ2xod2tqcXR6aWRmenZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzOTIyNjksImV4cCI6MjEwODk2ODI2OX0.cj05VQROWFkQ0bpqw0l1KYCijxPM2QLHjNsp3AKJyjc",

  // 2. GOOGLE MAPS
  GOOGLE_MAPS_KEY: "AlzaSyB6qYEmicJWx7Uz nqCL01chvKBeWYnkXNI",

  // 3. RAZORPAY (only Key ID is safe in frontend)
  RAZORPAY_KEY_ID: "rzp_test_TuGC487nIZnkMZ",

  // App
  APP_NAME: "Red Parcel",
  BRAND_COLOR: "#E30613",
  VERSION: "4.0"
};

window.RED_PARCEL_CONFIG = CONFIG;
console.log("Red Parcel Config loaded");
