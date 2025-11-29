-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('teacher', 'student', 'developer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create class_members table
CREATE TABLE public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_teacher BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Create points_transactions table
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL CHECK (points > 0),
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Create default_point_reasons table
CREATE TABLE public.default_point_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.default_point_reasons ENABLE ROW LEVEL SECURITY;

-- Insert default point reasons
INSERT INTO public.default_point_reasons (reason, points) VALUES
  ('Helping a classmate', 5),
  ('Excellent participation', 10),
  ('Great homework', 10),
  ('Kind action', 5),
  ('Leadership', 15),
  ('Good behavior', 5);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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
CREATE POLICY "Teachers can view classes they're in"
  ON public.classes FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND (
      mentor_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.class_members
        WHERE class_id = id AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can view classes they're in"
  ON public.classes FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'student') AND
    EXISTS (
      SELECT 1 FROM public.class_members
      WHERE class_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create classes"
  ON public.classes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'teacher') AND mentor_id = auth.uid());

CREATE POLICY "Mentors can delete their classes"
  ON public.classes FOR DELETE
  TO authenticated
  USING (mentor_id = auth.uid());

-- RLS Policies for class_members
CREATE POLICY "Users can view class members"
  ON public.class_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      WHERE cm.class_id = class_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can add members"
  ON public.class_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher') AND (
      EXISTS (
        SELECT 1 FROM public.classes
        WHERE id = class_id AND mentor_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.class_members
        WHERE class_id = class_members.class_id AND user_id = auth.uid() AND is_teacher = true
      )
    )
  );

CREATE POLICY "Mentors can remove members"
  ON public.class_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = class_id AND mentor_id = auth.uid()
    )
  );

-- RLS Policies for points_transactions
CREATE POLICY "Users can view their own points"
  ON public.points_transactions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR teacher_id = auth.uid());

CREATE POLICY "Teachers can give points"
  ON public.points_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher') AND
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.class_members
      WHERE class_id = points_transactions.class_id AND user_id = auth.uid() AND is_teacher = true
    )
  );

-- RLS Policies for default_point_reasons
CREATE POLICY "Everyone can view default reasons"
  ON public.default_point_reasons FOR SELECT
  TO authenticated
  USING (true);

-- Function to auto-create profile
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

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique class code
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