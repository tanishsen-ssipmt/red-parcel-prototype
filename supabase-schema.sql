-- =====================================================
-- Red Parcel Version 4 Schema
-- Adds: Shifts, Check-in/Check-out, Responsibility,
-- Photo Proofs, Capacity, Multi-driver support
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== PROFILES =====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT UNIQUE,
  role TEXT CHECK (role IN ('sender','receiver','driver','bus_owner','admin')) DEFAULT 'sender',
  city TEXT,
  state TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== BUS OWNERS =====================
CREATE TABLE IF NOT EXISTS bus_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  company_name TEXT NOT NULL,
  upi_id TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('starter','pro','business')) DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== BUSES =====================
CREATE TABLE IF NOT EXISTS buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES bus_owners(id) ON DELETE CASCADE,
  registration_number TEXT UNIQUE NOT NULL,
  bus_name TEXT,
  from_city TEXT,
  to_city TEXT,
  capacity_parcels INT DEFAULT 25,
  image_front_url TEXT,
  image_side_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== DRIVERS =====================
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  owner_id UUID REFERENCES bus_owners(id),
  license_number TEXT,
  photo_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== SHIFTS (NEW in V4) =====================
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT CHECK (status IN ('scheduled','checked_in','checked_out','missed','cancelled')) DEFAULT 'scheduled',
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shifts_bus_date ON shifts(bus_id, shift_date);
CREATE INDEX idx_shifts_driver ON shifts(driver_id, shift_date);

-- ===================== ROUTES =====================
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES bus_owners(id),
  name TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  stops JSONB DEFAULT '[]',
  base_fare NUMERIC DEFAULT 60,
  is_active BOOLEAN DEFAULT true
);

-- ===================== TRIPS =====================
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID REFERENCES buses(id),
  route_id UUID REFERENCES routes(id),
  current_shift_id UUID REFERENCES shifts(id),   -- who is responsible now
  status TEXT DEFAULT 'scheduled',
  current_lat NUMERIC,
  current_lng NUMERIC,
  last_location_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ===================== PARCELS =====================
CREATE SEQUENCE IF NOT EXISTS parcel_tracking_seq START 10001;

CREATE TABLE IF NOT EXISTS parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id TEXT UNIQUE NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  pickup_stop TEXT NOT NULL,
  drop_stop TEXT NOT NULL,
  trip_id UUID REFERENCES trips(id),
  bus_id UUID REFERENCES buses(id),
  current_responsible_driver_id UUID REFERENCES drivers(id),  -- NEW
  status TEXT DEFAULT 'booking_confirmed',
  fare NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  razorpay_payment_id TEXT,
  delivery_otp TEXT NOT NULL,
  pickup_photo_url TEXT,          -- NEW
  delivery_photo_url TEXT,        -- NEW
  capacity_used INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RP-' || nextval('parcel_tracking_seq');
END;
$$ LANGUAGE plpgsql;

-- ===================== PARCEL STATUS LOGS =====================
CREATE TABLE IF NOT EXISTS parcel_status_logs (
  id BIGSERIAL PRIMARY KEY,
  parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== RESPONSIBILITY TRANSFER LOG (NEW) =====================
CREATE TABLE responsibility_logs (
  id BIGSERIAL PRIMARY KEY,
  parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE,
  from_driver_id UUID REFERENCES drivers(id),
  to_driver_id UUID REFERENCES drivers(id),
  shift_id UUID REFERENCES shifts(id),
  reason TEXT DEFAULT 'shift_change',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== HELPERS =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
EOF
