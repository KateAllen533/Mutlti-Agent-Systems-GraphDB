#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const API_BASE = 'http://localhost:3000';
const DASHBOARD_BASE = 'http://localhost:3001';

class SystemTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    this.results.push({ timestamp, type, message });
  }

  async testHealthCheck() {
    try {
      this.log('Testing health check endpoint...');
      const response = await axios.get(`${API_BASE}/health`);
      
      if (response.status === 200) {
        this.log('✅ Health check passed', 'success');
        return true;
      } else {
        this.log(`❌ Health check failed with status: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Health check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testFileUpload() {
    try {
      this.log('Testing file upload functionality...');
      
      // Create a test CSV file
      const testData = `id,name,email,department
1,Test User,test@example.com,Engineering
2,Another User,another@example.com,Marketing`;
      
      const testFilePath = path.join(projectRoot, 'temp', 'test.csv');
      await fs.writeFile(testFilePath, testData);
      
      // Upload the file
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('file', await fs.readFile(testFilePath), 'test.csv');
      
      const response = await axios.post(`${API_BASE}/api/upload`, form, {
        headers: form.getHeaders()
      });
      
      if (response.status === 200) {
        this.log('✅ File upload test passed', 'success');
        this.log(`   Job ID: ${response.data.jobId}`, 'info');
        return response.data.jobId;
      } else {
        this.log(`❌ File upload failed with status: ${response.status}`, 'error');
        return null;
      }
    } catch (error) {
      this.log(`❌ File upload test failed: ${error.message}`, 'error');
      return null;
    }
  }

  async testLocalFileProcessing() {
    try {
      this.log('Testing local file processing...');
      
      const sampleFilePath = path.join(projectRoot, 'data', 'sample.csv');
      
      const response = await axios.post(`${API_BASE}/api/process/local`, {
        filePath: sampleFilePath,
        fileType: 'csv'
      });
      
      if (response.status === 200) {
        this.log('✅ Local file processing test passed', 'success');
        this.log(`   Job ID: ${response.data.jobId}`, 'info');
        return response.data.jobId;
      } else {
        this.log(`❌ Local file processing failed with status: ${response.status}`, 'error');
        return null;
      }
    } catch (error) {
      this.log(`❌ Local file processing test failed: ${error.message}`, 'error');
      return null;
    }
  }

  async testJobStatus(jobId) {
    if (!jobId) return false;
    
    try {
      this.log(`Testing job status for job: ${jobId}...`);
      
      const response = await axios.get(`${API_BASE}/api/job/${jobId}/status`);
      
      if (response.status === 200) {
        this.log('✅ Job status check passed', 'success');
        this.log(`   Status: ${response.data.status}`, 'info');
        return true;
      } else {
        this.log(`❌ Job status check failed with status: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Job status check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testAgentStatus() {
    try {
      this.log('Testing agent status endpoint...');
      
      const response = await axios.get(`${API_BASE}/api/agents/status`);
      
      if (response.status === 200) {
        this.log('✅ Agent status check passed', 'success');
        const agents = Object.keys(response.data);
        this.log(`   Active agents: ${agents.join(', ')}`, 'info');
        return true;
      } else {
        this.log(`❌ Agent status check failed with status: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Agent status check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testDashboard() {
    try {
      this.log('Testing dashboard accessibility...');
      
      const response = await axios.get(`${DASHBOARD_BASE}/`);
      
      if (response.status === 200) {
        this.log('✅ Dashboard accessibility test passed', 'success');
        return true;
      } else {
        this.log(`❌ Dashboard accessibility test failed with status: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Dashboard accessibility test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testGraphAPI() {
    try {
      this.log('Testing graph API endpoint...');
      
      const response = await axios.get(`${DASHBOARD_BASE}/api/graph`);
      
      if (response.status === 200) {
        this.log('✅ Graph API test passed', 'success');
        this.log(`   Nodes: ${response.data.nodes?.length || 0}`, 'info');
        this.log(`   Edges: ${response.data.edges?.length || 0}`, 'info');
        return true;
      } else {
        this.log(`❌ Graph API test failed with status: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Graph API test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testInsightsAPI() {
    try {
      this.log('Testing insights API endpoint...');
      
      const response = await axios.get(`${DASHBOARD_BASE}/api/insights`);
      
      if (response.status === 200) {
        this.log('✅ Insights API test passed', 'success');
        return true;
      } else {
        this.log(`❌ Insights API test failed with status: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Insights API test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    this.log('🧪 Starting Multi-Agent Data System Tests', 'info');
    this.log('=' * 50, 'info');
    
    const tests = [
      { name: 'Health Check', fn: () => this.testHealthCheck() },
      { name: 'Agent Status', fn: () => this.testAgentStatus() },
      { name: 'Local File Processing', fn: () => this.testLocalFileProcessing() },
      { name: 'File Upload', fn: () => this.testFileUpload() },
      { name: 'Dashboard Accessibility', fn: () => this.testDashboard() },
      { name: 'Graph API', fn: () => this.testGraphAPI() },
      { name: 'Insights API', fn: () => this.testInsightsAPI() }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) {
          passedTests++;
        }
      } catch (error) {
        this.log(`❌ Test "${test.name}" threw an error: ${error.message}`, 'error');
      }
      this.log('', 'info'); // Empty line for readability
    }

    // Test job status if we have job IDs
    const jobIds = this.results
      .filter(r => r.message.includes('Job ID:'))
      .map(r => r.message.split('Job ID: ')[1]);
    
    for (const jobId of jobIds) {
      await this.testJobStatus(jobId);
    }

    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;

    this.log('=' * 50, 'info');
    this.log(`🏁 Test Results Summary:`, 'info');
    this.log(`   Total Tests: ${totalTests}`, 'info');
    this.log(`   Passed: ${passedTests}`, 'success');
    this.log(`   Failed: ${totalTests - passedTests}`, 'error');
    this.log(`   Duration: ${duration.toFixed(2)}s`, 'info');
    this.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'info');

    if (passedTests === totalTests) {
      this.log('🎉 All tests passed! System is working correctly.', 'success');
    } else {
      this.log('⚠️  Some tests failed. Please check the logs above.', 'error');
    }

    // Save test results
    await this.saveResults();
  }

  async saveResults() {
    try {
      const resultsPath = path.join(projectRoot, 'logs', 'test-results.json');
      const summary = {
        timestamp: new Date().toISOString(),
        duration: (Date.now() - this.startTime) / 1000,
        results: this.results
      };
      
      await fs.writeFile(resultsPath, JSON.stringify(summary, null, 2));
      this.log(`📝 Test results saved to: ${resultsPath}`, 'info');
    } catch (error) {
      this.log(`⚠️  Could not save test results: ${error.message}`, 'error');
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SystemTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { SystemTester };
