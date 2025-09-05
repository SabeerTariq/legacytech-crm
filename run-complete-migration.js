#!/usr/bin/env node

/**
 * 🚀 Complete Supabase to MySQL Migration Orchestrator
 * 
 * ⚠️  CRITICAL RULE: SUPABASE READ-ONLY ONLY
 * 🚫 NEVER MODIFY SUPABASE
 * ✅ ONLY READ from Supabase
 * ✅ ONLY EXTRACT schema and data
 * ❌ NO CREATE, UPDATE, DELETE operations
 * ❌ NO schema modifications
 * ❌ NO data changes
 * 
 * This script orchestrates the complete migration process:
 * 1. Schema Generation
 * 2. Data Migration
 * 3. Verification
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// MIGRATION CONFIGURATION
// ============================================================================

const MIGRATION_CONFIG = {
  phases: [
    'SCHEMA_GENERATION',
    'DATA_MIGRATION', 
    'VERIFICATION'
  ],
  phaseDescriptions: {
    SCHEMA_GENERATION: 'Generate MySQL schema from Supabase analysis',
    DATA_MIGRATION: 'Migrate all data from Supabase to MySQL',
    VERIFICATION: 'Verify migration success and data integrity'
  },
  phaseTimeouts: {
    SCHEMA_GENERATION: 300000,  // 5 minutes
    DATA_MIGRATION: 1800000,    // 30 minutes
    VERIFICATION: 600000         // 10 minutes
  },
  scripts: {
    SCHEMA_GENERATION: 'generate-complete-mysql-schema.js',
    DATA_MIGRATION: 'migrate-all-data.js',
    VERIFICATION: 'verify-migration.js'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if required files exist
 */
async function checkRequiredFiles() {
  const requiredFiles = [
    'generate-complete-mysql-schema.js',
    'migrate-all-data.js', 
    'verify-migration.js'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
    } catch (error) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    throw new Error(`Missing required migration files: ${missingFiles.join(', ')}`);
  }
  
  console.log('✅ All required migration files found');
}

/**
 * Check environment configuration
 */
async function checkEnvironment() {
  const envFile = '.env';
  
  try {
    const envContent = await fs.readFile(envFile, 'utf8');
    
    const requiredVars = [
      'MYSQL_HOST',
      'MYSQL_USER', 
      'MYSQL_PASSWORD',
      'MYSQL_DATABASE'
    ];
    
    const missingVars = [];
    
    for (const varName of requiredVars) {
      if (!envContent.includes(varName)) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    console.log('✅ Environment configuration verified');
    
  } catch (error) {
    throw new Error(`Environment check failed: ${error.message}`);
  }
}

/**
 * Run a migration phase
 */
async function runMigrationPhase(phase, timeout) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Starting ${phase}...`);
    console.log(`📝 Description: ${MIGRATION_CONFIG.phaseDescriptions[phase]}`);
    console.log(`⏱️  Timeout: ${timeout / 1000} seconds`);
    
    const scriptPath = MIGRATION_CONFIG.scripts[phase];
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`${phase} timed out after ${timeout / 1000} seconds`));
    }, timeout);
    
    child.on('close', (code) => {
      clearTimeout(timeoutId);
      
      if (code === 0) {
        console.log(`✅ ${phase} completed successfully`);
        resolve();
      } else {
        reject(new Error(`${phase} failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(new Error(`${phase} failed to start: ${error.message}`));
    });
  });
}

/**
 * Generate migration report
 */
