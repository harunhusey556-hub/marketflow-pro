import { supabase } from "@/integrations/supabase/client";

// Import all product images
import chickenFillet from "@/assets/products/chicken-fillet.jpg";
import chickenInnerFillet from "@/assets/products/chicken-inner-fillet.jpg";
import wholeChicken from "@/assets/products/whole-chicken.jpg";
import chickenQuarters from "@/assets/products/chicken-quarters.jpg";
import chickenDrumstick from "@/assets/products/chicken-drumstick.jpg";
import chickenWings from "@/assets/products/chicken-wings.jpg";
import chickenWingsPrime from "@/assets/products/chicken-wings-prime.jpg";
import chickenWingsInner from "@/assets/products/chicken-wings-inner.jpg";
import chickenThigh from "@/assets/products/chicken-thigh.jpg";
import chickenThighBonelessSkinless from "@/assets/products/chicken-thigh-boneless-skinless.jpg";
import chickenThighBoneless from "@/assets/products/chicken-thigh-boneless.jpg";
import chickenLiver from "@/assets/products/chicken-liver.jpg";
import chickenHearts from "@/assets/products/chicken-hearts.jpg";
import chickenGizzard from "@/assets/products/chicken-gizzard.jpg";
import chickenNuggets from "@/assets/products/chicken-nuggets.jpg";

import turkeyFillet from "@/assets/products/turkey-fillet.jpg";
import turkeyThigh from "@/assets/products/turkey-thigh.jpg";
import turkeyDrumstick from "@/assets/products/turkey-drumstick.jpg";
import turkeyWings from "@/assets/products/turkey-wings.jpg";
import turkeyMinced from "@/assets/products/turkey-minced.jpg";
import wholeTurkey from "@/assets/products/whole-turkey.jpg";

import beefCarcass from "@/assets/products/beef-carcass.jpg";
import beefKnuckle from "@/assets/products/beef-knuckle.jpg";
import beefStriploin from "@/assets/products/beef-striploin.jpg";
import beefTenderloin from "@/assets/products/beef-tenderloin.jpg";
import beefEntrecote from "@/assets/products/beef-entrecote.jpg";
import beefTrimming1090 from "@/assets/products/beef-trimming-10-90.jpg";
import beefTrimming2080 from "@/assets/products/beef-trimming-20-80.jpg";
import beefLeg from "@/assets/products/beef-leg.jpg";
import beefStomach from "@/assets/products/beef-stomach.jpg";
import beefTail from "@/assets/products/beef-tail.jpg";
import beefHeart from "@/assets/products/beef-heart.jpg";
import beefKidney from "@/assets/products/beef-kidney.jpg";
import beefTongue from "@/assets/products/beef-tongue.jpg";
import beefLiver from "@/assets/products/beef-liver.jpg";
import beefMince from "@/assets/products/beef-mince.jpg";
import beefFlank from "@/assets/products/beef-flank.jpg";

