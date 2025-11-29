-- Add avatar customization columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_skin VARCHAR(50) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS avatar_hair VARCHAR(50) DEFAULT 'short',
ADD COLUMN IF NOT EXISTS avatar_hair_color VARCHAR(50) DEFAULT 'brown',
ADD COLUMN IF NOT EXISTS avatar_eyes VARCHAR(50) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS avatar_accessory VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS avatar_background VARCHAR(50) DEFAULT 'gray',
ADD COLUMN IF NOT EXISTS avatar_border VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS avatar_effect VARCHAR(50) DEFAULT 'none';

-- Avatar customization options by tier:
-- Skin Tone: All available at basic tier
-- Hair Style: none/short/medium (basic), long/curly (silver), spiky/mohawk (gold), fancy (ruby)
-- Hair Color: black/brown/blonde (basic), red/gray (silver), blue/purple/pink (gold), rainbow (ruby)
-- Eyes: normal/happy (basic), wink/cool (silver), stars (gold), hearts (ruby)
-- Accessories: none (basic), glasses/sunglasses (silver), headphones/crown (gold), halo/horns (ruby)
-- Background: gray (basic), blue/green/purple (silver), orange/pink/gold-gradient (gold), rainbow/ruby gradients (ruby)
-- Border: none (basic), white/dark (silver), gold/blue-glow (gold), rainbow/diamond (ruby)
-- Effects: none (basic), shadow (silver), glow/pulse (gold), bounce (ruby)