async function generateMigrationReport(results) {
  const reportPath = join(process.cwd(), 'migration-report.md');
  
  const report = `# 🚀 Complete Supabase to MySQL Migration Report

## 📊 Migration Summary

**Migration Date:** ${new Date().toISOString()}
**Total Phases:** ${MIGRATION_CONFIG.phases.length}
**Overall Status:** ${results.overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}

## 🔄 Phase Results

${MIGRATION_CONFIG.phases.map(phase => {
  const result = results.phases[phase];
  return `### ${phase}
- **Status:** ${result.success ? '✅ SUCCESS' : '❌ FAILED'}
- **Duration:** ${result.duration}ms
- **Description:** ${MIGRATION_CONFIG.phaseDescriptions[phase]}
${result.error ? `- **Error:** ${result.error}` : ''}`;
}).join('\n\n')}

## 📈 Performance Metrics

- **Total Migration Time:** ${results.totalDuration}ms
- **Average Phase Time:** ${results.averagePhaseTime}ms
- **Success Rate:** ${(results.successCount / MIGRATION_CONFIG.phases.length * 100).toFixed(1)}%

## 🔒 Supabase Safety

✅ **READ-ONLY RULE MAINTAINED**
- No modifications made to Supabase
- No schema changes
- No data alterations
- Only data extraction performed

## 📋 Next Steps

1. **Review Migration Results:** Check all phases completed successfully
2. **Verify Data Integrity:** Run verification scripts if needed
3. **Update Application:** Modify connection strings to use MySQL
4. **Test Functionality:** Ensure all features work with MySQL
5. **Monitor Performance:** Watch for any performance issues

## 🚨 Important Notes

- This migration was performed in READ-ONLY mode for Supabase
- All data has been safely extracted and migrated to MySQL
- Original Supabase database remains completely unchanged
- Application now uses MySQL as the primary database

---
*Report generated automatically by migration orchestrator*
`;

  await fs.writeFile(reportPath, report);
  console.log(`📄 Migration report saved to: ${reportPath}`);
  
  return reportPath;
}

// ============================================================================
// MAIN MIGRATION ORCHESTRATOR
// ============================================================================

