/**
 * Canonical Service Catalog & Price List for Tidyups Cleaning Service Inc.
 * Synchronized with Jobber Products & Services Line Items
 * 
 * Supports exact Jobber line item schema:
 * - Service Name / Jobber Line Item
 * - Category
 * - Beds & Baths
 * - Quantity (units or labor hours)
 * - Unit Price (CAD)
 * - Total (CAD) = Quantity * Unit Price
 * - Status & Active flag
 */

import * as XLSX from 'xlsx';

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
  beds?: string;
  baths?: string;
  quantity: number; // e.g. 3, 1, 2.5
  unitPrice: number; // e.g. 105.00
  total: number; // Quantity * Unit Price = 315.00
  basePrice: number; // Backward-compatibility alias = total
  baseHours: number; // Backward-compatibility alias = quantity
  cleanersCount: number;
  depositRequired: number;
  taxable: boolean;
  jobberItemName: string;
  description: string;
  isAddon?: boolean;
  status?: string; // 'Active', 'Standard', 'Draft'
  isActive: boolean; // Active?
  sortOrder: number;
}

export const CANONICAL_SERVICE_CATALOG: ServiceCatalogItem[] = [
  // ── 1. MOVE-OUT CLEANING 2026 (Jobber Line Items: 2 Pro Cleaners @ $105/hr) ──
  {
    id: 'cat-mo-1b1b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '1Bed 1Bath Moveout Cleaning - Online Booking',
    shortName: '1 Bed / 1 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '1 Bedroom',
    bathrooms: '1 Bathroom',
    beds: '1 Bed',
    baths: '1 Bath',
    quantity: 2.5,
    unitPrice: 105.00,
    total: 262.50,
    basePrice: 262.50,
    baseHours: 2.5,
    cleanersCount: 2,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '1Bed 1Bath Moveout Cleaning - Online Booking',
    description: "1Bed 1Bath Moveout Cleaning\n2 Pro Cleaners\nIncludes Fuel Surcharge",
    status: 'Active',
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'cat-mo-2b1b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '2Bed 1Bath Moveout Cleaning - Online Booking (Basement Suite)',
    shortName: '2 Bed / 1 Bath Basement Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '1 Bathroom',
    beds: '2 Bed',
    baths: '1 Bath',
    quantity: 3.0,
    unitPrice: 105.00,
    total: 315.00,
    basePrice: 315.00,
    baseHours: 3.0,
    cleanersCount: 2,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '2Bed 1Bath Moveout Cleaning - Online Booking (Basement Suite)',
    description: "2Bed 1Bath Moveout Cleaning (Basement Suite)\n2 Pro Cleaners\nIncludes Fuel Surcharge",
    status: 'Active',
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'cat-mo-2b2b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '2Bed 2Bath Moveout Cleaning - Online Booking',
    shortName: '2 Bed / 2 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '2 Bathrooms',
    beds: '2 Bed',
    baths: '2 Bath',
    quantity: 3.0,
    unitPrice: 105.00,
    total: 315.00,
    basePrice: 315.00,
    baseHours: 3.0,
    cleanersCount: 2,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '2Bed 2Bath Moveout Cleaning - Online Booking',
    description: "2Bed 2Bath Moveout Cleaning\n2 Pro Cleaners\nIncludes Fuel Surcharge",
    status: 'Active',
    isActive: true,
    sortOrder: 30,
  },
  {
    id: 'cat-mo-3b2b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '3Bed 2Bath Moveout Cleaning - Online Booking',
    shortName: '3 Bed / 2 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2 Bathrooms',
    beds: '3 Bed',
    baths: '2 Bath',
    quantity: 3.5,
    unitPrice: 105.00,
    total: 367.50,
    basePrice: 367.50,
    baseHours: 3.5,
    cleanersCount: 2,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '3Bed 2Bath Moveout Cleaning - Online Booking',
    description: "3Bed 2Bath Moveout Cleaning\n2 Pro Cleaners\nIncludes Fuel Surcharge",
    status: 'Active',
    isActive: true,
    sortOrder: 40,
  },
  {
    id: 'cat-mo-3b25b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '3Bed 2.5Bath Moveout Cleaning - Online Booking',
    shortName: '3 Bed / 2.5 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    beds: '3 Bed',
    baths: '2.5 Bath',
    quantity: 4.0,
    unitPrice: 105.00,
    total: 420.00,
    basePrice: 420.00,
    baseHours: 4.0,
    cleanersCount: 2,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '3Bed 2.5Bath Moveout Cleaning - Online Booking',
    description: "3Bed 2.5Bath Moveout Cleaning\n2 Pro Cleaners\nIncludes Fuel Surcharge",
    status: 'Active',
    isActive: true,
    sortOrder: 50,
  },
  {
    id: 'cat-mo-4b3b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '4Bed 3Bath Moveout Cleaning - Online Booking',
    shortName: '4 Bed / 3 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '3 Bathrooms',
    beds: '4 Bed',
    baths: '3 Bath',
    quantity: 4.5,
    unitPrice: 105.00,
    total: 472.50,
    basePrice: 472.50,
    baseHours: 4.5,
    cleanersCount: 2,
    depositRequired: 125.00,
    taxable: true,
    jobberItemName: '4Bed 3Bath Moveout Cleaning - Online Booking',
    description: "4Bed 3Bath Moveout Cleaning\n2 Pro Cleaners\nIncludes Fuel Surcharge",
    status: 'Active',
    isActive: true,
    sortOrder: 60,
  },
  {
    id: 'cat-mo-4b4b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '4Bed 4Bath Moveout Cleaning - Online Booking',
    shortName: '4 Bed / 4 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '4 Bedrooms',
    bathrooms: '4 Bathrooms',
    beds: '4 Bed',
    baths: '4 Bath',
    quantity: 5.0,
    unitPrice: 105.00,
    total: 525.00,
    basePrice: 525.00,
    baseHours: 5.0,
    cleanersCount: 2,
    depositRequired: 125.00,
    taxable: true,
    jobberItemName: '4Bed 4Bath Moveout Cleaning - Online Booking',
    description: "4Bed 4Bath Moveout Cleaning\n2 Pro Cleaners\nIncludes Fuel Surcharge",
    status: 'Active',
    isActive: true,
    sortOrder: 70,
  },
  {
    id: 'cat-mo-5b4b',
    category: 'MOVE_OUT',
    categoryLabel: 'Move-Out Cleaning 2026',
    name: '5Bed 4Bath Moveout Cleaning - Online Booking',
    shortName: '5 Bed / 4 Bath Move-Out',
    serviceType: 'Move-Out Cleaning',
    bedrooms: '5 Bedrooms',
    bathrooms: '4 Bathrooms',
    beds: '5 Bed',
    baths: '4 Bath',
    quantity: 5.5,
    unitPrice: 105.00,
    total: 577.50,
    basePrice: 577.50,
    baseHours: 5.5,
    cleanersCount: 2,
    depositRequired: 150.00,
    taxable: true,
    jobberItemName: '5Bed 4Bath Moveout Cleaning - Online Booking',
    description: "5Bed 4Bath Moveout Cleaning\n2 Pro Cleaners\nIncludes Fuel Surcharge",
    status: 'Active',
    isActive: true,
    sortOrder: 80,
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
    beds: '1 Bed',
    baths: '1 Bath',
    quantity: 2.0,
    unitPrice: 105.00,
    total: 210.00,
    basePrice: 210.00,
    baseHours: 2.0,
    cleanersCount: 2,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '1Bed 1Bath Deep Cleaning 2026',
    description: "1Bed 1Bath Deep Cleaning 2026\n2 Pro Cleaners hand-scrubbing kitchen, bath, high touch surfaces",
    status: 'Active',
    isActive: true,
    sortOrder: 90,
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
    beds: '2 Bed',
    baths: '1 Bath',
    quantity: 2.5,
    unitPrice: 105.00,
    total: 262.50,
    basePrice: 262.50,
    baseHours: 2.5,
    cleanersCount: 2,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '2Bed 1Bath Deep Cleaning 2026',
    description: "2Bed 1Bath Deep Cleaning 2026\n2 Pro Cleaners hand-scrubbing kitchen, bath, high touch surfaces",
    status: 'Active',
    isActive: true,
    sortOrder: 100,
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
    beds: '2 Bed',
    baths: '2 Bath',
    quantity: 3.0,
    unitPrice: 105.00,
    total: 315.00,
    basePrice: 315.00,
    baseHours: 3.0,
    cleanersCount: 2,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: '2Bed 2Bath Deep Cleaning 2026',
    description: "2Bed 2Bath Deep Cleaning 2026\n2 Pro Cleaners tandem crew deep sanitize",
    status: 'Active',
    isActive: true,
    sortOrder: 110,
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
    beds: '3 Bed',
    baths: '2 Bath',
    quantity: 3.5,
    unitPrice: 105.00,
    total: 367.50,
    basePrice: 367.50,
    baseHours: 3.5,
    cleanersCount: 2,
    depositRequired: 75.00,
    taxable: true,
    jobberItemName: '3Bed 2Bath Deep Cleaning 2026',
    description: "3Bed 2Bath Deep Cleaning 2026\n2 Pro Cleaners tandem crew deep sanitize",
    status: 'Active',
    isActive: true,
    sortOrder: 120,
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
    beds: '3 Bed',
    baths: '2.5 Bath',
    quantity: 4.0,
    unitPrice: 105.00,
    total: 420.00,
    basePrice: 420.00,
    baseHours: 4.0,
    cleanersCount: 2,
    depositRequired: 75.00,
    taxable: true,
    jobberItemName: '3Bed 2.5Bath Deep Cleaning 2026',
    description: "3Bed 2.5Bath Deep Cleaning 2026\n2 Pro Cleaners tandem crew",
    status: 'Active',
    isActive: true,
    sortOrder: 130,
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
    beds: '4 Bed',
    baths: '3 Bath',
    quantity: 4.25,
    unitPrice: 105.00,
    total: 446.25,
    basePrice: 446.25,
    baseHours: 4.25,
    cleanersCount: 2,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '4Bed 3Bath Deep Cleaning 2026',
    description: "4Bed 3Bath Deep Cleaning 2026\n2 Pro Cleaners comprehensive sanitization",
    status: 'Active',
    isActive: true,
    sortOrder: 140,
  },

  // ── 3. STANDARD RESIDENTIAL CLEANING 2026 ──
  {
    id: 'cat-std-1b1b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '1Bed 1Bath Standard Residential Clean',
    shortName: '1 Bed / 1 Bath Standard',
    serviceType: 'Standard Cleaning',
    bedrooms: '1 Bedroom',
    bathrooms: '1 Bathroom',
    beds: '1 Bed',
    baths: '1 Bath',
    quantity: 2.0,
    unitPrice: 65.00,
    total: 130.00,
    basePrice: 130.00,
    baseHours: 2.0,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: '1Bed 1Bath Standard Residential Clean',
    description: "Standard regular maintenance clean for 1 Bed / 1 Bath home",
    status: 'Active',
    isActive: true,
    sortOrder: 150,
  },
  {
    id: 'cat-std-2b1b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '2Bed 1Bath Standard Residential Clean',
    shortName: '2 Bed / 1 Bath Standard',
    serviceType: 'Standard Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '1 Bathroom',
    beds: '2 Bed',
    baths: '1 Bath',
    quantity: 2.5,
    unitPrice: 65.00,
    total: 162.50,
    basePrice: 162.50,
    baseHours: 2.5,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: '2Bed 1Bath Standard Residential Clean',
    description: "Standard regular maintenance clean for 2 Bed / 1 Bath home",
    status: 'Active',
    isActive: true,
    sortOrder: 160,
  },
  {
    id: 'cat-std-3b2b',
    category: 'STANDARD_CLEAN',
    categoryLabel: 'Initial Basic / Standard Cleaning 2026',
    name: '3Bed 2Bath Standard Residential Clean',
    shortName: '3 Bed / 2 Bath Standard',
    serviceType: 'Standard Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2 Bathrooms',
    beds: '3 Bed',
    baths: '2 Bath',
    quantity: 3.0,
    unitPrice: 65.00,
    total: 195.00,
    basePrice: 195.00,
    baseHours: 3.0,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: '3Bed 2Bath Standard Residential Clean',
    description: "Standard regular maintenance clean for 3 Bed / 2 Bath home",
    status: 'Active',
    isActive: true,
    sortOrder: 170,
  },

  // ── 4. POST-CONSTRUCTION / MOVE-IN ──
  {
    id: 'cat-pc-2b2b',
    category: 'POST_CONSTRUCTION',
    categoryLabel: 'MoveIn - Post Construction',
    name: '2Bed 2Bath MoveIn - Post Construction Clean',
    shortName: '2 Bed / 2 Bath Post-Con',
    serviceType: 'Post-Construction Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '2 Bathrooms',
    beds: '2 Bed',
    baths: '2 Bath',
    quantity: 4.0,
    unitPrice: 110.00,
    total: 440.00,
    basePrice: 440.00,
    baseHours: 4.0,
    cleanersCount: 2,
    depositRequired: 100.00,
    taxable: true,
    jobberItemName: '2Bed 2Bath MoveIn - Post Construction Clean',
    description: "Drywall dust extraction, sticker removal, fixtures polish, HEPA filter air scrub",
    status: 'Active',
    isActive: true,
    sortOrder: 180,
  },
  {
    id: 'cat-pc-3b25b',
    category: 'POST_CONSTRUCTION',
    categoryLabel: 'MoveIn - Post Construction',
    name: '3Bed 2.5Bath MoveIn - Post Construction Clean',
    shortName: '3 Bed / 2.5 Bath Post-Con',
    serviceType: 'Post-Construction Cleaning',
    bedrooms: '3 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    beds: '3 Bed',
    baths: '2.5 Bath',
    quantity: 4.5,
    unitPrice: 110.00,
    total: 495.00,
    basePrice: 495.00,
    baseHours: 4.5,
    cleanersCount: 2,
    depositRequired: 125.00,
    taxable: true,
    jobberItemName: '3Bed 2.5Bath MoveIn - Post Construction Clean',
    description: "Detailed post-construction drywall dust scrubbing and turnkey move-in detailing",
    status: 'Active',
    isActive: true,
    sortOrder: 190,
  },

  // ── 5. ADD-ON LINE ITEMS (Matches Jobber screenshot exactly!) ──
  {
    id: 'addon-fuel',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Fuel Surcharge 2',
    shortName: 'Fuel Surcharge 2',
    serviceType: 'Add-on',
    quantity: 1.0,
    unitPrice: 12.50,
    total: 12.50,
    basePrice: 12.50,
    baseHours: 0,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: false,
    jobberItemName: 'Fuel Surcharge 2',
    description: 'Fuel Surcharge 2',
    isAddon: true,
    status: 'Active',
    isActive: true,
    sortOrder: 200,
  },
  {
    id: 'addon-discount-10',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Discount $10 Facebook Ad',
    shortName: 'Discount $10 FB Promo',
    serviceType: 'Add-on',
    quantity: 1.0,
    unitPrice: -10.00,
    total: -10.00,
    basePrice: -10.00,
    baseHours: 0,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: false,
    jobberItemName: 'Discount $10 Facebook Ad',
    description: 'Discount $10 Facebook Ad Promo',
    isAddon: true,
    status: 'Active',
    isActive: true,
    sortOrder: 210,
  },
  {
    id: 'addon-oven',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Inside Oven Deep Cleaning',
    shortName: 'Inside Oven',
    serviceType: 'Add-on',
    quantity: 1.0,
    unitPrice: 45.00,
    total: 45.00,
    basePrice: 45.00,
    baseHours: 0.75,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: 'Inside Oven Deep Cleaning',
    description: 'Degrease and scrub inside of oven, racks, interior glass door, and heating elements.',
    isAddon: true,
    status: 'Active',
    isActive: true,
    sortOrder: 220,
  },
  {
    id: 'addon-fridge',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Inside Refrigerator & Freezer Deep Clean',
    shortName: 'Inside Fridge',
    serviceType: 'Add-on',
    quantity: 1.0,
    unitPrice: 45.00,
    total: 45.00,
    basePrice: 45.00,
    baseHours: 0.75,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: 'Inside Refrigerator & Freezer Deep Clean',
    description: 'Wash and sanitize shelves, crispers, door seals, and wipe interior walls.',
    isAddon: true,
    status: 'Active',
    isActive: true,
    sortOrder: 230,
  },
  {
    id: 'addon-cabinets',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Inside Kitchen Cabinets & Drawers Detail',
    shortName: 'Inside Cabinets',
    serviceType: 'Add-on',
    quantity: 1.0,
    unitPrice: 55.00,
    total: 55.00,
    basePrice: 55.00,
    baseHours: 1.0,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: 'Inside Kitchen Cabinets & Drawers Detail',
    description: 'Vacuum crumbs and wipe down inside shelves and drawers throughout the kitchen.',
    isAddon: true,
    status: 'Active',
    isActive: true,
    sortOrder: 240,
  },
  {
    id: 'addon-baseboards',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Baseboards Hand-Scrub & Detail',
    shortName: 'Baseboards Detail',
    serviceType: 'Add-on',
    quantity: 1.0,
    unitPrice: 60.00,
    total: 60.00,
    basePrice: 60.00,
    baseHours: 1.0,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: 'Baseboards Hand-Scrub & Detail',
    description: 'Detailed hand wipe and scrub of baseboards throughout the entire home to remove scuffs.',
    isAddon: true,
    status: 'Active',
    isActive: true,
    sortOrder: 250,
  },
  {
    id: 'addon-windows',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Interior Windows & Tracks (Up to 10 Panes)',
    shortName: 'Interior Windows',
    serviceType: 'Add-on',
    quantity: 1.0,
    unitPrice: 50.00,
    total: 50.00,
    basePrice: 50.00,
    baseHours: 1.0,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: 'Interior Windows & Tracks (Up to 10 Panes)',
    description: 'Squeegee and polish interior window glass, vacuum and wipe window tracks and sills.',
    isAddon: true,
    status: 'Active',
    isActive: true,
    sortOrder: 260,
  },
  {
    id: 'addon-basement',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Finished Basement Living Area',
    shortName: 'Basement Living Area',
    serviceType: 'Add-on',
    quantity: 1.0,
    unitPrice: 85.00,
    total: 85.00,
    basePrice: 85.00,
    baseHours: 1.5,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: 'Finished Basement Living Area',
    description: 'Dust surfaces, vacuum carpets, mop floors, clean living/rec area.',
    isAddon: true,
    status: 'Active',
    isActive: true,
    sortOrder: 270,
  },
  {
    id: 'addon-pet-hair',
    category: 'ADD_ON',
    categoryLabel: 'Add-on Services',
    name: 'Pet Hair & Heavy Dander Detail Treatment',
    shortName: 'Pet Hair Detail',
    serviceType: 'Add-on',
    quantity: 1.0,
    unitPrice: 35.00,
    total: 35.00,
    basePrice: 35.00,
    baseHours: 0.5,
    cleanersCount: 1,
    depositRequired: 0,
    taxable: true,
    jobberItemName: 'Pet Hair & Heavy Dander Detail Treatment',
    description: 'Rubber squeegee carpet raking and pet-safe enzyme sanitizer application.',
    isAddon: true,
    status: 'Active',
    isActive: true,
    sortOrder: 280,
  },

  // ── 6. HOURLY RATES ──
  {
    id: 'cat-hr-1cleaner',
    category: 'HOURLY',
    categoryLabel: 'Hourly Crew Rates',
    name: 'Solo Cleaner Hourly Rate ($52.50/hr)',
    shortName: '1 Cleaner @ $52.50/hr',
    serviceType: 'Standard Cleaning',
    quantity: 1.0,
    unitPrice: 52.50,
    total: 52.50,
    basePrice: 52.50,
    baseHours: 1.0,
    cleanersCount: 1,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: 'Solo Cleaner Hourly Rate ($52.50/hr)',
    description: 'Billed per labor hour for 1 professional cleaner with eco supplies and equipment.',
    status: 'Active',
    isActive: true,
    sortOrder: 290,
  },
  {
    id: 'cat-hr-2cleaners',
    category: 'HOURLY',
    categoryLabel: 'Hourly Crew Rates',
    name: 'Tandem Crew Rate (2 Cleaners @ $105.00/hr)',
    shortName: '2 Cleaners @ $105.00/hr',
    serviceType: 'Deep Cleaning',
    quantity: 1.0,
    unitPrice: 105.00,
    total: 105.00,
    basePrice: 105.00,
    baseHours: 1.0,
    cleanersCount: 2,
    depositRequired: 50.00,
    taxable: true,
    jobberItemName: 'Tandem Crew Rate (2 Cleaners @ $105.00/hr)',
    description: 'Billed per clock hour for a 2-cleaner tandem crew (provides 2 person-hours per clock hour).',
    status: 'Active',
    isActive: true,
    sortOrder: 300,
  },
];

