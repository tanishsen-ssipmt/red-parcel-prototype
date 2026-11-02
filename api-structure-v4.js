/**
 * =====================================================
 * Red Parcel Version 4 – Complete API Structure
 * =====================================================
 * Connect all three services here:
 * 1. Supabase  (Database + Auth + Realtime)
 * 2. Google Maps (Live location + ETA)
 * 3. Razorpay (Payments)
 *
 * HOW TO USE:
 * 1. Create config.js from config-v4.example.js
 * 2. Paste your keys in config.js
 * 3. Replace every section marked // ADD_API with real code
 * =====================================================
 */

// Load config (create config.js from example)
const CONFIG = window.RED_PARCEL_CONFIG || {
  SUPABASE_URL: "https://zkblpglhwkjqtzidfzvq.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprYmxwZ2xod2tqcXR6aWRmenZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzOTIyNjksImV4cCI6MjEwODk2ODI2OX0.cj05VQROWFkQ0bpqw0l1KYCijxPM2QLHjNsp3AKJyjc",
  GOOGLE_MAPS_KEY: "AlzaSyB6qYEmicJWx7Uz nqCL01chvKBeWYnkXNI",
  RAZORPAY_KEY_ID: "rzp_test_TuGC487nIZnkMZ"
};

// =====================================================
// 1. SUPABASE INIT
// =====================================================
// ADD_API → Uncomment and use after adding Supabase SDK
/*
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
*/