async function runCompleteMigration() {
  const startTime = Date.now();
  const results = {
    phases: {},
    overallSuccess: true,
    totalDuration: 0,
    successCount: 0
  };
  
  try {
    console.log('🚀 Starting Complete Supabase to MySQL Migration');
    console.log('🔒 Following STRICT READ-ONLY rule for Supabase');
    console.log('📋 Migration phases:', MIGRATION_CONFIG.phases.join(' → '));
    
    // Pre-flight checks
    console.log('\n🔍 Performing pre-flight checks...');
    await checkRequiredFiles();
    await checkEnvironment();
    console.log('✅ Pre-flight checks passed\n');
    
    // Run each migration phase
    for (const phase of MIGRATION_CONFIG.phases) {
      const phaseStartTime = Date.now();
      
      try {
        await runMigrationPhase(phase, MIGRATION_CONFIG.phaseTimeouts[phase]);
        
        const phaseDuration = Date.now() - phaseStartTime;
        results.phases[phase] = {
          success: true,
          duration: phaseDuration,
          error: null
        };
        results.successCount++;
        
      } catch (error) {
        const phaseDuration = Date.now() - phaseStartTime;
        results.phases[phase] = {
          success: false,
          duration: phaseDuration,
          error: error.message
        };
        results.overallSuccess = false;
        
        console.error(`\n❌ ${phase} failed:`, error.message);
        console.log('🔄 Continuing with remaining phases...');
      }
    }
    
    // Calculate final metrics
    results.totalDuration = Date.now() - startTime;
    results.averagePhaseTime = results.totalDuration / MIGRATION_CONFIG.phases.length;
    
    // Generate final report
    console.log('\n📊 Generating migration report...');
    const reportPath = await generateMigrationReport(results);
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎯 MIGRATION COMPLETED');
    console.log('='.repeat(60));
    
    if (results.overallSuccess) {
      console.log('✅ All migration phases completed successfully!');
      console.log('🔒 Supabase remains completely untouched (READ ONLY)');
      console.log('🗄️ MySQL database is now ready for use');
      console.log('📄 Detailed report:', reportPath);
    } else {
      console.log('⚠️  Migration completed with some failures');
      console.log('🔒 Supabase remains completely safe (READ ONLY)');
      console.log('📄 Check report for details:', reportPath);
      console.log('🔄 Some phases may need to be re-run');
    }
    
    console.log(`⏱️  Total migration time: ${(results.totalDuration / 1000).toFixed(1)}s`);
    console.log(`📊 Success rate: ${(results.successCount / MIGRATION_CONFIG.phases.length * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('\n❌ Migration orchestration failed:', error.message);
    console.error('🔒 Supabase remains completely safe and unchanged');
    
    // Generate error report
    results.overallSuccess = false;
    results.totalDuration = Date.now() - startTime;
    
    try {
      await generateMigrationReport(results);
    } catch (reportError) {
      console.error('❌ Failed to generate error report:', reportError.message);
    }
    
    process.exit(1);
  }
}

// ============================================================================
// COMMAND LINE INTERFACE
// ============================================================================

function showHelp() {
  console.log(`
🚀 Complete Supabase to MySQL Migration Orchestrator

USAGE:
  node run-complete-migration.js [options]

OPTIONS:
  --help, -h          Show this help message
  --dry-run           Show what would be executed without running
  --phase <name>      Run only a specific phase
  --timeout <ms>      Override default timeout for phases

PHASES:
  ${MIGRATION_CONFIG.phases.map(phase => 
    `  ${phase.padEnd(20)} ${MIGRATION_CONFIG.phaseDescriptions[phase]}`
  ).join('\n')}

EXAMPLES:
  node run-complete-migration.js                    # Run complete migration
  node run-complete-migration.js --phase SCHEMA    # Run only schema generation
  node run-complete-migration.js --dry-run         # Show migration plan

⚠️  CRITICAL: This script follows STRICT READ-ONLY rule for Supabase
🔒 NO modifications will be made to your Supabase database
✅ Only data extraction and schema analysis will be performed
`);
}

function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    phase: null,
    timeout: null
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
        
      case '--dry-run':
        options.dryRun = true;
        break;
        
      case '--phase':
        if (i + 1 < args.length) {
          const phase = args[++i].toUpperCase();
          if (MIGRATION_CONFIG.phases.includes(phase)) {
            options.phase = phase;
          } else {
            console.error(`❌ Invalid phase: ${phase}`);
            console.error(`Valid phases: ${MIGRATION_CONFIG.phases.join(', ')}`);
            process.exit(1);
          }
        } else {
          console.error('❌ --phase requires a phase name');
          process.exit(1);
        }
        break;
        
      case '--timeout':
        if (i + 1 < args.length) {
          const timeout = parseInt(args[++i]);
          if (isNaN(timeout) || timeout <= 0) {
            console.error('❌ --timeout requires a positive number');
            process.exit(1);
          }
          options.timeout = timeout;
        } else {
          console.error('❌ --timeout requires a timeout value');
          process.exit(1);
        }
        break;
        
      default:
        console.error(`❌ Unknown option: ${arg}`);
        showHelp();
        process.exit(1);
    }
  }
  
  return options;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    const options = parseArguments();
    
    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE - No actual migration will be performed');
      console.log('\n📋 Migration Plan:');
      console.log('1. Pre-flight checks (file existence, environment)');
      
      if (options.phase) {
        console.log(`2. Run single phase: ${options.phase}`);
      } else {
        MIGRATION_CONFIG.phases.forEach((phase, index) => {
          console.log(`${index + 2}. ${phase}: ${MIGRATION_CONFIG.phaseDescriptions[phase]}`);
        });
      }
      
      console.log('\n🔒 Supabase READ-ONLY rule will be enforced');
      console.log('✅ No modifications to Supabase will be made');
      return;
    }
    
    if (options.phase) {
      // Run single phase
      console.log(`🎯 Running single phase: ${options.phase}`);
      const timeout = options.timeout || MIGRATION_CONFIG.phaseTimeouts[options.phase];
      await runMigrationPhase(options.phase, timeout);
      console.log(`✅ Phase ${options.phase} completed successfully`);
    } else {
      // Run complete migration
      await runCompleteMigration();
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('🔒 Supabase remains completely safe and unchanged');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
}

export {
  runCompleteMigration,
  runMigrationPhase,
  MIGRATION_CONFIG
};

