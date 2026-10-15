/**
 * Canonical Service Catalog & Price List for Tidyups Cleaning Service Inc.
 * Synchronized with Jobber Products & Services Line Items
 */

export interface ServiceCatalogItem {
  id: string;
  category: 
    | 'MOVE_OUT' 
    | 'DEEP_CLEAN' 
    | 'STANDARD_CLEAN' 
    | 'POST_CONSTRUCTION' 
    | 'RECURRING' 
    | 'ADD_ON' 
    | 'HOURLY';
  categoryLabel: string;
  name: string;
  shortName: string;
  serviceType: 
    | 'Move-Out Cleaning' 
    | 'Deep Cleaning' 
    | 'Standard Cleaning' 
    | 'Post-Construction Cleaning' 
    | 'Recurring Cleaning' 
    | 'Commercial Cleaning' 
    | 'Add-on';
  bedrooms?: string;
  bathrooms?: string;
  baseHours: number;
  cleanersCount: number;
  basePrice: number;
  depositRequired: number;
  taxable: boolean;
  jobberItemName: string;
  description: string;
  isAddon?: boolean;
  isActive: boolean;
  sortOrder: number;
}

export const CANONICAL_SERVICE_CATALOG: ServiceCatalogItem[] = [
  // ── 1. MOVE-OUT CLEANING 2026 ──
  {
    id: 'cat-mo-1b1b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '1Bed 1Bath Moveout Cleaning 2026',
    shortName: '1 Bed / 1 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '1 Bedroom',
    bathrooms: '1 Bathroom',
    baseHours: 2.5,
    cleanersCount: 1,
    basePrice: 265.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '1Bed 1Bath Moveout Cleaning 2026',
    description: 'Complete move-out sanitization for 1 Bed / 1 Bath apartment/condo. High-touch surfaces, kitchen, bath, and floors.',
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'cat-mo-2b1b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: 'Move Out Cleaning Services 2026 (Basement Suite)',
    shortName: '2 Bed / 1 Bath Basement Suite Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '1 Bathroom',
    baseHours: 3.0,
    cleanersCount: 1,
    basePrice: 315.00,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: 'Move Out Cleaning Services 2026 (Basement Suite)',
    description: 'Comprehensive move-out turnover clean for 2 Bed / 1 Bath basement suite. Kitchen, bath, fixtures, and full sanitization.',
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'cat-mo-2b2b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '2Bed 2Bath Move Out Cleaning 2026',
    shortName: '2 Bed / 2 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '2 Bathrooms',
    baseHours: 3.5,
    cleanersCount: 1,
    basePrice: 325.00,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '2Bed 2Bath Move Out Cleaning 2026',
    description: 'Detailed move-out clean for 2 Bed / 2 Bath residence. Both full baths, kitchen surfaces, baseboards wipe, vacuum & mop.',
    isActive: true,
    sortOrder: 30,
  },
  {
    id: 'cat-mo-3b2b-main',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: 'Move Out Cleaning Services 2026 (Main Level)',
    shortName: '3 Bed / 2 Bath Main Level Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2 Bathrooms',
    baseHours: 3.5,
    cleanersCount: 1,
    basePrice: 325.00,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: 'Move Out Cleaning Services 2026 (Main Level)',
    description: 'Complete main-level move-out cleaning for 3 Bedrooms & 2 Bathrooms. Kitchen degrease, baths, closets, and floors.',
    isActive: true,
    sortOrder: 40,
  },
  {
    id: 'cat-mo-3b2b-std',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '3Bed 2Bath Moveout Cleaning 2026',
    shortName: '3 Bed / 2 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2 Bathrooms',
    baseHours: 3.5,
    cleanersCount: 1,
    basePrice: 325.00,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '3Bed 2Bath Moveout Cleaning 2026',
    description: 'Full moveout turnover for 3 Bed / 2 Bath home. Hand-wiped surfaces, kitchen exterior cabinets & appliances, full baths.',
    isActive: true,
    sortOrder: 50,
  },
  {
    id: 'cat-mo-3b25b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: 'Move Out Cleaning Services 2026 (3 Bed / 2.5 Bath)',
    shortName: '3 Bed / 2.5 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    baseHours: 4.0,
    cleanersCount: 2,
    basePrice: 407.50,
    depositRequired: 125.00,
    taxable: true,
    jobberItemName: 'Move Out Cleaning Services 2026 (3 Bed / 2.5 Bath)',
    description: 'Tandem cleaner move-out for 3 Bed / 2.5 Bath two-storey home. Detailed bathrooms, powder room, kitchen, baseboards.',
    isActive: true,
    sortOrder: 60,
  },
  {
    id: 'cat-mo-4b25b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '4Bed 2.5Bath Move Out Cleaning 2026',
    shortName: '4 Bed / 2.5 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    baseHours: 4.5,
    cleanersCount: 2,
    basePrice: 450.00,
    depositRequired: 125.00,
    taxable: true,
    jobberItemName: '4Bed 2.5Bath Move Out Cleaning 2026',
    description: 'Move-out turnover for 4 Bedrooms and 2.5 Bathrooms. Full home detail, stairwells, sanitization, and baseboards.',
    isActive: true,
    sortOrder: 70,
  },
  {
    id: 'cat-mo-4b3b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '4Bed 3Bath Move Out Cleaning 2026',
    shortName: '4 Bed / 3 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '3 Bathrooms',
    baseHours: 5.0,
    cleanersCount: 2,
    basePrice: 495.00,
    depositRequired: 150.00,
    taxable: true,
    jobberItemName: '4Bed 3Bath Move Out Cleaning 2026',
    description: 'Comprehensive 4 Bed / 3 Bath home move-out cleaning with team dispatch. All three bathrooms and kitchen deep cleaned.',
    isActive: true,
    sortOrder: 80,
  },
  {
    id: 'cat-mo-5b35b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '5Bed 3.5+Bath Executive Estate Move Out Clean',
    shortName: '5+ Bed / 3.5+ Bath Estate Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '5 Bedrooms',
    bathrooms: '3.5 Bathrooms',
    baseHours: 6.0,
    cleanersCount: 2,
    basePrice: 585.00,
    depositRequired: 150.00,
    taxable: true,
    jobberItemName: '5Bed 3.5+Bath Executive Estate Move Out Clean',
    description: 'Executive estate move-out turnover clean. Large square footage, master ensuite, bonus room, multiple full bathrooms.',
    isActive: true,
    sortOrder: 90,
  },

  // ── 2. DEEP CLEANING SERVICES 2026 ──
  {
    id: 'cat-dc-1b1b',
    category: 'DEEP_CLEAN',
    categoryLabel: 'Deep Cleaning Services 2026',
    name: '1Bed 1Bath Deep Cleaning 2026',
    shortName: '1 Bed / 1 Bath Deep Clean',
    serviceType: 'Deep Cleaning',
    bedrooms: '1 Bedroom',
    bathrooms: '1 Bathroom',
    baseHours: 2.0,
    cleanersCount: 1,
    basePrice: 175.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '1Bed 1Bath Deep Cleaning 2026',
    description: 'Detailed deep sanitization for 1 Bed / 1 Bath residence. Grout, faucets, stove top, bathroom descaling, high dusting.',
    isActive: true,
    sortOrder: 100,
  },
  {
    id: 'cat-dc-2b1b',
    category: 'DEEP_CLEAN',
    categoryLabel: 'Deep Cleaning Services 2026',
    name: '2Bed 1Bath Deep Cleaning 2026',
    shortName: '2 Bed / 1 Bath Deep Clean',
    serviceType: 'Deep Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '1 Bathroom',
    baseHours: 2.5,
    cleanersCount: 1,
    basePrice: 185.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '2Bed 1Bath Deep Cleaning 2026',
    description: 'Deep residential clean for 2 Bed / 1 Bath home. Scrub showers, kitchen backsplash, edge vacuuming, doors & frames.',
    isActive: true,
    sortOrder: 110,
  },
  {
    id: 'cat-dc-2b2b',
    category: 'DEEP_CLEAN',
    categoryLabel: 'Deep Cleaning Services 2026',
    name: '2Bed 2Bath Deep Cleaning 2026',
    shortName: '2 Bed / 2 Bath Deep Clean',
    serviceType: 'Deep Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '2 Bathrooms',
    baseHours: 3.0,
    cleanersCount: 1,
    basePrice: 197.50,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '2Bed 2Bath Deep Cleaning 2026',
    description: 'Intensive deep clean for 2 Bed / 2 Bath home. Deep scrubbing of 2 bathrooms, kitchen degrease, baseboards, floor detail.',
    isActive: true,
    sortOrder: 120,
  },
  {
    id: 'cat-dc-3b2b',
    category: 'DEEP_CLEAN',
    categoryLabel: 'Deep Cleaning Services 2026',
    name: '3Bed 2Bath Deep Cleaning 2026',
    shortName: '3 Bed / 2 Bath Deep Clean',
    serviceType: 'Deep Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2 Bathrooms',
    baseHours: 3.0,
    cleanersCount: 1,
    basePrice: 210.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '3Bed 2Bath Deep Cleaning 2026',
    description: 'Deep residential rejuvenation for 3 Bed / 2 Bath house or condo. Living areas, bedrooms, kitchen scrub, bathroom descaling.',
    isActive: true,
    sortOrder: 130,
  },
  {
    id: 'cat-dc-3b25b',
    category: 'DEEP_CLEAN',
    categoryLabel: 'Deep Cleaning Services 2026',
    name: '3Bed 2.5Bath Deep Cleaning 2026',
    shortName: '3 Bed / 2.5 Bath Deep Clean',
    serviceType: 'Deep Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    baseHours: 3.5,
    cleanersCount: 1,
    basePrice: 223.32,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '3Bed 2.5Bath Deep Cleaning 2026',
    description: 'Full residential deep cleaning for 3 Bedrooms and 2.5 Bathrooms (approx. 1800-2200 sq ft). Includes powder room & ensuite.',
    isActive: true,
    sortOrder: 140,
  },
  {
    id: 'cat-dc-4b25b',
    category: 'DEEP_CLEAN',
    categoryLabel: 'Deep Cleaning Services 2026',
    name: '4Bed 2.5Bath Deep Cleaning 2026',
    shortName: '4 Bed / 2.5 Bath Deep Clean',
    serviceType: 'Deep Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    baseHours: 4.0,
    cleanersCount: 2,
    basePrice: 385.00,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '4Bed 2.5Bath Deep Cleaning 2026',
    description: 'Team deep clean for 4 Bed / 2.5 Bath home. Complete kitchen, bathrooms, bedrooms, and high/low detailed dusting.',
    isActive: true,
    sortOrder: 150,
  },
  {
    id: 'cat-dc-4b3b',
    category: 'DEEP_CLEAN',
    categoryLabel: 'Deep Cleaning Services 2026',
    name: '4Bed 3Bath Deep Cleaning 2026',
    shortName: '4 Bed / 3 Bath Deep Clean',
    serviceType: 'Deep Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '3 Bathrooms',
    baseHours: 4.5,
    cleanersCount: 2,
    basePrice: 439.29,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '4Bed 3Bath Deep Cleaning 2026',
    description: 'Comprehensive deep cleaning for large 4 Bed / 3 Bath residence. Triple bathroom scrub, kitchen, living spaces, and floors.',
    isActive: true,
    sortOrder: 160,
  },
  {
    id: 'cat-dc-5b35b',
    category: 'DEEP_CLEAN',
    categoryLabel: 'Deep Cleaning Services 2026',
    name: '5Bed 3.5+Bath Estate Deep Clean 2026',
    shortName: '5+ Bed / 3.5+ Bath Estate Deep Clean',
    serviceType: 'Deep Cleaning',
    bedrooms: '5 Bedrooms',
    bathrooms: '3.5 Bathrooms',
    baseHours: 5.5,
    cleanersCount: 2,
    basePrice: 520.00,
    depositRequired: 125.00,
    taxable: true,
    jobberItemName: '5Bed 3.5+Bath Estate Deep Clean 2026',
    description: 'Estate-scale deep cleaning for large family properties. Multi-cleaner crew, bathrooms, chef kitchen, stairs, and living suites.',
    isActive: true,
    sortOrder: 170,
  },

  // ── 3. INITIAL BASIC / STANDARD CLEANING 2026 ──
  {
    id: 'cat-sc-1b1b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '1Bed 1Bath Initial Basic Cleaning',
    shortName: '1 Bed / 1 Bath Standard Clean',
    serviceType: 'Standard Cleaning',
    bedrooms: '1 Bedroom',
    bathrooms: '1 Bathroom',
    baseHours: 2.0,
    cleanersCount: 1,
    basePrice: 155.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '1Bed 1Bath Initial Basic Cleaning',
    description: 'General residential maintenance clean for 1 Bed / 1 Bath home. Dust surfaces, sanitize bathroom, kitchen counters, vacuum & mop.',
    isActive: true,
    sortOrder: 180,
  },
  {
    id: 'cat-sc-2b1b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '2Bed 1Bath Initial Basic Cleaning',
    shortName: '2 Bed / 1 Bath Standard Clean',
    serviceType: 'Standard Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '1 Bathroom',
    baseHours: 2.5,
    cleanersCount: 1,
    basePrice: 175.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '2Bed 1Bath Initial Basic Cleaning',
    description: 'Standard residential cleaning for 2 Bed / 1 Bath home. Living rooms, kitchen, bathroom sanitization, empty bins, floors.',
    isActive: true,
    sortOrder: 190,
  },
  {
    id: 'cat-sc-2b2b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '2Bed 2Bath Initial Basic Cleaning',
    shortName: '2 Bed / 2 Bath Standard Clean',
    serviceType: 'Standard Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '2 Bathrooms',
    baseHours: 2.5,
    cleanersCount: 1,
    basePrice: 198.50,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '2Bed 2Bath Initial Basic Cleaning',
    description: 'Standard initial basic cleaning for 2 Bed / 2 Bath home. Surface wipe down, both bathrooms, kitchen sinks, floors vacuumed/mopped.',
    isActive: true,
    sortOrder: 200,
  },
  {
    id: 'cat-sc-3b2b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '3Bed 2Bath Initial Basic Cleaning',
    shortName: '3 Bed / 2 Bath Standard Clean',
    serviceType: 'Standard Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2 Bathrooms',
    baseHours: 3.0,
    cleanersCount: 1,
    basePrice: 215.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '3Bed 2Bath Initial Basic Cleaning',
    description: 'Standard residential clean for 3 Bed / 2 Bath residence. Kitchen, bathrooms, bedrooms tidied, dusting, and full floor care.',
    isActive: true,
    sortOrder: 210,
  },
  {
    id: 'cat-sc-3b25b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '3Bed 2.5Bath Initial Basic Cleaning',
    shortName: '3 Bed / 2.5 Bath Standard Clean',
    serviceType: 'Standard Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    baseHours: 3.0,
    cleanersCount: 1,
    basePrice: 235.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '3Bed 2.5Bath Initial Basic Cleaning',
    description: 'Standard home clean for 3 Bed / 2.5 Bath two-storey home. Kitchen counters & stove, 2.5 baths, dusting, vacuuming and mopping.',
    isActive: true,
    sortOrder: 220,
  },
  {
    id: 'cat-sc-4b25b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '4Bed 2.5Bath Initial Basic Cleaning',
    shortName: '4 Bed / 2.5 Bath Standard Clean',
    serviceType: 'Standard Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    baseHours: 3.5,
    cleanersCount: 1,
    basePrice: 285.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '4Bed 2.5Bath Initial Basic Cleaning',
    description: 'Residential standard cleaning for 4 Bed / 2.5 Bath home. Bedrooms, shared bathrooms, ensuite, kitchen, and common areas.',
    isActive: true,
    sortOrder: 230,
  },
  {
    id: 'cat-sc-4b3b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '4Bed 3Bath Initial Basic Cleaning',
    shortName: '4 Bed / 3 Bath Standard Clean',
    serviceType: 'Standard Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '3 Bathrooms',
    baseHours: 4.0,
    cleanersCount: 2,
    basePrice: 320.00,
    depositRequired: 75.00,
    taxable: true,
    jobberItemName: '4Bed 3Bath Initial Basic Cleaning',
    description: 'Standard clean for 4 Bed / 3 Bath home. 3 full bathrooms, extensive floor square footage, dusting, kitchen and entrance.',
    isActive: true,
    sortOrder: 240,
  },

  // ── 4. POST-CONSTRUCTION & MOVE-IN ──
  {
    id: 'cat-pc-2b2b',
    category: 'POST_CONSTRUCTION',
    categoryLabel: 'MoveIn - Post Construction',
    name: '2Bed 2Bath MoveIn - Post Construction Cleaning',
    shortName: '2 Bed / 2 Bath Post-Construction',
    serviceType: 'Post-Construction Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '2 Bathrooms',
    baseHours: 3.5,
    cleanersCount: 1,
    basePrice: 295.00,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '2Bed 2Bath MoveIn - Post Construction Cleaning',
    description: 'Fine drywall dust wipe down, inside drawers, sticker removal, vacuuming track crevices, sanitized fixtures for new move-in.',
    isActive: true,
    sortOrder: 250,
  },
  {
    id: 'cat-pc-3b25b',
    category: 'POST_CONSTRUCTION',
    categoryLabel: 'MoveIn - Post Construction',
    name: 'MoveIn - Post Construction Cleaning (3 Bed / 2.5 Bath)',
    shortName: '3 Bed / 2.5 Bath Post-Construction',
    serviceType: 'Post-Construction Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    baseHours: 4.0,
    cleanersCount: 2,
    basePrice: 335.00,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: 'MoveIn - Post Construction Cleaning',
    description: 'Comprehensive post-construction detailing. Drywall dust extraction, fixtures polishing, window sill vacuuming, and floor scrub.',
    isActive: true,
    sortOrder: 260,
  },
  {
    id: 'cat-pc-4b3b',
    category: 'POST_CONSTRUCTION',
    categoryLabel: 'MoveIn - Post Construction',
    name: '4Bed 3Bath MoveIn - Post Construction Cleaning',
    shortName: '4 Bed / 3 Bath Post-Construction',
    serviceType: 'Post-Construction Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '3 Bathrooms',
    baseHours: 5.0,
    cleanersCount: 2,
    basePrice: 425.00,
    depositRequired: 125.00,
    taxable: true,
    jobberItemName: '4Bed 3Bath MoveIn - Post Construction Cleaning',
    description: 'Full new build or renovation detailed turnover. Multiple full bathrooms, kitchen millwork wipe down, baseboards, floor wash.',
    isActive: true,
    sortOrder: 270,
  },

  // ── 5. RECURRING MAINTENANCE TIERS ──
  {
    id: 'cat-rec-biweekly-2b',
    category: 'RECURRING',
    categoryLabel: 'Bi-Weekly Recurring Residential Clean',
    name: 'Bi-Weekly Maintenance Clean (2 Bed / 2 Bath)',
    shortName: 'Bi-Weekly 2 Bed / 2 Bath',
    serviceType: 'Recurring Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '2 Bathrooms',
    baseHours: 2.0,
    cleanersCount: 1,
    basePrice: 165.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Bi-Weekly Recurring Residential Clean (2 Bed)',
    description: 'Recurring bi-weekly maintenance cleaning. Consistent cleaner assigned, high priority rotation, automatic card-on-file billing.',
    isActive: true,
    sortOrder: 280,
  },
  {
    id: 'cat-rec-biweekly-3b',
    category: 'RECURRING',
    categoryLabel: 'Bi-Weekly Recurring Residential Clean',
    name: 'Bi-Weekly Maintenance Clean (3 Bed / 2.5 Bath)',
    shortName: 'Bi-Weekly 3 Bed / 2.5 Bath',
    serviceType: 'Recurring Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    baseHours: 2.5,
    cleanersCount: 1,
    basePrice: 195.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Bi-Weekly Recurring Residential Clean (3 Bed)',
    description: 'Bi-weekly scheduled home maintenance. 3 bedrooms, 2.5 bathrooms, kitchen scrub, vacuuming, mopping, trash removal.',
    isActive: true,
    sortOrder: 290,
  },
  {
    id: 'cat-rec-biweekly-4b',
    category: 'RECURRING',
    categoryLabel: 'Bi-Weekly Recurring Residential Clean',
    name: 'Bi-Weekly Maintenance Clean (4 Bed / 3 Bath)',
    shortName: 'Bi-Weekly 4 Bed / 3 Bath',
    serviceType: 'Recurring Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '3 Bathrooms',
    baseHours: 3.0,
    cleanersCount: 1,
    basePrice: 245.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Bi-Weekly Recurring Residential Clean (4 Bed)',
    description: 'Regular recurring bi-weekly home detail for 4 Bed / 3 Bath property. Full sanitization and maintenance.',
    isActive: true,
    sortOrder: 300,
  },

  // ── 6. HOURLY CREW RATES ──
  {
    id: 'cat-hr-1cleaner',
    category: 'HOURLY',
    categoryLabel: 'Hourly Crew Rates',
    name: 'Standard Hourly Rate (1 Cleaner @ $52.50/hr)',
    shortName: '1 Cleaner @ $52.50/hr',
    serviceType: 'Standard Cleaning',
    baseHours: 1.0,
    cleanersCount: 1,
    basePrice: 52.50,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: 'Solo Cleaner Hourly Rate ($52.50/hr)',
    description: 'Billed per labor hour for 1 professional cleaner with all eco-friendly supplies and commercial vacuum equipment.',
    isActive: true,
    sortOrder: 310,
  },
  {
    id: 'cat-hr-2cleaners',
    category: 'HOURLY',
    categoryLabel: 'Hourly Crew Rates',
    name: 'Tandem Crew Rate (2 Cleaners @ $105.00/hr)',
    shortName: '2 Cleaners @ $105.00/hr',
    serviceType: 'Deep Cleaning',
    baseHours: 1.0,
    cleanersCount: 2,
    basePrice: 105.00,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: 'Tandem Crew Hourly Rate ($105.00/hr)',
    description: 'Billed per clock hour for a 2-cleaner tandem crew (provides 2 person-hours per clock hour of service).',
    isActive: true,
    sortOrder: 320,
  },

  // ── 7. ADD-ON SERVICES CATALOG ──
  {
    id: 'addon-oven',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Inside Oven Deep Cleaning',
    shortName: 'Inside Oven',
    serviceType: 'Add-on',
    baseHours: 0.75,
    cleanersCount: 1,
    basePrice: 45.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Inside Oven Cleaning',
    description: 'Degrease and scrub inside of oven, racks, interior glass door, and bottom heating elements.',
    isAddon: true,
    isActive: true,
    sortOrder: 400,
  },
  {
    id: 'addon-fridge',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Inside Refrigerator & Freezer Deep Clean',
    shortName: 'Inside Fridge',
    serviceType: 'Add-on',
    baseHours: 0.75,
    cleanersCount: 1,
    basePrice: 45.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Inside Refrigerator Sanitization',
    description: 'Remove shelves & crispers, wash, sanitize interior walls, wipe seals, and replace items neatly.',
    isAddon: true,
    isActive: true,
    sortOrder: 410,
  },
  {
    id: 'addon-cabinets',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Inside Kitchen Cabinets & Drawers Detail',
    shortName: 'Inside Cabinets',
    serviceType: 'Add-on',
    baseHours: 1.0,
    cleanersCount: 1,
    basePrice: 55.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Inside Cabinets & Drawers Cleaning',
    description: 'Vacuum crumbs and wipe down inside shelves and drawers throughout the kitchen.',
    isAddon: true,
    isActive: true,
    sortOrder: 420,
  },
  {
    id: 'addon-baseboards',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Baseboards Hand-Scrub & Detail',
    shortName: 'Baseboards Detail',
    serviceType: 'Add-on',
    baseHours: 1.0,
    cleanersCount: 1,
    basePrice: 60.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Baseboards Hand-Scrub & Wipe',
    description: 'Detailed hand wipe and scrub of baseboards throughout the entire home to remove scuffs and dust.',
    isAddon: true,
    isActive: true,
    sortOrder: 430,
  },
  {
    id: 'addon-windows',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Interior Windows & Tracks (Up to 10 Panes)',
    shortName: 'Interior Windows',
    serviceType: 'Add-on',
    baseHours: 1.0,
    cleanersCount: 1,
    basePrice: 50.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Interior Window Panes & Sills Clean',
    description: 'Squeegee and polish interior window glass, vacuum and wipe window tracks and sills.',
    isAddon: true,
    isActive: true,
    sortOrder: 440,
  },
  {
    id: 'addon-basement-living',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Finished Basement Living Area',
    shortName: 'Basement Area',
    serviceType: 'Add-on',
    baseHours: 1.5,
    cleanersCount: 1,
    basePrice: 85.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Basement Living Space Cleaning',
    description: 'Clean finished basement family room, rec space, dust surfaces, vacuum carpets, and mop hard floors.',
    isAddon: true,
    isActive: true,
    sortOrder: 450,
  },
  {
    id: 'addon-basement-suite',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Full Basement Suite (Kitchenette + Bath)',
    shortName: 'Basement Suite',
    serviceType: 'Add-on',
    baseHours: 2.0,
    cleanersCount: 1,
    basePrice: 125.00,
    depositRequired: 25.00,
    taxable: true,
    jobberItemName: 'Basement Suite Complete Detail',
    description: 'Complete clean of basement rental or mother-in-law suite including kitchen/wet bar and full bathroom.',
    isAddon: true,
    isActive: true,
    sortOrder: 460,
  },
  {
    id: 'addon-pet-hair',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Pet Hair & Heavy Dander Detail Treatment',
    shortName: 'Pet Hair Detail',
    serviceType: 'Add-on',
    baseHours: 0.5,
    cleanersCount: 1,
    basePrice: 35.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Pet Hair & Dander Sanitizer Treatment',
    description: 'Specialized rubber squeegee carpet raking and pet-safe botanical enzyme sanitizer application.',
    isAddon: true,
    isActive: true,
    sortOrder: 470,
  },
  {
    id: 'addon-blinds',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Blinds Hand-Dusting & Wipe (Per Room)',
    shortName: 'Blinds Detail',
    serviceType: 'Add-on',
    baseHours: 0.5,
    cleanersCount: 1,
    basePrice: 40.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Horizontal / Faux-Wood Blinds Detail',
    description: 'Hand dusting and microfiber wiping of horizontal slats on faux-wood or vinyl window blinds.',
    isAddon: true,
    isActive: true,
    sortOrder: 480,
  },
  {
    id: 'addon-balcony',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Balcony / Patio Sweep & Glass Clean',
    shortName: 'Balcony Sweep',
    serviceType: 'Add-on',
    baseHours: 0.5,
    cleanersCount: 1,
    basePrice: 35.00,
    depositRequired: 0.00,
    taxable: true,
    jobberItemName: 'Balcony / Deck Sweep & Sliding Glass Door',
    description: 'Sweep exterior debris, wipe railings, and clean exterior of sliding patio glass doors.',
    isAddon: true,
    isActive: true,
    sortOrder: 490,
  },
  {
    id: 'addon-fuel',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Fuel & Greater Edmonton Dispatch Surcharge',
    shortName: 'Fuel Surcharge',
    serviceType: 'Add-on',
    baseHours: 0,
    cleanersCount: 1,
    basePrice: 12.50,
    depositRequired: 0.00,
    taxable: false,
    jobberItemName: 'Fuel & Mobile Dispatch Surcharge',
    description: 'Standard mobile van deployment, transit insurance, and equipment sanitization fee.',
    isAddon: true,
    isActive: true,
    sortOrder: 500,
  },
];

