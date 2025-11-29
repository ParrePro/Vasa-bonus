-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.reward_purchases CASCADE;
DROP TABLE IF EXISTS public.reward_classes CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TABLE IF EXISTS public.points_transactions CASCADE;
DROP TABLE IF EXISTS public.class_members CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.default_point_reasons CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.generate_class_code() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_class_member(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_class_mentor(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create schools table
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Function to generate school codes
CREATE OR REPLACE FUNCTION public.generate_school_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.schools WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Recreate profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate user_roles table with school_id
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role app_role NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recreate classes table with school_id
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Function to generate class codes
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM public.classes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Recreate class_members table
CREATE TABLE public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_teacher BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, user_id)
);

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Recreate points_transactions table
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Recreate rewards table
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  duration_type TEXT,
  duration_days INTEGER,
  category TEXT NOT NULL,
  image_url TEXT,
  purchase_limit_type TEXT DEFAULT 'unlimited',
  purchase_limit_count INTEGER,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Recreate reward_classes table
CREATE TABLE public.reward_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(reward_id, class_id)
);

ALTER TABLE public.reward_classes ENABLE ROW LEVEL SECURITY;

-- Recreate reward_purchases table
CREATE TABLE public.reward_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMPTZ DEFAULT now(),
  fulfilled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.reward_purchases ENABLE ROW LEVEL SECURITY;

-- Recreate messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  student_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  message TEXT NOT NULL,
  reward_purchase_id UUID REFERENCES public.reward_purchases(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Recreate default_point_reasons table
CREATE TABLE public.default_point_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.default_point_reasons ENABLE ROW LEVEL SECURITY;

-- Recreate has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Recreate is_class_member function
CREATE OR REPLACE FUNCTION public.is_class_member(_user_id UUID, _class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_members
    WHERE user_id = _user_id AND class_id = _class_id
  )
$$;

-- Recreate is_class_mentor function
CREATE OR REPLACE FUNCTION public.is_class_mentor(_user_id UUID, _class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes
    WHERE id = _class_id AND mentor_id = _user_id
  )
$$;

-- Function to check if user is developer
CREATE OR REPLACE FUNCTION public.is_developer(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'developer'
  )
$$;

-- Function to get user's school
CREATE OR REPLACE FUNCTION public.get_user_school(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id
  FROM public.user_roles
  WHERE user_id = _user_id AND role = 'teacher'
  LIMIT 1
$$;

-- RLS Policies for schools
CREATE POLICY "Developers can create schools"
  ON public.schools FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers can view all schools"
  ON public.schools FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Teachers can view their school"
  ON public.schools FOR SELECT
  TO authenticated
  USING (id IN (SELECT school_id FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher'));

CREATE POLICY "Anyone can view schools by code"
  ON public.schools FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for classes
CREATE POLICY "Teachers can create classes in their school"
  ON public.classes FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'teacher') 
    AND mentor_id = auth.uid()
    AND school_id = get_user_school(auth.uid())
  );

CREATE POLICY "Anyone can view classes to join them"
  ON public.classes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mentors can delete their classes"
  ON public.classes FOR DELETE
  TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Developers can view all classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'developer'));

-- RLS Policies for class_members
CREATE POLICY "Students can join classes"
  ON public.class_members FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'student')
    AND user_id = auth.uid()
    AND is_teacher = false
  );

CREATE POLICY "Teachers can join classes as co-teachers"
  ON public.class_members FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'teacher')
    AND user_id = auth.uid()
    AND is_teacher = true
  );

CREATE POLICY "Teachers can add members"
  ON public.class_members FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'teacher')
    AND EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = class_members.class_id
      AND mentor_id = auth.uid()
    )
  );

CREATE POLICY "Users can view class members"
  ON public.class_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_class_member(auth.uid(), class_id)
    OR is_class_mentor(auth.uid(), class_id)
    OR has_role(auth.uid(), 'developer')
  );

CREATE POLICY "Mentors can remove members"
  ON public.class_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = class_members.class_id
      AND mentor_id = auth.uid()
    )
  );

-- RLS Policies for points_transactions
CREATE POLICY "Teachers can give points"
  ON public.points_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'teacher')
    AND teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.class_members
      WHERE class_id = points_transactions.class_id
      AND user_id = auth.uid()
      AND is_teacher = true
    )
  );

CREATE POLICY "Students can view their own points"
  ON public.points_transactions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view class points"
  ON public.points_transactions FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'teacher')
    AND EXISTS (
      SELECT 1 FROM public.class_members
      WHERE class_id = points_transactions.class_id
      AND user_id = auth.uid()
      AND is_teacher = true
    )
  );

CREATE POLICY "Developers can view all points"
  ON public.points_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers can edit points"
  ON public.points_transactions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers can delete points"
  ON public.points_transactions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'developer'));

-- RLS Policies for rewards
CREATE POLICY "Mentors or teachers can create rewards"
  ON public.rewards FOR INSERT
  TO authenticated
  WITH CHECK (
    is_class_mentor(auth.uid(), class_id)
    OR EXISTS (
      SELECT 1 FROM public.class_members cm
      WHERE cm.class_id = rewards.class_id
      AND cm.user_id = auth.uid()
      AND cm.is_teacher = true
    )
  );

CREATE POLICY "Class members can view rewards"
  ON public.rewards FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.reward_classes rc
      WHERE rc.reward_id = rewards.id
      AND (is_class_member(auth.uid(), rc.class_id) OR is_class_mentor(auth.uid(), rc.class_id))
    )
    OR has_role(auth.uid(), 'developer')
  );

CREATE POLICY "Teachers can update their rewards"
  ON public.rewards FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Teachers can delete their rewards"
  ON public.rewards FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for reward_classes
CREATE POLICY "Teachers can add reward to classes"
  ON public.reward_classes FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'teacher')
    AND is_class_mentor(auth.uid(), class_id)
  );

CREATE POLICY "Class members can view reward classes"
  ON public.reward_classes FOR SELECT
  TO authenticated
  USING (
    is_class_member(auth.uid(), class_id)
    OR is_class_mentor(auth.uid(), class_id)
    OR has_role(auth.uid(), 'developer')
  );

CREATE POLICY "Teachers can remove reward from classes"
  ON public.reward_classes FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(), 'teacher')
    AND EXISTS (
      SELECT 1 FROM public.rewards
      WHERE id = reward_classes.reward_id
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for reward_purchases
CREATE POLICY "Students can purchase rewards"
  ON public.reward_purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'student')
    AND student_id = auth.uid()
  );

CREATE POLICY "Students can view their own purchases"
  ON public.reward_purchases FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view class purchases"
  ON public.reward_purchases FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'teacher')
    AND is_class_mentor(auth.uid(), class_id)
  );

CREATE POLICY "Teachers can update purchase status"
  ON public.reward_purchases FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'teacher')
    AND is_class_mentor(auth.uid(), class_id)
  );

CREATE POLICY "Developers can view all purchases"
  ON public.reward_purchases FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'developer'));

-- RLS Policies for messages
CREATE POLICY "System can create messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can view their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can mark messages as read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Developers can view all messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'developer'));

-- RLS Policies for default_point_reasons
CREATE POLICY "Everyone can view default reasons"
  ON public.default_point_reasons FOR SELECT
  TO authenticated
  USING (true);

-- Recreate handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();