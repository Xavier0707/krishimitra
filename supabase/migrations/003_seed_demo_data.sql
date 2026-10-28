-- KrishiConnect AI - Seed Data (Madhya Pradesh Agricultural Profile)
-- Clearly labelled as demo/reference records

-- Crops Reference Data (Key MP Kharif and Rabi crops)
INSERT INTO public.crops (id, name_en, name_hi, variety, season, duration_days, ideal_ph_min, ideal_ph_max, water_requirement, standard_msp, msp_year)
VALUES
    ('soybean', 'Soybean', 'सोयाबीन', 'JS 20-34 / JS 95-60', 'Kharif', 95, 6.0, 7.5, 'Medium', 4892.00, '2024-25'),
    ('wheat_sharbati', 'Wheat (Sharbati)', 'गेहूं (शरबती)', 'C-306 / Sujata', 'Rabi', 125, 6.0, 7.5, 'Medium', 2425.00, '2024-25'),
    ('chana_gram', 'Bengal Gram (Chana)', 'चना (देशी)', 'JG 14 / JAKI 9218', 'Rabi', 110, 6.0, 7.5, 'Low', 5650.00, '2024-25'),
    ('garlic', 'Garlic', 'लहसुन', 'G-282 / Amleta', 'Rabi', 135, 6.5, 7.8, 'Medium', 4500.00, '2024-25'),
    ('mustard', 'Mustard', 'सरसों', 'Pusa Bold / NRCHB 101', 'Rabi', 115, 6.0, 7.5, 'Low', 5950.00, '2024-25'),
    ('maize', 'Maize', 'मक्का', 'HQPM 1 / Bio 9681', 'Kharif', 100, 5.8, 7.2, 'Medium', 2225.00, '2024-25'),
    ('cotton', 'Cotton', 'कपास', 'Bt Cotton Hybrid', 'Kharif', 160, 6.0, 8.0, 'High', 7521.00, '2024-25'),
    ('onion', 'Onion', 'प्याज', 'Nasik Red / AgriFound Light Red', 'Rabi', 120, 6.2, 7.5, 'Medium', 2100.00, '2024-25')
ON CONFLICT (id) DO UPDATE SET
    standard_msp = EXCLUDED.standard_msp,
    variety = EXCLUDED.variety;

-- Realistic Mandi Benchmark Data for MP (for seeding & offline verification)
INSERT INTO public.mandi_prices (state, district, market_name, commodity, variety, arrival_date, min_price, max_price, modal_price, data_source, is_demo)
VALUES
    ('Madhya Pradesh', 'Sehore', 'Sehore Mandi', 'Soybean', 'Yellow', CURRENT_DATE, 4350.00, 4820.00, 4650.00, 'Demo Seed / Agmarknet Benchmark', true),
    ('Madhya Pradesh', 'Sehore', 'Astha Mandi', 'Soybean', 'Yellow', CURRENT_DATE, 4400.00, 4850.00, 4680.00, 'Demo Seed / Agmarknet Benchmark', true),
    ('Madhya Pradesh', 'Indore', 'Indore (F&V)', 'Garlic', 'Deshi', CURRENT_DATE, 11500.00, 18500.00, 15200.00, 'Demo Seed / Agmarknet Benchmark', true),
    ('Madhya Pradesh', 'Indore', 'Indore Mandi', 'Soybean', 'Yellow', CURRENT_DATE, 4420.00, 4900.00, 4710.00, 'Demo Seed / Agmarknet Benchmark', true),
    ('Madhya Pradesh', 'Vidisha', 'Vidisha Mandi', 'Wheat', 'Sharbati', CURRENT_DATE, 2850.00, 3650.00, 3250.00, 'Demo Seed / Agmarknet Benchmark', true),
    ('Madhya Pradesh', 'Vidisha', 'Ganjbasoda Mandi', 'Gram (Chana)', 'Deshi', CURRENT_DATE, 5700.00, 6400.00, 6150.00, 'Demo Seed / Agmarknet Benchmark', true),
    ('Madhya Pradesh', 'Ujjain', 'Ujjain Mandi', 'Soybean', 'Yellow', CURRENT_DATE, 4380.00, 4800.00, 4620.00, 'Demo Seed / Agmarknet Benchmark', true),
    ('Madhya Pradesh', 'Hoshangabad', 'Itarsi Mandi', 'Wheat', 'Lokwan', CURRENT_DATE, 2350.00, 2600.00, 2480.00, 'Demo Seed / Agmarknet Benchmark', true),
    ('Madhya Pradesh', 'Khandwa', 'Khandwa Mandi', 'Cotton', 'Medium Staple', CURRENT_DATE, 6800.00, 7650.00, 7350.00, 'Demo Seed / Agmarknet Benchmark', true)
ON CONFLICT DO NOTHING;