/**
 * Finds the most relevant Service Catalog item for a given service name, bedrooms, and bathrooms.
 */
export function matchCatalogItem(
  serviceQuery: string,
  bedrooms?: string,
  bathrooms?: string,
  catalog: ServiceCatalogItem[] = CANONICAL_SERVICE_CATALOG
): ServiceCatalogItem | null {
  const normSvc = (serviceQuery || '').toLowerCase();
  const normBed = (bedrooms || '').toLowerCase();
  const normBath = (bathrooms || '').toLowerCase();

  // 1. Direct match by service + bed + bath
  const exact = catalog.find((item) => {
    if (!item.isActive) return false;
    const sameBed = normBed ? (item.bedrooms || '').toLowerCase() === normBed : true;
    const sameBath = normBath ? (item.bathrooms || '').toLowerCase() === normBath : true;
    const matchType =
      normSvc.includes('move') && item.category === 'MOVE_OUT'
        ? true
        : normSvc.includes('deep') && item.category === 'DEEP_CLEAN'
        ? true
        : normSvc.includes('post') && item.category === 'POST_CONSTRUCTION'
        ? true
        : (normSvc.includes('basic') || normSvc.includes('standard')) && item.category === 'STANDARD_CLEAN'
        ? true
        : normSvc.includes('bi-weekly') && item.category === 'RECURRING'
        ? true
        : false;

    return matchType && sameBed && sameBath;
  });

  if (exact) return exact;

  // 2. Fuzzy match on item name or shortName containing bed and bath
  if (normBed || normBath) {
    const bedDigit = normBed.match(/\d+/)?.[0];
    const bathDigit = normBath.match(/\d+(\.\d+)?/)?.[0];

    const digitMatch = catalog.find((item) => {
      if (!item.isActive) return false;
      const itemBedDigit = (item.bedrooms || '').match(/\d+/)?.[0];
      const itemBathDigit = (item.bathrooms || '').match(/\d+(\.\d+)?/)?.[0];
      const categoryMatch =
        normSvc.includes('move') && item.category === 'MOVE_OUT'
          ? true
          : normSvc.includes('deep') && item.category === 'DEEP_CLEAN'
          ? true
          : normSvc.includes('post') && item.category === 'POST_CONSTRUCTION'
          ? true
          : normSvc.includes('basic') && item.category === 'STANDARD_CLEAN';

      return categoryMatch && (!bedDigit || itemBedDigit === bedDigit) && (!bathDigit || itemBathDigit === bathDigit);
    });

    if (digitMatch) return digitMatch;
  }

  // 3. Fallback to category default
  if (normSvc.includes('move')) {
    return catalog.find((item) => item.id === 'cat-mo-3b2b-std') || catalog[0];
  }
  if (normSvc.includes('deep')) {
    return catalog.find((item) => item.id === 'cat-dc-3b2b') || catalog[10];
  }
  if (normSvc.includes('post')) {
    return catalog.find((item) => item.id === 'cat-pc-3b25b') || catalog[20];
  }
  if (normSvc.includes('basic') || normSvc.includes('standard')) {
    return catalog.find((item) => item.id === 'cat-sc-3b2b') || catalog[15];
  }

  return null;
}