export const products = [
  // Chicken Products
  { name: "Chicken Fillet", name_fi: "Kanafile", category: "Poultry", price: 6.54, unit: "kg", image_url: chickenFillet },
  { name: "Chicken Inner Fillet", name_fi: "Kanan sisäfile", category: "Poultry", price: 6.62, unit: "kg", image_url: chickenInnerFillet },
  { name: "Whole Chicken", name_fi: "Kokokana", category: "Poultry", price: 3.14, unit: "kg", image_url: wholeChicken },
  { name: "Chicken Quarters", name_fi: "Kanan koipireisi", category: "Poultry", price: 3.14, unit: "kg", image_url: chickenQuarters },
  { name: "Chicken Drumstick", name_fi: "Kanan koipi", category: "Poultry", price: 2.80, unit: "kg", image_url: chickenDrumstick },
  { name: "Chicken Wings", name_fi: "Kanan siipi", category: "Poultry", price: 3.23, unit: "kg", image_url: chickenWings },
  { name: "Chicken Wings Prime", name_fi: "Kanan siipi prime", category: "Poultry", price: 3.31, unit: "kg", image_url: chickenWingsPrime },
  { name: "Chicken Wings Inner", name_fi: "Kanan siipi inner", category: "Poultry", price: 4.00, unit: "kg", image_url: chickenWingsInner },
  { name: "Chicken Thigh", name_fi: "Kanareisi", category: "Poultry", price: 2.88, unit: "kg", image_url: chickenThigh },
  { name: "Chicken Thigh Boneless-Skinless", name_fi: "Kanan koipireisi luuton", category: "Poultry", price: 5.63, unit: "kg", image_url: chickenThighBonelessSkinless },
  { name: "Chicken Thigh Boneless", name_fi: "Kana Koipi Ilmanluu", category: "Poultry", price: 5.46, unit: "kg", image_url: chickenThighBoneless },
  { name: "Chicken Liver", name_fi: "Kanan maksa", category: "Poultry", price: 1.89, unit: "pcs", image_url: chickenLiver },
  { name: "Chicken Hearts", name_fi: "Kanan sydän", category: "Poultry", price: 2.06, unit: "pcs", image_url: chickenHearts },
  { name: "Chicken Gizzard", name_fi: "Kanan kivipiira", category: "Poultry", price: 1.89, unit: "pcs", image_url: chickenGizzard },
  { name: "Chicken Nuggets", name_fi: "Kanan nugetti", category: "Poultry", price: 4.73, unit: "kg", image_url: chickenNuggets },

  // Turkey Products
  { name: "Turkey Fillet", name_fi: "Kalkkunafile", category: "Poultry", price: 8.77, unit: "kg", image_url: turkeyFillet },
  { name: "Turkey Thigh", name_fi: "Kalkkunan reisiliha", category: "Poultry", price: 5.93, unit: "kg", image_url: turkeyThigh },
  { name: "Turkey Drumstick", name_fi: "Kalkkunan koipi", category: "Poultry", price: 4.21, unit: "kg", image_url: turkeyDrumstick },
  { name: "Turkey Wings", name_fi: "Kalkkunan siipi", category: "Poultry", price: 4.43, unit: "kg", image_url: turkeyWings },
  { name: "Turkey Minced Meat", name_fi: "Kalkkunan jauheliha", category: "Poultry", price: 2.32, unit: "kg", image_url: turkeyMinced },
  { name: "Whole Turkey", name_fi: "Koko kalkkuna", category: "Poultry", price: 5.33, unit: "kg", image_url: wholeTurkey },

  // Beef Products
  { name: "Bull Carcass (200-250 kg)", name_fi: "Naudan ruho", category: "Meat", price: 6.97, unit: "kg", image_url: beefCarcass },
  { name: "Beef Knuckle Silverside", name_fi: "Naudan paisti", category: "Meat", price: 10.66, unit: "kg", image_url: beefKnuckle },
  { name: "Beef Striploin", name_fi: "Naudan ulkofile", category: "Meat", price: 11.95, unit: "kg", image_url: beefStriploin },
  { name: "Beef Tenderloin", name_fi: "Naudan sisäfile", category: "Meat", price: 18.15, unit: "kg", image_url: beefTenderloin },
  { name: "Beef Entrecôte", name_fi: "Naudan entrecote", category: "Meat", price: 11.27, unit: "kg", image_url: beefEntrecote },
  { name: "Beef Trimming (10/90)", name_fi: "Naudan triming 10/90", category: "Meat", price: 8.51, unit: "kg", image_url: beefTrimming1090 },
  { name: "Beef Trimming (20/80)", name_fi: "Naudan triming 20/80", category: "Meat", price: 8.08, unit: "kg", image_url: beefTrimming2080 },
  { name: "Beef Leg", name_fi: "Naudan jalka", category: "Meat", price: 3.01, unit: "kg", image_url: beefLeg },
  { name: "Beef Stomach", name_fi: "Naudan maha", category: "Meat", price: 3.35, unit: "kg", image_url: beefStomach },
  { name: "Beef Tail", name_fi: "Naudan häntä", category: "Meat", price: 6.45, unit: "kg", image_url: beefTail },
  { name: "Beef Heart", name_fi: "Naudan sydän", category: "Meat", price: 3.87, unit: "kg", image_url: beefHeart },
  { name: "Beef Kidney", name_fi: "Naudan munuainen", category: "Meat", price: 3.01, unit: "kg", image_url: beefKidney },
  { name: "Beef Tongue", name_fi: "Naudan kieli", category: "Meat", price: 6.45, unit: "kg", image_url: beefTongue },
  { name: "Beef Liver", name_fi: "Naudan maksa", category: "Meat", price: 3.01, unit: "kg", image_url: beefLiver },
  { name: "Beef Mince 2kg Vacuum Packed", name_fi: "Naudan jauheliha 2kg vacuum", category: "Meat", price: 8.21, unit: "kg", image_url: beefMince },
  { name: "Boneless Beef Flank", name_fi: "Naudan luuton kylki", category: "Meat", price: 6.45, unit: "kg", image_url: beefFlank },
];

export async function insertProducts() {
  const { error } = await supabase
    .from("products")
    .insert(products.map(p => ({
      name: p.name,
      category: p.category,
      price: p.price,
      unit: p.unit,
      image_url: p.image_url,
      is_active: true,
      stock_quantity: 100
    })));

  if (error) {
    console.error("Error inserting products:", error);
    throw error;
  }
  
  console.log("Successfully inserted all products!");
}
