#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

async function setupProject() {
  console.log('🚀 Setting up Multi-Agent Data System...\n');

  try {
    // Create necessary directories
    console.log('📁 Creating directories...');
    const directories = [
      'logs',
      'uploads',
      'data',
      'temp'
    ];

    for (const dir of directories) {
      const dirPath = path.join(projectRoot, dir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`   ✅ Created ${dir}/`);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
        console.log(`   ✅ ${dir}/ already exists`);
      }
    }

    // Create .env file if it doesn't exist
    console.log('\n🔧 Setting up environment configuration...');
    const envPath = path.join(projectRoot, '.env');
    const envExamplePath = path.join(projectRoot, 'env.example');
    
    try {
      await fs.access(envPath);
      console.log('   ✅ .env file already exists');
    } catch {
      try {
        const envExample = await fs.readFile(envExamplePath, 'utf8');
        await fs.writeFile(envPath, envExample);
        console.log('   ✅ Created .env file from template');
        console.log('   ⚠️  Please update .env with your actual configuration values');
      } catch (error) {
        console.log('   ⚠️  Could not create .env file. Please copy env.example to .env manually');
      }
    }

    // Create initial log files
    console.log('\n📝 Setting up logging...');
    const logFiles = [
      'logs/app.log',
      'logs/orchestrator.log',
      'logs/DataLoader.log',
      'logs/DataStructuring.log',
      'logs/GraphModeling.log'
    ];

    for (const logFile of logFiles) {
      try {
        await fs.writeFile(path.join(projectRoot, logFile), '');
        console.log(`   ✅ Created ${logFile}`);
      } catch (error) {
        console.log(`   ⚠️  Could not create ${logFile}: ${error.message}`);
      }
    }

    // Create sample data files
    console.log('\n📊 Creating sample data files...');
    const sampleData = {
      'data/sample.csv': `id,name,email,department,salary
1,John Doe,john.doe@company.com,Engineering,75000
2,Jane Smith,jane.smith@company.com,Marketing,65000
3,Bob Johnson,bob.johnson@company.com,Engineering,80000
4,Alice Brown,alice.brown@company.com,Sales,60000
5,Charlie Wilson,charlie.wilson@company.com,Engineering,85000`,

      'data/sample.json': JSON.stringify([
        { id: 1, name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering', salary: 75000 },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Marketing', salary: 65000 },
        { id: 3, name: 'Bob Johnson', email: 'bob.johnson@company.com', department: 'Engineering', salary: 80000 },
        { id: 4, name: 'Alice Brown', email: 'alice.brown@company.com', department: 'Sales', salary: 60000 },
        { id: 5, name: 'Charlie Wilson', email: 'charlie.wilson@company.com', department: 'Engineering', salary: 85000 }
      ], null, 2)
    };

    for (const [filePath, content] of Object.entries(sampleData)) {
      try {
        await fs.writeFile(path.join(projectRoot, filePath), content);
        console.log(`   ✅ Created ${filePath}`);
      } catch (error) {
        console.log(`   ⚠️  Could not create ${filePath}: ${error.message}`);
      }
    }

    // Create startup script
    console.log('\n🔧 Creating startup scripts...');
    const startupScript = `#!/bin/bash
echo "🚀 Starting Multi-Agent Data System..."

# Check if Neo4j is running
if ! nc -z localhost 7687; then
    echo "⚠️  Neo4j is not running on localhost:7687"
    echo "   Please start Neo4j before running the system"
    echo "   Docker: docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest"
    echo "   Local: neo4j start"
    exit 1
fi

# Start the application
echo "✅ Neo4j is running"
echo "🌐 Starting API server on port 3000..."
echo "📊 Starting dashboard on port 3001..."
echo ""
echo "Access the dashboard at: http://localhost:3001"
echo "API documentation available at: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop the system"

npm start
`;

    try {
      await fs.writeFile(path.join(projectRoot, 'start.sh'), startupScript);
      await fs.chmod(path.join(projectRoot, 'start.sh'), '755');
      console.log('   ✅ Created start.sh script');
    } catch (error) {
      console.log(`   ⚠️  Could not create start.sh: ${error.message}`);
    }

    // Create Windows batch file
    const windowsScript = `@echo off
echo 🚀 Starting Multi-Agent Data System...

REM Check if Neo4j is running (simplified check)
echo ⚠️  Please ensure Neo4j is running on localhost:7687
echo    Docker: docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest
echo    Local: neo4j start
echo.

echo 🌐 Starting API server on port 3000...
echo 📊 Starting dashboard on port 3001...
echo.
echo Access the dashboard at: http://localhost:3001
echo API documentation available at: http://localhost:3000/health
echo.
echo Press Ctrl+C to stop the system

npm start
`;

    try {
      await fs.writeFile(path.join(projectRoot, 'start.bat'), windowsScript);
      console.log('   ✅ Created start.bat script');
    } catch (error) {
      console.log(`   ⚠️  Could not create start.bat: ${error.message}`);
    }

    console.log('\n🎉 Setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Update .env file with your configuration');
    console.log('   2. Start Neo4j database');
    console.log('   3. Run: npm install (if not already done)');
    console.log('   4. Start the system: npm start or ./start.sh');
    console.log('   5. Access dashboard at: http://localhost:3001');
    console.log('\n📚 For more information, see README.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProject();
}

export { setupProject };