/**
 * Parses spreadsheet array buffer (Excel .xlsx, .xls, .csv, .tsv) using SheetJS XLSX
 */
export function parseSpreadsheetBuffer(buffer: ArrayBuffer | Uint8Array): {
  headers: string[];
  rows: any[][];
  rawText: string;
} {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const rawText = XLSX.utils.sheet_to_csv(worksheet, { FS: '\t' });
  const headers = rows.length > 0 ? rows[0].map((h) => String(h || '').trim()) : [];
  return { headers, rows, rawText };
}

/**
 * Parses user price list text, CSV, TSV, or spreadsheet rows.
 * Explicitly supports the user's canonical spreadsheet columns:
 * SERVICE NAME/JOBBER LINE ITEM | CATEGORY | BEDS | BATHS | QUANTITY | UNIT PRICE (CAD) | TOTAL (CAD) | STATUS | ACTIVE?
 */
export function parsePastedPriceList(
  input: string | any[][],
  existingCatalog: ServiceCatalogItem[] = CANONICAL_SERVICE_CATALOG
): ServiceCatalogItem[] {
  let rawRows: string[][] = [];

  if (Array.isArray(input)) {
    rawRows = input
      .filter((r) => Array.isArray(r) && r.some((c) => String(c || '').trim().length > 0))
      .map((r) => r.map((c) => String(c ?? '').trim()));
  } else if (typeof input === 'string') {
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // Detect delimiter: tab or comma
    for (const line of lines) {
      if (line.includes('\t')) {
        rawRows.push(line.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, '')));
      } else if (line.includes(',')) {
        // Simple CSV parse handling quotes
        const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (match && match.length > 1) {
          rawRows.push(match.map((c) => c.trim().replace(/^["']|["']$/g, '')));
        } else {
          rawRows.push(line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, '')));
        }
      } else {
        rawRows.push([line]);
      }
    }
  }

  if (rawRows.length === 0) return [];

  // Check if first row is a header row
  let headerIndex = -1;
  let colServiceName = 0;
  let colCategory = -1;
  let colBeds = -1;
  let colBaths = -1;
  let colQuantity = -1;
  let colUnitPrice = -1;
  let colTotal = -1;
  let colStatus = -1;
  let colActive = -1;

  for (let r = 0; r < Math.min(5, rawRows.length); r++) {
    const row = rawRows[r];
    const joined = row.join(' ').toLowerCase();
    if (
      joined.includes('service') ||
      joined.includes('item') ||
      joined.includes('unit price') ||
      joined.includes('quantity') ||
      joined.includes('total') ||
      joined.includes('category')
    ) {
      headerIndex = r;
      // Map columns
      row.forEach((col, idx) => {
        const c = col.toLowerCase().trim();
        if (/service\s*name|jobber\s*line\s*item|line\s*item|^service$|^name$/i.test(c)) {
          colServiceName = idx;
        } else if (/category|cat|^type$/i.test(c)) {
          colCategory = idx;
        } else if (/^beds?$|bedroom/i.test(c)) {
          colBeds = idx;
        } else if (/^baths?$|bathroom/i.test(c)) {
          colBaths = idx;
        } else if (/quantity|qty|units|^hours$/i.test(c)) {
          colQuantity = idx;
        } else if (/unit\s*price|rate|price\/hr|unit_price/i.test(c)) {
          colUnitPrice = idx;
        } else if (/^total|total\s*\(cad\)|total_price/i.test(c)) {
          colTotal = idx;
        } else if (/^status$/i.test(c)) {
          colStatus = idx;
        } else if (/active|active\?|is_active/i.test(c)) {
          colActive = idx;
        }
      });
      break;
    }
  }

  const dataRows = headerIndex !== -1 ? rawRows.slice(headerIndex + 1) : rawRows;
  const items: ServiceCatalogItem[] = [];

  let currentCategory: ServiceCatalogItem['category'] = 'MOVE_OUT';
  let currentCategoryLabel = 'Move-Out Cleaning 2026';

  dataRows.forEach((row, idx) => {
    if (!row || row.length === 0) return;
    const firstCell = String(row[0] || '').trim();
    if (!firstCell) return;

    // Detect section header rows if single cell
    if (row.length === 1 && (firstCell.startsWith('#') || firstCell.endsWith(':') || firstCell.toUpperCase() === firstCell)) {
      const cleanHeader = firstCell.toLowerCase();
      if (cleanHeader.includes('move') || cleanHeader.includes('turnover')) {
        currentCategory = 'MOVE_OUT';
        currentCategoryLabel = 'Move-Out Cleaning 2026';
      } else if (cleanHeader.includes('deep')) {
        currentCategory = 'DEEP_CLEAN';
        currentCategoryLabel = 'Deep Cleaning Services 2026';
      } else if (cleanHeader.includes('post') || cleanHeader.includes('construction')) {
        currentCategory = 'POST_CONSTRUCTION';
        currentCategoryLabel = 'MoveIn - Post Construction';
      } else if (cleanHeader.includes('add') || cleanHeader.includes('surcharge')) {
        currentCategory = 'ADD_ON';
        currentCategoryLabel = 'Add-on Services';
      } else if (cleanHeader.includes('hour') || cleanHeader.includes('rate')) {
        currentCategory = 'HOURLY';
        currentCategoryLabel = 'Hourly Crew Rates';
      } else if (cleanHeader.includes('recur') || cleanHeader.includes('bi-weekly')) {
        currentCategory = 'RECURRING';
        currentCategoryLabel = 'Bi-Weekly Recurring Residential Clean';
      }
      return;
    }

    let serviceName = '';
    let categoryStr = '';
    let bedsStr = '';
    let bathsStr = '';
    let quantityNum: number | undefined;
    let unitPriceNum: number | undefined;
    let totalNum: number | undefined;
    let statusStr = 'Active';
    let isActiveBool = true;

    if (headerIndex !== -1) {
      // Structured column extraction based on matched headers
      serviceName = (row[colServiceName] || '').trim();
      if (colCategory !== -1 && row[colCategory]) categoryStr = row[colCategory].trim();
      if (colBeds !== -1 && row[colBeds]) bedsStr = row[colBeds].trim();
      if (colBaths !== -1 && row[colBaths]) bathsStr = row[colBaths].trim();
      if (colQuantity !== -1 && row[colQuantity]) {
        const qParsed = parseFloat(String(row[colQuantity]).replace(/[^\d.-]/g, ''));
        if (!isNaN(qParsed)) quantityNum = qParsed;
      }
      if (colUnitPrice !== -1 && row[colUnitPrice]) {
        const upParsed = parseFloat(String(row[colUnitPrice]).replace(/[^\d.-]/g, ''));
        if (!isNaN(upParsed)) unitPriceNum = upParsed;
      }
      if (colTotal !== -1 && row[colTotal]) {
        const tParsed = parseFloat(String(row[colTotal]).replace(/[^\d.-]/g, ''));
        if (!isNaN(tParsed)) totalNum = tParsed;
      }
      if (colStatus !== -1 && row[colStatus]) statusStr = row[colStatus].trim();
      if (colActive !== -1 && row[colActive]) {
        const aVal = row[colActive].toLowerCase().trim();
        isActiveBool = aVal === 'yes' || aVal === 'true' || aVal === '1' || aVal === 'y';
      }
    } else if (row.length >= 4) {
      // Direct positional mapping if user pastes without headers:
      // [0] Name, [1] Category, [2] Beds, [3] Baths, [4] Quantity, [5] Unit Price, [6] Total
      serviceName = row[0].trim();
      categoryStr = row[1]?.trim() || '';
      bedsStr = row[2]?.trim() || '';
      bathsStr = row[3]?.trim() || '';
      if (row[4]) {
        const qp = parseFloat(String(row[4]).replace(/[^\d.-]/g, ''));
        if (!isNaN(qp)) quantityNum = qp;
      }
      if (row[5]) {
        const upp = parseFloat(String(row[5]).replace(/[^\d.-]/g, ''));
        if (!isNaN(upp)) unitPriceNum = upp;
      }
      if (row[6]) {
        const tp = parseFloat(String(row[6]).replace(/[^\d.-]/g, ''));
        if (!isNaN(tp)) totalNum = tp;
      }
    } else {
      // 2 or 3 columns: Name, Price, [Hours/Qty]
      serviceName = row[0].trim();
      if (row[1]) {
        const p1 = parseFloat(String(row[1]).replace(/[^\d.-]/g, ''));
        if (!isNaN(p1)) totalNum = p1;
      }
      if (row[2]) {
        const p2 = parseFloat(String(row[2]).replace(/[^\d.-]/g, ''));
        if (!isNaN(p2)) quantityNum = p2;
      }
    }

    // Freeform regex fallback for text lines like: "2 Bed 2 Bath Moveout: $315 (3.0 hrs @ $105)"
    if (!serviceName && row.length === 1) {
      serviceName = row[0].replace(/\s*[-:—]\s*\$?\s*\d+(\.\d{1,2})?.*$/i, '').trim();
    }
    if (unitPriceNum === undefined && totalNum === undefined) {
      const fullLine = row.join(' ');
      const priceMatch = fullLine.match(/\$\s*(-?\d+(?:\.\d{1,2})?)/);
      if (priceMatch) {
        totalNum = parseFloat(priceMatch[1]);
      }
    }

    // Bed / Bath extraction from service name if missing
    if (!bedsStr) {
      const bm = serviceName.match(/(\d+)\s*(?:bed|bedroom)/i);
      if (bm) bedsStr = `${bm[1]} Bedroom${bm[1] === '1' ? '' : 's'}`;
    }
    if (!bathsStr) {
      const btm = serviceName.match(/(\d+(?:\.5)?)\s*(?:bath|bathroom)/i);
      if (btm) bathsStr = `${btm[1]} Bathroom${btm[1] === '1' ? '' : 's'}`;
    }

    // Resolve mathematical relationships: Quantity, Unit Price, Total
    let finalQuantity = quantityNum !== undefined && quantityNum > 0 ? quantityNum : 1.0;
    let finalUnitPrice = unitPriceNum !== undefined ? unitPriceNum : 0;
    let finalTotal = totalNum !== undefined ? totalNum : 0;

    if (unitPriceNum !== undefined && totalNum !== undefined && (quantityNum === undefined || quantityNum <= 0)) {
      finalQuantity = unitPriceNum !== 0 ? Math.round((totalNum / unitPriceNum) * 100) / 100 : 1.0;
    } else if (quantityNum !== undefined && unitPriceNum !== undefined && totalNum === undefined) {
      finalTotal = Math.round(quantityNum * unitPriceNum * 100) / 100;
    } else if (quantityNum !== undefined && totalNum !== undefined && (unitPriceNum === undefined || unitPriceNum === 0)) {
      finalUnitPrice = quantityNum !== 0 ? Math.round((totalNum / quantityNum) * 100) / 100 : totalNum;
    } else if (totalNum !== undefined && unitPriceNum === undefined && quantityNum === undefined) {
      finalQuantity = 1.0;
      finalUnitPrice = totalNum;
      finalTotal = totalNum;
    } else if (unitPriceNum !== undefined && totalNum === undefined && quantityNum === undefined) {
      finalQuantity = 1.0;
      finalUnitPrice = unitPriceNum;
      finalTotal = unitPriceNum;
    }

    // If still no valid price or name, skip line
    if (!serviceName || (finalUnitPrice === 0 && finalTotal === 0 && finalQuantity === 0)) {
      return;
    }

    // Determine category
    let category = currentCategory;
    let categoryLabel = currentCategoryLabel;
    const lowerName = `${serviceName} ${categoryStr}`.toLowerCase();

    if (lowerName.includes('move out') || lowerName.includes('move-out') || lowerName.includes('moveout')) {
      category = 'MOVE_OUT';
      categoryLabel = 'Move-Out Cleaning 2026';
    } else if (lowerName.includes('deep')) {
      category = 'DEEP_CLEAN';
      categoryLabel = 'Deep Cleaning Services 2026';
    } else if (lowerName.includes('post') || lowerName.includes('construction') || lowerName.includes('movein') || lowerName.includes('move in')) {
      category = 'POST_CONSTRUCTION';
      categoryLabel = 'MoveIn - Post Construction';
    } else if (
      lowerName.includes('fuel') ||
      lowerName.includes('discount') ||
      lowerName.includes('oven') ||
      lowerName.includes('fridge') ||
      lowerName.includes('cabinet') ||
      lowerName.includes('baseboard') ||
      lowerName.includes('window') ||
      lowerName.includes('basement') ||
      lowerName.includes('pet hair') ||
      lowerName.includes('surcharge') ||
      lowerName.includes('add-on') ||
      lowerName.includes('addon')
    ) {
      category = 'ADD_ON';
      categoryLabel = 'Add-on Services';
    } else if (lowerName.includes('hour') || lowerName.includes('/hr') || lowerName.includes('crew rate')) {
      category = 'HOURLY';
      categoryLabel = 'Hourly Crew Rates';
    } else if (lowerName.includes('recur') || lowerName.includes('bi-weekly')) {
      category = 'RECURRING';
      categoryLabel = 'Bi-Weekly Recurring Residential Clean';
    } else if (categoryStr) {
      categoryLabel = categoryStr;
    }

    const isAddon = category === 'ADD_ON';
    const depositRequired = finalTotal >= 400 ? 125 : finalTotal >= 300 ? 100 : finalTotal >= 180 ? 50 : 0;

    items.push({
      id: `cat-import-${Date.now()}-${idx}`,
      category,
      categoryLabel,
      name: serviceName,
      shortName: serviceName.length > 35 ? `${serviceName.slice(0, 32)}...` : serviceName,
      serviceType:
        category === 'MOVE_OUT'
          ? 'Move-Out Cleaning'
          : category === 'DEEP_CLEAN'
          ? 'Deep Cleaning'
          : category === 'POST_CONSTRUCTION'
          ? 'Post-Construction Cleaning'
          : category === 'ADD_ON'
          ? 'Add-on'
          : category === 'HOURLY'
          ? 'Hourly Crew Rates' as any
          : 'Standard Cleaning',
      bedrooms: bedsStr || undefined,
      bathrooms: bathsStr || undefined,
      beds: bedsStr || undefined,
      baths: bathsStr || undefined,
      quantity: finalQuantity,
      unitPrice: finalUnitPrice,
      total: finalTotal,
      basePrice: finalTotal,
      baseHours: finalQuantity,
      cleanersCount: finalTotal >= 300 ? 2 : 1,
      depositRequired,
      taxable: true,
      jobberItemName: serviceName,
      description: `${serviceName}${bedsStr ? `\n${bedsStr}, ${bathsStr || ''}` : ''}\n${
        finalTotal >= 300 ? '2 Pro Cleaners\nIncludes Fuel Surcharge' : 'Tidyups Cleaning Service'
      }`,
      isAddon,
      status: statusStr || 'Active',
      isActive: isActiveBool,
      sortOrder: (idx + 1) * 10,
    });
  });

  return items;
}

