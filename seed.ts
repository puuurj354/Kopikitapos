import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { menuItems } from './src/app/data/menu.ts';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding categories...');
  const categories = Array.from(new Set(menuItems.map(m => m.category)));
  
  const categoryMap = new Map();
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: cat })
      .select()
      .single();
      
    if (error) {
      console.error("Error inserting category", cat, error);
    } else {
      categoryMap.set(cat, data.id);
    }
  }

  console.log('Seeding products...');
  for (const item of menuItems) {
    const categoryId = categoryMap.get(item.category);
    if (!categoryId) continue;

    const { error } = await supabase
      .from('products')
      .insert({
        name: item.name,
        price: item.price,
        image_url: item.image || item.emoji, // store emoji or image
        category_id: categoryId,
        is_available: true
      });

    if (error) {
      console.error("Error inserting product", item.name, error);
    }
  }

  console.log('Seed completed successfully!');
}

seed();
