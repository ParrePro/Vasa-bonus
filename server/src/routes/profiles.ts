import { Router } from 'express';
import { query } from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

// Get user's avatar customization
router.get('/customization', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT avatar_skin, avatar_hair, avatar_hair_color, avatar_eyes, 
              avatar_accessory, avatar_background, avatar_border, avatar_effect 
       FROM profiles WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customization:', error);
    res.status(500).json({ error: 'Failed to fetch customization' });
  }
});

// Update user's avatar customization
router.put('/customization', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { 
      avatar_skin, avatar_hair, avatar_hair_color, avatar_eyes,
      avatar_accessory, avatar_background, avatar_border, avatar_effect 
    } = req.body;

    // Validate the customization values against allowed options
    // These must match EXACTLY with the frontend ProfileCustomization.tsx
    const validSkins = [
      'porcelain', 'light', 'fair', 'medium', 'olive', 'tan', 'brown', 'dark', 'espresso',
      'zombie', 'alien', 'vampire', 'demon', 'frost'
    ];
    const validHairs = [
      'none', 'buzz', 'short', 'crew', 'side-part', 'medium', 'bob', 'long-straight', 'long-wavy',
      'ponytail', 'pigtails', 'curly', 'afro', 'bun', 'shoulder', 'pixie',
      'spiky', 'mohawk', 'braids', 'dreadlocks', 'twintails', 'undercut', 'samurai',
      'fancy', 'messy-bun', 'anime', 'royal', 'wild'
    ];
    const validHairColors = [
      'black', 'dark-brown', 'brown', 'light-brown', 'blonde', 'platinum', 'ginger',
      'red', 'auburn', 'strawberry', 'gray', 'silver', 'white',
      'blue', 'navy', 'cyan', 'purple', 'lavender', 'pink', 'hot-pink', 'green', 'teal',
      'rainbow', 'fire', 'galaxy', 'neon-green', 'holographic'
    ];
    const validEyes = [
      'normal', 'happy', 'sleepy', 'surprised', 'serious',
      'wink', 'cool', 'angry', 'sad', 'suspicious', 'flirty',
      'stars', 'sparkle', 'cat', 'anime', 'dizzy', 'crying',
      'hearts', 'fire', 'diamond', 'hypno', 'laser', 'galaxy'
    ];
    const validAccessories = [
      'none', 'earrings-stud', 'bandaid',
      'glasses', 'glasses-round', 'sunglasses', 'earrings-hoop', 'hat-beanie', 'hat-cap', 'headband', 'bow', 'freckles',
      'headphones', 'crown', 'tiara', 'mask', 'monocle', 'piercing-nose', 'piercing-eyebrow', 'bandana', 'flowers', 'cat-ears', 'bunny-ears',
      'halo', 'horns', 'devil-horns', 'angel-wings', 'third-eye', 'antenna', 'vr-headset', 'robot', 'flames', 'ice-crown'
    ];
    const validBackgrounds = [
      'gray', 'light-gray', 'slate', 'stone', 'cream',
      'blue', 'light-blue', 'sky', 'green', 'emerald', 'teal', 'purple', 'violet', 'indigo', 'rose',
      'orange', 'amber', 'yellow', 'lime', 'pink', 'fuchsia', 'red', 'cyan', 'gradient-gold', 'gradient-ocean', 'gradient-forest', 'gradient-sunset',
      'gradient-rainbow', 'gradient-ruby', 'gradient-aurora', 'gradient-fire', 'gradient-galaxy', 'gradient-neon', 'gradient-midnight', 'gradient-holographic', 'black'
    ];
    const validBorders = [
      'none', 'thin-gray',
      'white', 'dark', 'blue', 'green', 'purple', 'red',
      'gold', 'glow-blue', 'glow-green', 'glow-purple', 'glow-pink', 'glow-orange', 'double',
      'rainbow', 'diamond', 'fire', 'ice', 'electric', 'neon', 'galaxy', 'legendary'
    ];
    const validEffects = [
      'none',
      'shadow', 'shadow-colored',
      'glow', 'glow-blue', 'glow-green', 'glow-purple', 'glow-pink', 'pulse',
      'bounce', 'spin', 'ping', 'glow-intense', 'rainbow-glow', 'fire-glow', 'ice-glow', 'legendary-glow'
    ];

    if (avatar_skin && !validSkins.includes(avatar_skin)) {
      return res.status(400).json({ error: 'Invalid skin tone' });
    }
    if (avatar_hair && !validHairs.includes(avatar_hair)) {
      return res.status(400).json({ error: 'Invalid hair style' });
    }
    if (avatar_hair_color && !validHairColors.includes(avatar_hair_color)) {
      return res.status(400).json({ error: 'Invalid hair color' });
    }
    if (avatar_eyes && !validEyes.includes(avatar_eyes)) {
      return res.status(400).json({ error: 'Invalid eye style' });
    }
    if (avatar_accessory && !validAccessories.includes(avatar_accessory)) {
      return res.status(400).json({ error: 'Invalid accessory' });
    }
    if (avatar_background && !validBackgrounds.includes(avatar_background)) {
      return res.status(400).json({ error: 'Invalid background' });
    }
    if (avatar_border && !validBorders.includes(avatar_border)) {
      return res.status(400).json({ error: 'Invalid border' });
    }
    if (avatar_effect && !validEffects.includes(avatar_effect)) {
      return res.status(400).json({ error: 'Invalid effect' });
    }

    // Get user's current tier to validate they can use the selected options
    const tierResult = await query(
      `SELECT current_tier FROM profiles WHERE id = $1`,
      [userId]
    );

    if (tierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const currentTier = tierResult.rows[0].current_tier || 'basic';
    const tierOrder = ['basic', 'silver', 'gold', 'ruby'];
    const tierIndex = tierOrder.indexOf(currentTier);

    // Define which options are available at each tier - must match frontend
    const skinTiers: Record<string, string> = {
      // Basic
      'porcelain': 'basic', 'light': 'basic', 'fair': 'basic', 'medium': 'basic',
      'olive': 'basic', 'tan': 'basic', 'brown': 'basic', 'dark': 'basic', 'espresso': 'basic',
      // Gold
      'zombie': 'gold', 'alien': 'gold',
      // Ruby
      'vampire': 'ruby', 'demon': 'ruby', 'frost': 'ruby',
    };
    const hairTiers: Record<string, string> = {
      // Basic
      'none': 'basic', 'buzz': 'basic', 'short': 'basic', 'crew': 'basic', 'side-part': 'basic',
      'medium': 'basic', 'bob': 'basic', 'long-straight': 'basic', 'long-wavy': 'basic',
      // Silver
      'ponytail': 'silver', 'pigtails': 'silver', 'curly': 'silver', 'afro': 'silver',
      'bun': 'silver', 'shoulder': 'silver', 'pixie': 'silver',
      // Gold
      'spiky': 'gold', 'mohawk': 'gold', 'braids': 'gold', 'dreadlocks': 'gold',
      'twintails': 'gold', 'undercut': 'gold', 'samurai': 'gold',
      // Ruby
      'fancy': 'ruby', 'messy-bun': 'ruby', 'anime': 'ruby', 'royal': 'ruby', 'wild': 'ruby',
    };
    const hairColorTiers: Record<string, string> = {
      // Basic
      'black': 'basic', 'dark-brown': 'basic', 'brown': 'basic', 'light-brown': 'basic',
      'blonde': 'basic', 'platinum': 'basic', 'ginger': 'basic',
      // Silver
      'red': 'silver', 'auburn': 'silver', 'strawberry': 'silver',
      'gray': 'silver', 'silver': 'silver', 'white': 'silver',
      // Gold
      'blue': 'gold', 'navy': 'gold', 'cyan': 'gold', 'purple': 'gold', 'lavender': 'gold',
      'pink': 'gold', 'hot-pink': 'gold', 'green': 'gold', 'teal': 'gold',
      // Ruby
      'rainbow': 'ruby', 'fire': 'ruby', 'galaxy': 'ruby', 'neon-green': 'ruby', 'holographic': 'ruby',
    };
    const eyeTiers: Record<string, string> = {
      // Basic
      'normal': 'basic', 'happy': 'basic', 'sleepy': 'basic', 'surprised': 'basic', 'serious': 'basic',
      // Silver
      'wink': 'silver', 'cool': 'silver', 'angry': 'silver', 'sad': 'silver', 'suspicious': 'silver', 'flirty': 'silver',
      // Gold
      'stars': 'gold', 'sparkle': 'gold', 'cat': 'gold', 'anime': 'gold', 'dizzy': 'gold', 'crying': 'gold',
      // Ruby
      'hearts': 'ruby', 'fire': 'ruby', 'diamond': 'ruby', 'hypno': 'ruby', 'laser': 'ruby', 'galaxy': 'ruby',
    };
    const accessoryTiers: Record<string, string> = {
      // Basic
      'none': 'basic', 'earrings-stud': 'basic', 'bandaid': 'basic',
      // Silver
      'glasses': 'silver', 'glasses-round': 'silver', 'sunglasses': 'silver', 'earrings-hoop': 'silver',
      'hat-beanie': 'silver', 'hat-cap': 'silver', 'headband': 'silver', 'bow': 'silver', 'freckles': 'silver',
      // Gold
      'headphones': 'gold', 'crown': 'gold', 'tiara': 'gold', 'mask': 'gold', 'monocle': 'gold',
      'piercing-nose': 'gold', 'piercing-eyebrow': 'gold', 'bandana': 'gold', 'flowers': 'gold',
      'cat-ears': 'gold', 'bunny-ears': 'gold',
      // Ruby
      'halo': 'ruby', 'horns': 'ruby', 'devil-horns': 'ruby', 'angel-wings': 'ruby', 'third-eye': 'ruby',
      'antenna': 'ruby', 'vr-headset': 'ruby', 'robot': 'ruby', 'flames': 'ruby', 'ice-crown': 'ruby',
    };
    const backgroundTiers: Record<string, string> = {
      // Basic
      'gray': 'basic', 'light-gray': 'basic', 'slate': 'basic', 'stone': 'basic', 'cream': 'basic',
      // Silver
      'blue': 'silver', 'light-blue': 'silver', 'sky': 'silver', 'green': 'silver', 'emerald': 'silver',
      'teal': 'silver', 'purple': 'silver', 'violet': 'silver', 'indigo': 'silver', 'rose': 'silver',
      // Gold
      'orange': 'gold', 'amber': 'gold', 'yellow': 'gold', 'lime': 'gold', 'pink': 'gold', 'fuchsia': 'gold',
      'red': 'gold', 'cyan': 'gold', 'gradient-gold': 'gold', 'gradient-ocean': 'gold', 'gradient-forest': 'gold', 'gradient-sunset': 'gold',
      // Ruby
      'gradient-rainbow': 'ruby', 'gradient-ruby': 'ruby', 'gradient-aurora': 'ruby', 'gradient-fire': 'ruby',
      'gradient-galaxy': 'ruby', 'gradient-neon': 'ruby', 'gradient-midnight': 'ruby', 'gradient-holographic': 'ruby', 'black': 'ruby',
    };
    const borderTiers: Record<string, string> = {
      // Basic
      'none': 'basic', 'thin-gray': 'basic',
      // Silver
      'white': 'silver', 'dark': 'silver', 'blue': 'silver', 'green': 'silver', 'purple': 'silver', 'red': 'silver',
      // Gold
      'gold': 'gold', 'glow-blue': 'gold', 'glow-green': 'gold', 'glow-purple': 'gold', 'glow-pink': 'gold', 'glow-orange': 'gold', 'double': 'gold',
      // Ruby
      'rainbow': 'ruby', 'diamond': 'ruby', 'fire': 'ruby', 'ice': 'ruby', 'electric': 'ruby', 'neon': 'ruby', 'galaxy': 'ruby', 'legendary': 'ruby',
    };
    const effectTiers: Record<string, string> = {
      // Basic
      'none': 'basic',
      // Silver
      'shadow': 'silver', 'shadow-colored': 'silver',
      // Gold
      'glow': 'gold', 'glow-blue': 'gold', 'glow-green': 'gold', 'glow-purple': 'gold', 'glow-pink': 'gold', 'pulse': 'gold',
      // Ruby
      'bounce': 'ruby', 'spin': 'ruby', 'ping': 'ruby', 'glow-intense': 'ruby',
      'rainbow-glow': 'ruby', 'fire-glow': 'ruby', 'ice-glow': 'ruby', 'legendary-glow': 'ruby',
    };

    // Check if user's tier allows the selected options
    const checkTierAccess = (value: string | undefined, tierMap: Record<string, string>) => {
      if (!value) return true;
      const requiredTier = tierMap[value];
      if (!requiredTier) return false;
      return tierOrder.indexOf(requiredTier) <= tierIndex;
    };

    if (!checkTierAccess(avatar_skin, skinTiers)) {
      return res.status(403).json({ error: 'Skin tone not unlocked at your tier' });
    }
    if (!checkTierAccess(avatar_hair, hairTiers)) {
      return res.status(403).json({ error: 'Hair style not unlocked at your tier' });
    }
    if (!checkTierAccess(avatar_hair_color, hairColorTiers)) {
      return res.status(403).json({ error: 'Hair color not unlocked at your tier' });
    }
    if (!checkTierAccess(avatar_eyes, eyeTiers)) {
      return res.status(403).json({ error: 'Eye style not unlocked at your tier' });
    }
    if (!checkTierAccess(avatar_accessory, accessoryTiers)) {
      return res.status(403).json({ error: 'Accessory not unlocked at your tier' });
    }
    if (!checkTierAccess(avatar_background, backgroundTiers)) {
      return res.status(403).json({ error: 'Background not unlocked at your tier' });
    }
    if (!checkTierAccess(avatar_border, borderTiers)) {
      return res.status(403).json({ error: 'Border not unlocked at your tier' });
    }
    if (!checkTierAccess(avatar_effect, effectTiers)) {
      return res.status(403).json({ error: 'Effect not unlocked at your tier' });
    }

    // Update the profile
    await query(
      `UPDATE profiles 
       SET avatar_skin = COALESCE($1, avatar_skin),
           avatar_hair = COALESCE($2, avatar_hair),
           avatar_hair_color = COALESCE($3, avatar_hair_color),
           avatar_eyes = COALESCE($4, avatar_eyes),
           avatar_accessory = COALESCE($5, avatar_accessory),
           avatar_background = COALESCE($6, avatar_background),
           avatar_border = COALESCE($7, avatar_border),
           avatar_effect = COALESCE($8, avatar_effect)
       WHERE id = $9`,
      [avatar_skin, avatar_hair, avatar_hair_color, avatar_eyes, 
       avatar_accessory, avatar_background, avatar_border, avatar_effect, userId]
    );

    res.json({ 
      success: true,
      message: 'Avatar customization saved',
    });
  } catch (error) {
    console.error('Error saving customization:', error);
    res.status(500).json({ error: 'Failed to save customization' });
  }
});

// Get a user's avatar customization (for displaying other users' avatars)
router.get('/:userId/avatar', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT name, avatar_skin, avatar_hair, avatar_hair_color, avatar_eyes, 
              avatar_accessory, avatar_background, avatar_border, avatar_effect 
       FROM profiles WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    res.status(500).json({ error: 'Failed to fetch avatar' });
  }
});

export default router;
