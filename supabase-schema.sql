-- =====================================================
-- Red Parcel - Supabase Database Schema
-- Priority 1 + Priority 2 features
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- for location (optional but recommended)

-- =====================================================
-- 1. USERS & ROLES
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT UNIQUE,
  role TEXT CHECK (role IN ('sender', 'receiver', 'driver', 'bus_owner', 'admin')) DEFAULT 'sender',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. BUS OWNERS & FLEET
-- =====================================================

CREATE TABLE bus_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  company_name TEXT NOT NULL,
  subscription_plan TEXT CHECK (subscription_plan IN ('starter', 'pro', 'business')) DEFAULT 'starter',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES bus_owners(id) ON DELETE CASCADE,
  registration_number TEXT UNIQUE NOT NULL,
  bus_name TEXT,
  capacity_parcels INT DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  owner_id UUID REFERENCES bus_owners(id),
  license_number TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES bus_owners(id),
  name TEXT NOT NULL,                    -- e.g. "Indore → Bhopal"
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  stops JSONB DEFAULT '[]',              -- array of {name, lat, lng, order}
  distance_km NUMERIC,
  estimated_duration_mins INT,
  base_fare NUMERIC DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TRIPS (live bus journeys)
-- =====================================================

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID REFERENCES buses(id),
  driver_id UUID REFERENCES drivers(id),
  route_id UUID REFERENCES routes(id),
  status TEXT CHECK (status IN ('scheduled', 'boarding', 'in_transit', 'completed', 'cancelled')) DEFAULT 'scheduled',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  current_lat NUMERIC,
  current_lng NUMERIC,
  last_location_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time location history (optional, for analytics)
CREATE TABLE trip_locations (
  id BIGSERIAL PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  speed NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast latest location lookup
CREATE INDEX idx_trip_locations_trip_time ON trip_locations(trip_id, recorded_at DESC);

-- =====================================================
-- 4. PARCEL BOOKINGS (core)
-- =====================================================

CREATE TABLE parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id TEXT UNIQUE NOT NULL,      -- e.g. RP-10245
  sender_id UUID REFERENCES profiles(id),
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  pickup_stop TEXT NOT NULL,
  drop_stop TEXT NOT NULL,
  trip_id UUID REFERENCES trips(id),
  route_id UUID REFERENCES routes(id),
  
  status TEXT CHECK (status IN (
    'booking_confirmed',
    'awaiting_pickup',
    'parcel_onboard',
    'in_transit',
    'arrived',
    'delivered',
    'cancelled'
  )) DEFAULT 'booking_confirmed',
  
  fare NUMERIC NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  payment_id TEXT,                       -- Razorpay payment id
  
  pickup_otp TEXT,                       -- optional
  delivery_otp TEXT NOT NULL,            -- 4-digit OTP for receiver
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Generate tracking ID helper (use in app or trigger)
-- Example format: RP- + 5 digit number

CREATE INDEX idx_parcels_tracking ON parcels(tracking_id);
CREATE INDEX idx_parcels_sender ON parcels(sender_id);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_trip ON parcels(trip_id);

-- =====================================================
-- 5. STATUS HISTORY (audit trail)
-- =====================================================

CREATE TABLE parcel_status_logs (
  id BIGSERIAL PRIMARY KEY,
  parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. NOTIFICATIONS (optional log)
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  parcel_id UUID REFERENCES parcels(id),
  channel TEXT CHECK (channel IN ('sms', 'whatsapp', 'push', 'in_app')),
  title TEXT,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ROW LEVEL SECURITY (basic)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Example policies (customize as needed)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Senders can view own parcels"
  ON parcels FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Drivers can view parcels on their trip"
  ON parcels FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    ))
  );

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Generate next tracking ID (simple sequence style)
CREATE SEQUENCE parcel_tracking_seq START 10001;

CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RP-' || nextval('parcel_tracking_seq');
END;
$$ LANGUAGE plpgsql;

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parcels_updated_at
  BEFORE UPDATE ON parcels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- READY FOR:
-- - Real-time location via Supabase Realtime on `trips`
-- - Auth via Supabase Auth (phone OTP recommended)
-- - Storage for any future documents
-- =====================================================
