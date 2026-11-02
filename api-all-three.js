/**
 * =====================================================
 * Red Parcel v4 – ALL THREE APIs READY
 * =====================================================
 * Supabase + Google Maps + Razorpay
 * 
 * HOW TO USE:
 * 1. Create config.js from config-v4.example.js and paste your keys
 * 2. Add these scripts in index.html <head>:
 *    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
 *    <script src="config.js"></script>
 *    <script src="api-all-three.js"></script>
 * 3. Done
 * =====================================================
 */

const CONFIG = window.RED_PARCEL_CONFIG || {
  SUPABASE_URL: "PASTE_SUPABASE_URL",
  SUPABASE_ANON_KEY: "PASTE_SUPABASE_ANON_KEY",
  GOOGLE_MAPS_KEY: "PASTE_GOOGLE_MAPS_KEY",
  RAZORPAY_KEY_ID: "PASTE_RAZORPAY_KEY_ID"
};

// =====================================================
// 1. SUPABASE
// =====================================================
let supabase = null;

function initSupabase() {
  if (typeof window.supabase !== "undefined" && CONFIG.SUPABASE_URL && !CONFIG.SUPABASE_URL.includes("PASTE")) {
    supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    console.log("✅ Supabase connected");
    return true;
  }
  console.warn("⚠️ Supabase not ready – check config.js");
  return false;
}

// =====================================================
// 2. GOOGLE MAPS
// =====================================================
function loadGoogleMaps(callback) {
  if (window.google && window.google.maps) {
    if (callback) callback();
    return;
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    console.log("✅ Google Maps loaded");
    if (callback) callback();
  };
  script.onerror = () => console.error("❌ Google Maps failed to load – check API key");
  document.head.appendChild(script);
}

// =====================================================
// 3. RAZORPAY
// =====================================================
function openRazorpayPayment({ amount, name, description, trackingId, onSuccess, onFailure }) {
  if (typeof Razorpay === "undefined") {
    alert("Razorpay not loaded. Check internet / script.");
    return;
  }

  const options = {
    key: CONFIG.RAZORPAY_KEY_ID,
    amount: amount * 100, // in paise
    currency: "INR",
    name: "Red Parcel",
    description: description || "Parcel booking",
    image: "red-parcel-logo.png",
    prefill: {
      name: name || "",
      contact: ""
    },
    notes: {
      tracking_id: trackingId || ""
    },
    theme: {
      color: "#E30613"
    },
    handler: function (response) {
      console.log("✅ Payment success", response);
      if (onSuccess) onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        if (onFailure) onFailure("Payment cancelled");
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.on("payment.failed", function (response) {
    console.error("❌ Payment failed", response);
    if (onFailure) onFailure(response.error);
  });
  rzp.open();
}

// =====================================================
// MAIN API OBJECT
// =====================================================
const API = {

  // ---------- SUPABASE: PARCELS ----------
  async createParcel(data) {
    if (!supabase) initSupabase();
    if (!supabase) {
      // Fallback demo mode
      const id = "RP-" + (10000 + Math.floor(Math.random() * 90000));
      return { trackingId: id, otp: "4821", demo: true };
    }

    const trackingId = "RP-" + (10000 + Math.floor(Math.random() * 90000));
    const otp = String(1000 + Math.floor(Math.random() * 9000));

    const { data: row, error } = await supabase.from("parcels").insert({
      tracking_id: trackingId,
      receiver_name: data.receiverName,
      receiver_phone: data.receiverPhone,
      pickup_stop: data.from,
      drop_stop: data.to,
      fare: data.fare || 80,
      delivery_otp: otp,
      status: "booking_confirmed",
      payment_status: "paid"
    }).select().single();

    if (error) {
      console.error("Supabase error:", error);
      return { trackingId, otp, demo: true, error };
    }
    return { trackingId, otp, data: row };
  },

  async getParcel(trackingId) {
    if (!supabase) initSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("tracking_id", trackingId)
      .single();
    if (error) return null;
    return data;
  },

  async updateParcelStatus(trackingId, status) {
    if (!supabase) initSupabase();
    if (!supabase) return { success: true, demo: true };
    const { error } = await supabase
      .from("parcels")
      .update({ status })
      .eq("tracking_id", trackingId);
    return { success: !error };
  },

  // ---------- SUPABASE: CHECK-IN ----------
  async driverCheckIn(driverId, busId) {
    if (!supabase) initSupabase();
    console.log("Driver Check-in", driverId, busId);
    // ADD real shift update here when shifts table is ready
    return { success: true };
  },

  // ---------- GOOGLE MAPS: LOCATION ----------
  startLiveLocation(tripId, onUpdate) {
    if (!navigator.geolocation) {
      alert("GPS not supported on this device");
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log("📍 Location:", lat, lng);

        // Save to Supabase if connected
        if (supabase && tripId) {
          supabase.from("trips").update({
            current_lat: lat,
            current_lng: lng,
            last_location_at: new Date().toISOString()
          }).eq("id", tripId).then();
        }

        if (onUpdate) onUpdate({ lat, lng });
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 15000 }
    );

    return watchId;
  },

  stopLiveLocation(watchId) {
    if (watchId) navigator.geolocation.clearWatch(watchId);
  },

  // ---------- RAZORPAY ----------
  payForParcel({ amount, receiverName, trackingId, onSuccess }) {
    openRazorpayPayment({
      amount: amount || 80,
      name: receiverName,
      description: `Red Parcel – ${trackingId || "Booking"}`,
      trackingId,
      onSuccess: (response) => {
        console.log("Payment ID:", response.razorpay_payment_id);
        if (onSuccess) onSuccess(response);
      },
      onFailure: (err) => {
        alert("Payment failed or cancelled");
        console.error(err);
      }
    });
  }
};

// Init
window.RED_PARCEL_API = API;
window.loadGoogleMaps = loadGoogleMaps;
window.openRazorpayPayment = openRazorpayPayment;

// Auto init Supabase when possible
setTimeout(() => {
  initSupabase();
}, 500);

console.log("✅ Red Parcel – All Three APIs loaded (Supabase + Google Maps + Razorpay)");
