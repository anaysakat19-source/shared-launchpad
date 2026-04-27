-- ============================================================
-- DIETITIAN PROFILES
-- ============================================================
CREATE TABLE public.dietitian_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE, -- nullable so we can seed demo profiles without auth users
  full_name text NOT NULL,
  photo_url text,
  specialty text NOT NULL,
  years_experience integer NOT NULL DEFAULT 0,
  education text NOT NULL,
  certifications text[],
  languages text[],
  location text,
  bio text NOT NULL,
  hourly_rate_inr integer,
  contact_email text NOT NULL,
  contact_phone text,
  website text,
  rating numeric(3,2) DEFAULT 4.5,
  is_available boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dietitian_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view dietitian directory
CREATE POLICY "Authenticated users can view dietitian profiles"
  ON public.dietitian_profiles FOR SELECT
  TO authenticated
  USING (true);

-- A dietitian can insert their own profile (must match auth uid and have dietitian role)
CREATE POLICY "Dietitians can create their own profile"
  ON public.dietitian_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'dietitian'::app_role)
  );

-- A dietitian can update their own profile
CREATE POLICY "Dietitians can update their own profile"
  ON public.dietitian_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- A dietitian can delete their own profile
CREATE POLICY "Dietitians can delete their own profile"
  ON public.dietitian_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER trg_dietitian_profiles_updated_at
  BEFORE UPDATE ON public.dietitian_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  dietitian_profile_id uuid NOT NULL REFERENCES public.dietitian_profiles(id) ON DELETE CASCADE,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, dietitian_profile_id)
);

CREATE INDEX idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX idx_conversations_dietitian ON public.conversations(dietitian_profile_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Helper function to check membership without recursion
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations c
    LEFT JOIN public.dietitian_profiles dp ON dp.id = c.dietitian_profile_id
    WHERE c.id = _conversation_id
      AND (c.customer_id = _user_id OR dp.user_id = _user_id)
  )
$$;

-- Customer can create a conversation for themselves
CREATE POLICY "Customers can start a conversation"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Either side can view their conversations
CREATE POLICY "Members can view their conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR dietitian_profile_id IN (
      SELECT id FROM public.dietitian_profiles WHERE user_id = auth.uid()
    )
  );

-- Either side can update last_message_at
CREATE POLICY "Members can update their conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR dietitian_profile_id IN (
      SELECT id FROM public.dietitian_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view messages in their conversation"
  ON public.messages FOR SELECT
  TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Members can send messages in their conversation"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_member(conversation_id, auth.uid())
  );

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- ============================================================
-- SEED 8 DEMO DIETITIANS
-- ============================================================
INSERT INTO public.dietitian_profiles
  (full_name, photo_url, specialty, years_experience, education, certifications, languages, location, bio, hourly_rate_inr, contact_email, contact_phone, website, rating, is_demo)
VALUES
  ('Dr. Ananya Sharma', NULL, 'Weight Management & PCOS', 9, 'M.Sc. Clinical Nutrition, AIIMS Delhi', ARRAY['Registered Dietitian (RD)','Certified Diabetes Educator'], ARRAY['English','Hindi'], 'New Delhi, India', 'Nine years helping women navigate PCOS, thyroid and sustainable weight loss with food-first plans rooted in Indian kitchens.', 1500, 'ananya.sharma@example.com', '+91 98100 11122', 'https://ananyanutrition.example.com', 4.9, true),
  ('Rohan Verma', NULL, 'Sports Nutrition', 7, 'M.Sc. Sports Nutrition, IGNOU', ARRAY['ISSN Certified Sports Nutritionist','ACE Certified'], ARRAY['English','Hindi','Punjabi'], 'Mumbai, India', 'Works with amateur athletes, lifters and runners on performance fueling, recovery and clean bulks.', 1800, 'rohan.verma@example.com', '+91 99220 33445', NULL, 4.7, true),
  ('Dr. Meera Iyer', NULL, 'Diabetes & Cardiac Nutrition', 14, 'PhD Nutrition, Madras University', ARRAY['Registered Dietitian (RD)','CDE'], ARRAY['English','Tamil','Malayalam'], 'Chennai, India', 'Long-time clinical dietitian focused on type 2 diabetes reversal, hypertension and post-cardiac recovery diets.', 2200, 'meera.iyer@example.com', '+91 90030 55667', 'https://meeraiyer.example.com', 4.95, true),
  ('Sana Khan', NULL, 'Vegan & Plant-Based Nutrition', 5, 'B.Sc. Nutrition & Dietetics, Delhi University', ARRAY['Plant-Based Nutrition Cert. (eCornell)'], ARRAY['English','Hindi','Urdu'], 'Bengaluru, India', 'Helps families switch to balanced plant-based eating without breaking budgets or losing flavor.', 1200, 'sana.khan@example.com', '+91 98456 77889', NULL, 4.6, true),
  ('Aditya Nair', NULL, 'Gut Health & IBS', 8, 'M.Sc. Food & Nutrition, MS University Baroda', ARRAY['Monash Low-FODMAP Certified'], ARRAY['English','Hindi','Marathi'], 'Pune, India', 'Specializes in IBS, bloating and gut-brain axis using low-FODMAP and elimination protocols.', 1700, 'aditya.nair@example.com', '+91 98223 11000', 'https://gutwise.example.com', 4.8, true),
  ('Priya Deshmukh', NULL, 'Pregnancy & Postnatal Nutrition', 11, 'M.Sc. Maternal & Child Nutrition, SNDT Mumbai', ARRAY['Certified Lactation Counselor'], ARRAY['English','Hindi','Marathi'], 'Mumbai, India', 'Guides moms through pregnancy, postnatal recovery and weaning with culturally rooted meal plans.', 1600, 'priya.d@example.com', '+91 98677 44321', NULL, 4.85, true),
  ('Dr. Karan Bhatia', NULL, 'Kidney & Renal Nutrition', 13, 'PhD Clinical Nutrition, PGIMER Chandigarh', ARRAY['Renal Dietitian Specialist (CSR)'], ARRAY['English','Hindi','Punjabi'], 'Chandigarh, India', 'Renal-focused dietitian working with CKD patients, dialysis nutrition and post-transplant care.', 2500, 'karan.bhatia@example.com', '+91 99114 22000', 'https://renalcare.example.com', 4.9, true),
  ('Neha Gupta', NULL, 'Child & Adolescent Nutrition', 6, 'M.Sc. Pediatric Nutrition, Lady Irwin College', ARRAY['Certified Pediatric Nutritionist'], ARRAY['English','Hindi'], 'Jaipur, India', 'Picky-eater rescues, healthy lunchboxes and adolescent weight & confidence plans.', 1100, 'neha.gupta@example.com', '+91 98290 65432', NULL, 4.75, true);
