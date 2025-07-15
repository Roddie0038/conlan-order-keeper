// scripts/create-users.ts

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const SUPABASE_URL = 'https://cdbixtaqjppvdkyfbhkz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // your key

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface StoreUser {
  name: string;
  email: string;
  title: string;
  password: string;
  store: string;
}

async function main() {
  const csvPath = path.join(__dirname, 'users.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf8');

  const records: StoreUser[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const user of records) {
    console.log(`Creating user: ${user.email}`);

    // 1. Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (authError) {
      console.error(`❌ Failed to create auth user for ${user.email}:`, authError.message);
      continue;
    }

    // 2. Insert into store_managers table with store
    const { error: insertError } = await supabase.from('store_managers').insert([
      {
        id: authUser.user.id,
        email: user.email,
        name: user.name,
        title: user.title,
        store: user.store,
      },
    ]);

    if (insertError) {
      console.error(`❌ Failed to insert store manager for ${user.email}:`, insertError.message);
    } else {
      console.log(`✅ Created user: ${user.email}`);
    }
  }

  console.log('✅ Bulk user import finished.');
}

main().catch((err) => {
  console.error('❌ Script failed:', err);
});
