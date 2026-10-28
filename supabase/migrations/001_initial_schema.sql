-- KrishiConnect AI - Initial PostgreSQL Schema
-- Designed for Supabase PostgreSQL with strict RLS and ownership tracking

-- 1. Profiles Table (Farmer metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'hi', -- 'hi' or 'en'
    state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
    district TEXT NOT NULL,
    sub_district_tehsil TEXT,
    village TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Farms Table
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL DEFAULT 'Main Farm',
    total_area NUMERIC(10, 2) NOT NULL,
    area_unit TEXT NOT NULL DEFAULT 'acre', -- 'acre', 'bigha', 'hectare'
    village TEXT,
    district TEXT NOT NULL DEFAULT 'Sehore',
    state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    soil_type TEXT, -- 'Black Soil / काली मिट्टी', 'Alluvial / जलोढ़', etc.
    water_source TEXT, -- 'Tubewell / नलकूप', 'Canal / नहर', 'Rainfed / वर्षा आधारित'
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Crops Catalog Table (Reference table)
CREATE TABLE IF NOT EXISTS public.crops (
    id TEXT PRIMARY KEY, -- e.g., 'soybean', 'wheat', 'chana'
    name_en TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    variety TEXT,
    season TEXT NOT NULL, -- 'Kharif', 'Rabi', 'Zaid'
    duration_days INT NOT NULL,
    ideal_ph_min NUMERIC(3, 1),
    ideal_ph_max NUMERIC(3, 1),
    water_requirement TEXT, -- 'Low', 'Medium', 'High'
    standard_msp NUMERIC(10, 2), -- Minimum Support Price (₹/Quintal)
    msp_year TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Farm Plots (Specific fields/plots within a farm)
CREATE TABLE IF NOT EXISTS public.farm_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    plot_name TEXT NOT NULL,
    plot_area NUMERIC(10, 2) NOT NULL,
    area_unit TEXT NOT NULL DEFAULT 'acre',
    current_crop_id TEXT REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_variety TEXT,
    sowing_date DATE,
    expected_harvest_date DATE,
    current_stage TEXT NOT NULL DEFAULT 'Vegetative', -- 'Sowing', 'Germination', 'Vegetative', 'Flowering', 'Maturity', 'Harvested'
    boundary_geojson JSONB, -- GeoJSON polygon for Leaflet map boundary
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Farm Activities (Field management log)
CREATE TABLE IF NOT EXISTS public.farm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES public.farm_plots(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'Sowing', 'Irrigation', 'Fertilizer', 'Pesticide', 'Harvesting', 'Weeding'
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    details TEXT,
    cost_incurred NUMERIC(10, 2) DEFAULT 0.00,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Soil Tests (Soil Health Card data)
CREATE TABLE IF NOT EXISTS public.soil_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    plot_id UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
    test_date DATE NOT NULL,
    sample_id TEXT,
    lab_name TEXT,
    ph NUMERIC(3, 1),
    electrical_conductivity NUMERIC(5, 2), -- dS/m
    organic_carbon NUMERIC(4, 2), -- %
    nitrogen_kg_ha NUMERIC(6, 2),
    phosphorus_kg_ha NUMERIC(6, 2),
    potassium_kg_ha NUMERIC(6, 2),
    sulfur_ppm NUMERIC(6, 2),
    zinc_ppm NUMERIC(6, 2),
    iron_ppm NUMERIC(6, 2),
    recommendations TEXT,
    card_document_url TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Mandi Prices (Agricultural market quotes)
CREATE TABLE IF NOT EXISTS public.mandi_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
    district TEXT NOT NULL,
    market_name TEXT NOT NULL,
    commodity TEXT NOT NULL,
    variety TEXT,
    arrival_date DATE NOT NULL,
    min_price NUMERIC(10, 2) NOT NULL, -- ₹/Quintal
    max_price NUMERIC(10, 2) NOT NULL,
    modal_price NUMERIC(10, 2) NOT NULL,
    data_source TEXT NOT NULL DEFAULT 'Agmarknet / data.gov.in',
    is_demo BOOLEAN NOT NULL DEFAULT false,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Weather Observations & Caching
CREATE TABLE IF NOT EXISTS public.weather_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district TEXT NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    observation_date DATE NOT NULL,
    temp_max NUMERIC(4, 1),
    temp_min NUMERIC(4, 1),
    precipitation_sum NUMERIC(5, 1),
    max_wind_speed NUMERIC(5, 1),
    relative_humidity_avg NUMERIC(4, 1),
    weather_code INT,
    source TEXT NOT NULL DEFAULT 'Open-Meteo',
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Crop Assessments (Crop Doctor Image & Symptom analysis)
CREATE TABLE IF NOT EXISTS public.crop_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plot_id UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    image_url TEXT,
    symptoms_description TEXT NOT NULL,
    possible_diagnoses JSONB NOT NULL, -- Array of { disease, confidence_tier, evidence, precautions, is_preliminary }
    suggested_steps TEXT[],
    requires_expert_visit BOOLEAN DEFAULT false,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Storage Scenarios (Smart Storage vs Sell Now calculations)
CREATE TABLE IF NOT EXISTS public.storage_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    current_mandi_price NUMERIC(10, 2) NOT NULL,
    storage_duration_months INT NOT NULL,
    storage_cost_per_month NUMERIC(10, 2) NOT NULL,
    expected_future_price NUMERIC(10, 2) NOT NULL,
    estimated_spoilage_rate NUMERIC(4, 2) DEFAULT 2.0, -- %
    transport_handling_cost NUMERIC(10, 2) DEFAULT 0,
    net_gain_or_loss NUMERIC(10, 2) NOT NULL,
    break_even_price NUMERIC(10, 2) NOT NULL,
    assumptions_summary TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Notifications (Weather risk alerts, price thresholds, crop stage reminders)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL, -- 'weather_risk', 'price_movement', 'crop_stage', 'sync'
    severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
    is_read BOOLEAN NOT NULL DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. Synchronization Metadata (PWA / Offline support)
CREATE TABLE IF NOT EXISTS public.synchronization_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_device_id TEXT NOT NULL,
    last_sync_timestamp TIMESTAMPTZ NOT NULL,
    pending_queue_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON public.farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farm_plots_farm_id ON public.farm_plots(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_plot_id ON public.farm_activities(plot_id);
CREATE INDEX IF NOT EXISTS idx_soil_tests_farm_id ON public.soil_tests(farm_id);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_lookup ON public.mandi_prices(state, district, commodity, arrival_date);
CREATE INDEX IF NOT EXISTS idx_notifications_farmer_id ON public.notifications(farmer_id, is_read);
