#!/usr/bin/env node

/**
 * Sandbox Timeout Management Test Script
 *
 * This script tests the new timeout management features for E2B sandboxes.
 *
 * Run with: node scripts/test-sandbox-timeout.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testSandboxHealth() {
  console.log('🔍 Testing Sandbox Health Check...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/sandbox-health`);
    const data = await response.json();
    
    console.log('Health Check Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    return data.success;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testTimeoutExtension() {
  console.log('⏰ Testing Timeout Extension...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/sandbox-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extend_timeout' })
    });
    
    const data = await response.json();
    
    console.log('Timeout Extension Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    return data.success;
  } catch (error) {
    console.error('❌ Timeout extension failed:', error.message);
    return false;
  }
}

async function testHealthCheckAction() {
  console.log('🏥 Testing Health Check Action...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/sandbox-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'health_check' })
    });
    
    const data = await response.json();
    
    console.log('Health Check Action Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    return data.success;
  } catch (error) {
    console.error('❌ Health check action failed:', error.message);
    return false;
  }
}

async function testSandboxCreation() {
  console.log('🚀 Testing Sandbox Creation with Timeout Manager...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/create-ai-sandbox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    console.log('Sandbox Creation Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    return data.success;
  } catch (error) {
    console.error('❌ Sandbox creation failed:', error.message);
    return false;
  }
}

async function testFileListing() {
  console.log('📁 Testing File Listing with Timeout Manager...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/get-sandbox-files`);
    const data = await response.json();
    
    console.log('File Listing Response:');
    console.log(`Success: ${data.success}`);
    console.log(`File Count: ${data.fileCount || 0}`);
    console.log(`Has Structure: ${!!data.structure}`);
    console.log('');
    
    return data.success;
  } catch (error) {
    console.error('❌ File listing failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Sandbox Timeout Management Test Suite');
  console.log('========================================\n');
  
  const tests = [
    { name: 'Sandbox Creation', fn: testSandboxCreation },
    { name: 'Health Check', fn: testSandboxHealth },
    { name: 'Timeout Extension', fn: testTimeoutExtension },
    { name: 'Health Check Action', fn: testHealthCheckAction },
    { name: 'File Listing', fn: testFileListing }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Running: ${test.name}`);
    console.log(`${'='.repeat(50)}`);
    
    const startTime = Date.now();
    const success = await test.fn();
    const duration = Date.now() - startTime;
    
    results.push({
      name: test.name,
      success,
      duration: `${duration}ms`
    });
    
    console.log(`✅ ${test.name}: ${success ? 'PASSED' : 'FAILED'} (${duration}ms)`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name} (${result.duration})`);
  });
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Timeout management is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run the tests
runAllTests().catch(console.error);