/**
 * Helper to match an item in the service catalog based on service type & bed/bath count
 */
export function matchCatalogItem(
  serviceType: string,
  bedrooms?: string,
  bathrooms?: string,
  catalog: ServiceCatalogItem[] = CANONICAL_SERVICE_CATALOG
): ServiceCatalogItem | undefined {
  if (!catalog || catalog.length === 0) return undefined;

  const normService = (serviceType || '').toLowerCase();
  const normBed = (bedrooms || '').toLowerCase();
  const normBath = (bathrooms || '').toLowerCase();

  // Extract bed & bath digits
  const bedDigit = normBed.match(/\d+/)?.[0] || normService.match(/(\d+)\s*(?:bed|bedroom)/i)?.[1];
  const bathDigit = normBath.match(/[\d.]+/)?.[0] || normService.match(/(\d+(?:\.5)?)\s*(?:bath|bathroom)/i)?.[1];

  let targetCategory: ServiceCatalogItem['category'] = 'STANDARD_CLEAN';
  if (normService.includes('move out') || normService.includes('move-out') || normService.includes('moveout')) {
    targetCategory = 'MOVE_OUT';
  } else if (normService.includes('deep')) {
    targetCategory = 'DEEP_CLEAN';
  } else if (normService.includes('post') || normService.includes('construction') || normService.includes('move in')) {
    targetCategory = 'POST_CONSTRUCTION';
  } else if (normService.includes('recur') || normService.includes('bi-weekly')) {
    targetCategory = 'RECURRING';
  } else if (normService.includes('hour') || normService.includes('/hr')) {
    targetCategory = 'HOURLY';
  }

  // 1. Try exact match on category + bed digit + bath digit
  if (bedDigit && bathDigit) {
    const exact = catalog.find((item) => {
      if (item.category !== targetCategory) return false;
      const itemBed = (item.bedrooms || item.beds || item.name).toLowerCase();
      const itemBath = (item.bathrooms || item.baths || item.name).toLowerCase();
      return (
        itemBed.includes(`${bedDigit} bed`) &&
        (itemBath.includes(`${bathDigit} bath`) || itemBath.includes(`${bathDigit}bath`))
      );
    });
    if (exact) return exact;
  }

  // 2. Try match on category + bed digit
  if (bedDigit) {
    const bedMatch = catalog.find((item) => {
      if (item.category !== targetCategory) return false;
      const itemBed = (item.bedrooms || item.beds || item.name).toLowerCase();
      return itemBed.includes(`${bedDigit} bed`);
    });
    if (bedMatch) return bedMatch;
  }

  // 3. Fallback to first item in category
  const catMatch = catalog.find((item) => item.category === targetCategory);
  if (catMatch) return catMatch;

  return catalog[0];
}
