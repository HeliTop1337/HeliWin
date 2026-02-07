-- Update existing rarity values to new quality system
UPDATE Item SET rarity = 'STALKER' WHERE rarity = 'COMMON' OR rarity = 'UNCOMMON';
UPDATE Item SET rarity = 'VETERAN' WHERE rarity = 'RARE';
UPDATE Item SET rarity = 'MASTER' WHERE rarity = 'EXCEPTIONAL';
-- LEGENDARY stays the same
