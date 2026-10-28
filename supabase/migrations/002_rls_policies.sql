-- KrishiConnect AI - Supabase Row Level Security (RLS) Policies
-- Protects farmer data integrity and private farm records

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_profit_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synchronization_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_observations ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: farmers can read and update their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Farms: farmers can only CRUD their own farms
CREATE POLICY "Farmers can read own farms" ON public.farms
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own farms" ON public.farms
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own farms" ON public.farms
    FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own farms" ON public.farms
    FOR DELETE USING (auth.uid() = farmer_id);

-- 3. Farm Plots: farmers can only CRUD plots belonging to their farms
CREATE POLICY "Farmers can read own plots" ON public.farm_plots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.farms
            WHERE farms.id = farm_plots.farm_id AND farms.farmer_id = auth.uid()
        )
    );

CREATE POLICY "Farmers can insert plots to own farm" ON public.farm_plots
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.farms
            WHERE farms.id = farm_plots.farm_id AND farms.farmer_id = auth.uid()
        )
    );

CREATE POLICY "Farmers can update own plots" ON public.farm_plots
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.farms
            WHERE farms.id = farm_plots.farm_id AND farms.farmer_id = auth.uid()
        )
    );

CREATE POLICY "Farmers can delete own plots" ON public.farm_plots
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.farms
            WHERE farms.id = farm_plots.farm_id AND farms.farmer_id = auth.uid()
        )
    );

-- 4. Farm Activities
CREATE POLICY "Farmers can read own activities" ON public.farm_activities
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own activities" ON public.farm_activities
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own activities" ON public.farm_activities
    FOR DELETE USING (auth.uid() = farmer_id);

-- 5. Soil Tests
CREATE POLICY "Farmers can read own soil tests" ON public.soil_tests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.farms
            WHERE farms.id = soil_tests.farm_id AND farms.farmer_id = auth.uid()
        )
    );

CREATE POLICY "Farmers can insert own soil tests" ON public.soil_tests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.farms
            WHERE farms.id = soil_tests.farm_id AND farms.farmer_id = auth.uid()
        )
    );

-- 6. Crop Assessments
CREATE POLICY "Farmers can read own crop assessments" ON public.crop_assessments
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own crop assessments" ON public.crop_assessments
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- 7. Storage Scenarios
CREATE POLICY "Farmers can read own storage scenarios" ON public.storage_scenarios
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own storage scenarios" ON public.storage_scenarios
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- 7b. Saved Profit Scenarios
CREATE POLICY "Farmers can read own profit scenarios" ON public.saved_profit_scenarios
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own profit scenarios" ON public.saved_profit_scenarios
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own profit scenarios" ON public.saved_profit_scenarios
    FOR DELETE USING (auth.uid() = farmer_id);

-- 7c. Decision Reports
CREATE POLICY "Farmers can read own decision reports" ON public.decision_reports
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own decision reports" ON public.decision_reports
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own decision reports" ON public.decision_reports
    FOR DELETE USING (auth.uid() = farmer_id);

-- 8. Notifications
CREATE POLICY "Farmers can read own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own notifications read status" ON public.notifications
    FOR UPDATE USING (auth.uid() = farmer_id);

-- 9. Crops Catalog: readable by everyone
CREATE POLICY "Crops catalog is publicly readable" ON public.crops
    FOR SELECT USING (true);

-- 10. Mandi Prices: readable by everyone
CREATE POLICY "Mandi prices are publicly readable" ON public.mandi_prices
    FOR SELECT USING (true);

-- 11. Weather observations: readable by everyone
CREATE POLICY "Weather observations are publicly readable" ON public.weather_observations
    FOR SELECT USING (true);