/**
 * Intelligent parser that can take ANY user-provided price list text,
 * whether from email, spreadsheet, CSV, tab-delimited, or bulleted list,
 * and extract structured ServiceCatalogItem records.
 */
export function parsePastedPriceList(rawText: string): ServiceCatalogItem[] {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();

  // Try JSON parsing first
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: item.id || `custom-cat-${Date.now()}-${idx}`,
          category: item.category || 'STANDARD_CLEAN',
          categoryLabel: item.categoryLabel || item.category || 'Custom Pricing',
          name: item.name || item.title || item.description || `Service Item #${idx + 1}`,
          shortName: item.shortName || item.name || `Item ${idx + 1}`,
          serviceType: item.serviceType || 'Standard Cleaning',
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          baseHours: Number(item.baseHours || item.hours) || 3.0,
          cleanersCount: Number(item.cleanersCount || item.cleaners) || 1,
          basePrice: Number(item.basePrice || item.price || item.total) || 200,
          depositRequired: Number(item.depositRequired || item.deposit) || 50,
          taxable: item.taxable !== false,
          jobberItemName: item.jobberItemName || item.name,
          description: item.description || item.name,
          isAddon: Boolean(item.isAddon),
          isActive: true,
          sortOrder: idx * 10,
        }));
      }
    } catch {
      // Continue to line-by-line parsing
    }
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const items: ServiceCatalogItem[] = [];

  let currentCategory: ServiceCatalogItem['category'] = 'STANDARD_CLEAN';
  let currentCategoryLabel = 'General Cleaning Services';

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // Check for section header like "=== MOVE OUT CLEANING ===" or "Deep Cleaning:"
    if (
      line.startsWith('#') ||
      line.startsWith('===') ||
      line.startsWith('---') ||
      (!line.match(/\$|\b\d+(\.\d{2})?\b/) && line.endsWith(':'))
    ) {
      const cleanHeader = line.replace(/[#=\-:*]/g, '').trim().toLowerCase();
      if (cleanHeader.includes('move out') || cleanHeader.includes('move-out') || cleanHeader.includes('moveout')) {
        currentCategory = 'MOVE_OUT';
        currentCategoryLabel = 'Move-Out Cleaning';
      } else if (cleanHeader.includes('deep')) {
        currentCategory = 'DEEP_CLEAN';
        currentCategoryLabel = 'Deep Cleaning Services';
      } else if (cleanHeader.includes('post') || cleanHeader.includes('construction')) {
        currentCategory = 'POST_CONSTRUCTION';
        currentCategoryLabel = 'MoveIn - Post Construction';
      } else if (cleanHeader.includes('add') || cleanHeader.includes('extra')) {
        currentCategory = 'ADD_ON';
        currentCategoryLabel = 'Add-on Services';
      } else if (cleanHeader.includes('recur') || cleanHeader.includes('bi-weekly')) {
        currentCategory = 'RECURRING';
        currentCategoryLabel = 'Bi-Weekly Recurring Residential Clean';
      } else if (cleanHeader.includes('hour') || cleanHeader.includes('rate')) {
        currentCategory = 'HOURLY';
        currentCategoryLabel = 'Hourly Crew Rates';
      } else {
        currentCategory = 'STANDARD_CLEAN';
        currentCategoryLabel = line.replace(/[#=\-:*]/g, '').trim();
      }
      continue;
    }

    // Try CSV or TSV splitting: Name, Price, [Hours], [Category], [Bed], [Bath]
    const delimiter = line.includes('\t') ? '\t' : line.includes(',') ? ',' : null;
    let name = line;
    let price = 0;
    let hours = 3.0;

    // Price extraction: look for $XXX or XXX.XX
    const priceMatch = line.match(/\$\s*(\d+(?:\.\d{1,2})?)/) || line.match(/\b(\d+(?:\.\d{2}))\b/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
    }

    if (delimiter) {
      const cols = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2) {
        name = cols[0];
        const colPrice = parseFloat(cols[1].replace(/[^\d.]/g, ''));
        if (!isNaN(colPrice) && colPrice > 0) price = colPrice;
        if (cols[2]) {
          const colHours = parseFloat(cols[2].replace(/[^\d.]/g, ''));
          if (!isNaN(colHours) && colHours > 0) hours = colHours;
        }
      }
    } else {
      // Plain text like: "3 Bed / 2 Bath Move Out: $325" or "Inside Oven - $45"
      name = line.replace(/\s*[-:—]\s*\$\s*\d+(\.\d{1,2})?.*$/i, '').trim();
    }

    if (price <= 0) continue; // Skip lines with no price

    // Extract bedrooms and bathrooms
    const bedMatch = line.match(/(\d+)\s*(?:bed|bedroom)/i);
    const bathMatch = line.match(/(\d+(?:\.5)?)\s*(?:bath|bathroom)/i);

    const bedrooms = bedMatch ? `${bedMatch[1]} Bedroom${bedMatch[1] === '1' ? '' : 's'}` : undefined;
    const bathrooms = bathMatch ? `${bathMatch[1]} Bathroom${bathMatch[1] === '1' ? '' : 's'}` : undefined;

    // Determine category if not explicitly in header
    let category = currentCategory;
    let categoryLabel = currentCategoryLabel;
    const lowerName = name.toLowerCase();

    if (lowerName.includes('move out') || lowerName.includes('move-out') || lowerName.includes('moveout')) {
      category = 'MOVE_OUT';
      categoryLabel = 'Move-Out Cleaning';
    } else if (lowerName.includes('deep')) {
      category = 'DEEP_CLEAN';
      categoryLabel = 'Deep Cleaning Services';
    } else if (lowerName.includes('post') || lowerName.includes('construction')) {
      category = 'POST_CONSTRUCTION';
      categoryLabel = 'MoveIn - Post Construction';
    } else if (
      lowerName.includes('oven') ||
      lowerName.includes('fridge') ||
      lowerName.includes('cabinet') ||
      lowerName.includes('baseboard') ||
      lowerName.includes('window') ||
      lowerName.includes('basement') ||
      lowerName.includes('pet hair')
    ) {
      category = 'ADD_ON';
      categoryLabel = 'Add-on Services';
    } else if (lowerName.includes('hour') || lowerName.includes('/hr')) {
      category = 'HOURLY';
      categoryLabel = 'Hourly Crew Rates';
    }

    const isAddon = category === 'ADD_ON';
    const depositRequired = price >= 400 ? 125 : price >= 300 ? 100 : price >= 180 ? 50 : 0;

    items.push({
      id: `custom-cat-${Date.now()}-${idx}`,
      category,
      categoryLabel,
      name,
      shortName: name.length > 35 ? `${name.slice(0, 32)}...` : name,
      serviceType:
        category === 'MOVE_OUT'
          ? 'Move-Out Cleaning'
          : category === 'DEEP_CLEAN'
          ? 'Deep Cleaning'
          : category === 'POST_CONSTRUCTION'
          ? 'Post-Construction Cleaning'
          : category === 'ADD_ON'
          ? 'Add-on'
          : 'Standard Cleaning',
      bedrooms,
      bathrooms,
      baseHours: hours,
      cleanersCount: price >= 400 ? 2 : 1,
      basePrice: Math.round(price * 100) / 100,
      depositRequired,
      taxable: true,
      jobberItemName: name,
      description: `${name}${bedrooms ? ` (${bedrooms}${bathrooms ? `, ${bathrooms}` : ''})` : ''} - Tidyups Cleaning Service`,
      isAddon,
      isActive: true,
      sortOrder: (idx + 1) * 10,
    });
  }

  return items;
}