const API = {

  // =====================================================
  // SUPABASE – AUTH
  // =====================================================
  async sendOtp(phone) {
    // ADD_API → Supabase Auth
    // const { data, error } = await supabase.auth.signInWithOtp({ phone })
    console.log("ADD_API [Supabase]: sendOtp", phone);
    return { success: true };
  },

  async verifyOtp(phone, token) {
    // ADD_API → Supabase Auth
    // const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    console.log("ADD_API [Supabase]: verifyOtp", phone, token);
    return { success: true, user: { id: "demo", phone } };
  },

  // =====================================================
  // SUPABASE – SHIFTS & CHECK-IN
  // =====================================================
  async getTodayShifts(busId) {
    // ADD_API → 
    // const { data } = await supabase.from('shifts').select('*')
    //   .eq('bus_id', busId).eq('shift_date', new Date().toISOString().slice(0,10))
    console.log("ADD_API [Supabase]: getTodayShifts", busId);
    return [];
  },

  async driverCheckIn(shiftId, driverId, busId) {
    // ADD_API → 
    // 1. Update shift status to checked_in
    // 2. Transfer parcels responsibility to this driver
    // 3. Write responsibility_logs
    console.log("ADD_API [Supabase]: driverCheckIn", shiftId, driverId);
    return { success: true };
  },

  async driverCheckOut(shiftId, driverId) {
    // ADD_API → Update shifts SET status='checked_out'
    console.log("ADD_API [Supabase]: driverCheckOut", shiftId);
    return { success: true };
  },

  // =====================================================
  // SUPABASE – PARCELS
  // =====================================================
  async createParcel(parcelData) {
    // ADD_API →
    // const trackingId = await generate_tracking_id() // or call RPC
    // const { data, error } = await supabase.from('parcels').insert({...}).select()
    console.log("ADD_API [Supabase]: createParcel", parcelData);
    return { 
      trackingId: "RP-" + (10000 + Math.floor(Math.random()*90000)), 
      otp: String(1000 + Math.floor(Math.random()*9000)) 
    };
  },

  async getParcelByTrackingId(trackingId) {
    // ADD_API →
    // const { data } = await supabase.from('parcels').select('*').eq('tracking_id', trackingId).single()
    console.log("ADD_API [Supabase]: getParcelByTrackingId", trackingId);
    return null;
  },

  async updateParcelStatus(parcelId, newStatus, note = "") {
    // ADD_API → Update parcels + insert into parcel_status_logs
    console.log("ADD_API [Supabase]: updateParcelStatus", parcelId, newStatus);
    return { success: true };
  },

  async uploadPhoto(parcelId, file, type = "pickup") {
    // ADD_API → Supabase Storage
    // const path = `parcels/${parcelId}/${type}.jpg`
    // const { data } = await supabase.storage.from('proofs').upload(path, file)
    // Then save public URL to parcels.pickup_photo_url or delivery_photo_url
    console.log("ADD_API [Supabase]: uploadPhoto", parcelId, type);
    return { url: "https://example.com/photo.jpg" };
  },

  // =====================================================
  // GOOGLE MAPS – LIVE LOCATION
  // =====================================================
  async updateDriverLocation(tripId, lat, lng) {
    // ADD_API → Save to Supabase trips table
    // await supabase.from('trips').update({
    //   current_lat: lat,
    //   current_lng: lng,
    //   last_location_at: new Date().toISOString()
    // }).eq('id', tripId)
    console.log("ADD_API [Google+Supabase]: updateDriverLocation", tripId, lat, lng);
    return { success: true };
  },

  startWatchingDriverLocation(tripId) {
    // ADD_API → Browser Geolocation + send to backend every 8-10 sec
    /*
    navigator.geolocation.watchPosition(
      (pos) => {
        this.updateDriverLocation(tripId, pos.coords.latitude, pos.coords.longitude)
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 15000 }
    )
    */
    console.log("ADD_API [Google]: startWatchingDriverLocation", tripId);
  },

  async getETA(originLat, originLng, destLat, destLng) {
    // ADD_API → Google Distance Matrix API
    /*
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?
      origins=${originLat},${originLng}
      &destinations=${destLat},${destLng}
      &key=${CONFIG.GOOGLE_MAPS_KEY}`
    const res = await fetch(url)
    const data = await res.json()
    return data.rows[0].elements[0]
    */
    console.log("ADD_API [Google]: getETA");
    return { duration: "42 mins", distance: "68 km" };
  },

  loadGoogleMaps(callback) {
    // ADD_API → Load Google Maps JS SDK
    /*
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_KEY}&callback=initMap`
    script.async = true
    document.head.appendChild(script)
    window.initMap = callback
    */
    console.log("ADD_API [Google]: loadGoogleMaps");
  },

  // =====================================================
  // RAZORPAY – PAYMENTS
  // =====================================================
  async createOrder(amountInPaise, receipt) {
    // ADD_API → This must be done from a backend/server
    // Never put Razorpay Key Secret in frontend
    // Call your own server endpoint that creates the order
    console.log("ADD_API [Razorpay]: createOrder", amountInPaise);
    return { orderId: "order_demo_" + Date.now() };
  },

  openRazorpayCheckout({ orderId, amount, name, description, onSuccess }) {
    // ADD_API → Razorpay Checkout
    /*
    const options = {
      key: CONFIG.RAZORPAY_KEY_ID,
      amount: amount,
      currency: "INR",
      name: "Red Parcel",
      description: description,
      order_id: orderId,
      handler: function (response) {
        onSuccess(response)
      },
      theme: { color: "#E30613" }
    }
    const rzp = new Razorpay(options)
    rzp.open()
    */
    console.log("ADD_API [Razorpay]: openCheckout", orderId);
    // For demo we simulate success
    if (onSuccess) onSuccess({ razorpay_payment_id: "pay_demo_123" });
  },

  async verifyPayment(paymentId, orderId, signature) {
    // ADD_API → Must be done on backend using Key Secret
    console.log("ADD_API [Razorpay]: verifyPayment", paymentId);
    return { success: true };
  },

  // =====================================================
  // BUS OWNER HELPERS
  // =====================================================
  async createShift(busId, driverId, date, startTime, endTime) {
    // ADD_API → supabase.from('shifts').insert({...})
    console.log("ADD_API [Supabase]: createShift", busId, driverId);
    return { success: true };
  },

  async getBusCapacity(busId) {
    // ADD_API → Calculate remaining slots
    console.log("ADD_API [Supabase]: getBusCapacity", busId);
    return { total: 25, used: 4, remaining: 21 };
  }
};

// Make available globally
window.RED_PARCEL_API = API;

console.log("Red Parcel API Structure loaded. Replace all // ADD_API sections with real code.");
