#!/usr/bin/env node

/**
 * Test script to verify Supabase setup
 * Run with: node scripts/test-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('🧪 Testing Supabase connection...\n');

  try {
    // Test 1: Create a session
    console.log('1. Testing session creation...');
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        title: 'Test Session',
        metadata: { test: true }
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(`Session creation failed: ${sessionError.message}`);
    }

    console.log('✅ Session created:', session.id);

    // Test 2: Create a message
    console.log('\n2. Testing message creation...');
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        session_id: session.id,
        role: 'user',
        content: 'Test message',
        metadata: { test: true }
      })
      .select()
      .single();

    if (messageError) {
      throw new Error(`Message creation failed: ${messageError.message}`);
    }

    console.log('✅ Message created:', message.id);

    // Test 3: Create a job
    console.log('\n3. Testing job creation...');
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        session_id: session.id,
        type: 'generate',
        input: { prompt: 'Test prompt' }
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Job creation failed: ${jobError.message}`);
    }

    console.log('✅ Job created:', job.id);

    // Test 4: Query session with details
    console.log('\n4. Testing session query with details...');
    const { data: sessionWithDetails, error: queryError } = await supabase
      .from('sessions')
      .select(`
        *,
        messages (*),
        jobs (*)
      `)
      .eq('id', session.id)
      .single();

    if (queryError) {
      throw new Error(`Session query failed: ${queryError.message}`);
    }

    console.log('✅ Session query successful');
    console.log(`   - Messages: ${sessionWithDetails.messages.length}`);
    console.log(`   - Jobs: ${sessionWithDetails.jobs.length}`);

    // Test 5: Clean up test data
    console.log('\n5. Cleaning up test data...');
    await supabase.from('sessions').delete().eq('id', session.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Supabase is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test the API endpoints:');
    console.log('   - POST /api/v2/sessions');
    console.log('   - GET /api/v2/sessions');
    console.log('   - GET /api/v2/sessions/{id}?details=true');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your Supabase credentials in .env.local');
    console.error('2. Ensure the database migration has been run');
    console.error('3. Verify your Supabase project is active');
    process.exit(1);
  }
}

testSupabase();
