/**
 * Red Parcel Version 4 – API Structure
 * ------------------------------------
 * This file shows the endpoints and the exact places
 * where you need to connect real backend calls.
 *
 * Search for:  // ADD_API
 * Replace the mock/simulated part with real Supabase / Razorpay / Google calls.
 */

const API = {

  // =====================================================
  // AUTH
  // =====================================================
  async loginWithPhone(phone, otp) {
    // ADD_API → Supabase Auth phone OTP verify
    console.log("ADD_API: loginWithPhone", phone, otp);
    return { success: true, user: { id: "demo-user", phone } };
  },

  async sendOtp(phone) {
    // ADD_API → Supabase Auth or MSG91
    console.log("ADD_API: sendOtp", phone);
    return { success: true };
  },

  // =====================================================
  // SHIFTS & CHECK-IN (Core of V4)
  // =====================================================
  async getTodayShifts(busId) {
    // ADD_API → SELECT * FROM shifts WHERE bus_id = ? AND shift_date = today
    console.log("ADD_API: getTodayShifts", busId);
    return [];
  },

  async driverCheckIn(shiftId, driverId) {
    // ADD_API → 
    // 1. Update shifts SET status='checked_in', checked_in_at=now()
    // 2. Transfer all active parcels on that bus to this driver
    // 3. Insert into responsibility_logs
    console.log("ADD_API: driverCheckIn", shiftId, driverId);
    return { success: true };
  },

  async driverCheckOut(shiftId, driverId) {
    // ADD_API → Update shifts SET status='checked_out', checked_out_at=now()
    console.log("ADD_API: driverCheckOut", shiftId, driverId);
    return { success: true };
  },

  // =====================================================
  // PARCELS
  // =====================================================
  async createParcel(data) {
    // ADD_API → INSERT into parcels + generate tracking_id + delivery_otp
    console.log("ADD_API: createParcel", data);
    return { trackingId: "RP-10245", otp: "4821" };
  },

  async getParcelByTrackingId(trackingId) {
    // ADD_API → SELECT * FROM parcels WHERE tracking_id = ?
    console.log("ADD_API: getParcelByTrackingId", trackingId);
    return null;
  },

  async updateParcelStatus(parcelId, newStatus, note) {
    // ADD_API → UPDATE parcels + INSERT parcel_status_logs
    console.log("ADD_API: updateParcelStatus", parcelId, newStatus);
    return { success: true };
  },

  async uploadPickupPhoto(parcelId, file) {
    // ADD_API → Upload to Supabase Storage → save URL in parcels.pickup_photo_url
    console.log("ADD_API: uploadPickupPhoto", parcelId);
    return { url: "https://example.com/pickup.jpg" };
  },

  async uploadDeliveryPhoto(parcelId, file) {
    // ADD_API → Upload to Supabase Storage → save URL in parcels.delivery_photo_url
    console.log("ADD_API: uploadDeliveryPhoto", parcelId);
    return { url: "https://example.com/delivery.jpg" };
  },

  // =====================================================
  // LIVE LOCATION
  // =====================================================
  async updateDriverLocation(tripId, lat, lng) {
    // ADD_API → UPDATE trips SET current_lat, current_lng, last_location_at
    console.log("ADD_API: updateDriverLocation", tripId, lat, lng);
    return { success: true };
  },

  async subscribeToTripLocation(tripId, callback) {
    // ADD_API → Supabase Realtime channel on trips table
    console.log("ADD_API: subscribeToTripLocation", tripId);
    // Example:
    // supabase.channel('trip-'+tripId).on('postgres_changes', {...}, callback).subscribe();
  },

  // =====================================================
  // PAYMENTS (Razorpay)
  // =====================================================
  async createRazorpayOrder(amount, receipt) {
    // ADD_API → Backend call to create Razorpay order (never expose secret on frontend)
    console.log("ADD_API: createRazorpayOrder", amount);
    return { orderId: "order_demo_123" };
  },

  async verifyPayment(paymentId, orderId, signature) {
    // ADD_API → Backend verification using Razorpay secret
    console.log("ADD_API: verifyPayment", paymentId);
    return { success: true };
  },

  // =====================================================
  // BUS OWNER
  // =====================================================
  async createShift(busId, driverId, date, startTime, endTime) {
    // ADD_API → INSERT into shifts
    console.log("ADD_API: createShift", busId, driverId, date);
    return { success: true };
  },

  async getBusCapacity(busId) {
    // ADD_API → capacity_parcels - count of active parcels on bus
    console.log("ADD_API: getBusCapacity", busId);
    return { total: 25, used: 4, remaining: 21 };
  }
};

// Make available for the prototype
window.RED_PARCEL_API = API;
