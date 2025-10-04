#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Password Hash Generator\n');

rl.question('Enter your password: ', (password) => {
  if (!password) {
    console.log('❌ Password cannot be empty');
    rl.close();
    return;
  }

  console.log('\n⏳ Generating hash...\n');

  const hash = bcrypt.hashSync(password, 10);

  console.log('✅ Hash generated successfully!\n');
  console.log('📋 Copy this hash to your .env and .env.local files:\n');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
  console.log('🔒 Keep this hash secure and never commit it to git!\n');

  rl.close();
});
