-- Add missing foreign key constraints safely (only if they don't exist)

-- Add foreign key from class_members.class_id to classes.id (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'class_members_class_id_fkey'
  ) THEN
    ALTER TABLE public.class_members
    ADD CONSTRAINT class_members_class_id_fkey
    FOREIGN KEY (class_id)
    REFERENCES public.classes(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from points_transactions.student_id to profiles.id (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'points_transactions_student_id_fkey'
  ) THEN
    ALTER TABLE public.points_transactions
    ADD CONSTRAINT points_transactions_student_id_fkey
    FOREIGN KEY (student_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from points_transactions.teacher_id to profiles.id (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'points_transactions_teacher_id_fkey'
  ) THEN
    ALTER TABLE public.points_transactions
    ADD CONSTRAINT points_transactions_teacher_id_fkey
    FOREIGN KEY (teacher_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from points_transactions.class_id to classes.id (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'points_transactions_class_id_fkey'
  ) THEN
    ALTER TABLE public.points_transactions
    ADD CONSTRAINT points_transactions_class_id_fkey
    FOREIGN KEY (class_id)
    REFERENCES public.classes(id)
    ON DELETE CASCADE;
  END IF;
END $$;