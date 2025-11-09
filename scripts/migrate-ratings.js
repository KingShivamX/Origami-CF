#!/usr/bin/env node

/**
 * Rating Migration Script
 * 
 * Usage:
 *   npm run migrate-ratings preview  # Show what would change
 *   npm run migrate-ratings run      # Run the actual migration  
 *   npm run migrate-ratings user <handle>  # Recalculate specific user
 */

const { migrateAllRatings, previewRatingMigration, recalculateUserRating } = require('../utils/ratingMigration.ts');

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  console.log('🔧 Origami-CF Rating Migration Tool\n');

  if (!command) {
    console.log('Usage:');
    console.log('  npm run migrate-ratings preview     # Show what would change');
    console.log('  npm run migrate-ratings run         # Run the actual migration');
    console.log('  npm run migrate-ratings user <handle>  # Recalculate specific user');
    console.log('');
    process.exit(1);
  }

  try {
    switch (command.toLowerCase()) {
      case 'preview': {
        console.log('🔍 Generating migration preview...\n');
        const preview = await previewRatingMigration();
        
        console.log(`📊 Migration Preview:`);
        console.log(`   Users to update: ${preview.usersToUpdate}`);
        console.log(`   Total contests: ${preview.totalTrainings}`);
        console.log(`   Sample changes: ${preview.estimatedChanges.length}`);
        console.log('');
        
        console.log('📈 Sample Rating Changes:');
        console.log('   Handle           Current → New      Delta');
        console.log('   ----------------------------------------');
        
        preview.estimatedChanges.slice(0, 10).forEach(change => {
          const delta = change.estimatedNewRating - change.currentRating;
          const deltaStr = delta >= 0 ? `+${delta}` : `${delta}`;
          const handlePadded = change.handle.padEnd(15);
          const currentPadded = change.currentRating.toString().padStart(4);
          const newPadded = change.estimatedNewRating.toString().padStart(4);
          const deltaPadded = deltaStr.padStart(6);
          
          console.log(`   ${handlePadded} ${currentPadded} → ${newPadded}   ${deltaPadded} (${change.trainingsCount} contests)`);
        });
        
        console.log('');
        console.log('💡 Run "npm run migrate-ratings run" to apply these changes');
        break;
      }

      case 'run': {
        console.log('⚠️  WARNING: This will recalculate ALL user ratings!');
        console.log('   This operation cannot be undone.');
        console.log('   Make sure you have a database backup.\n');
        
        // Simple confirmation prompt
        process.stdout.write('Continue? (yes/no): ');
        
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        readline.question('', async (answer) => {
          readline.close();
          
          if (answer.toLowerCase() !== 'yes') {
            console.log('❌ Migration cancelled');
            process.exit(0);
          }
          
          console.log('\n🚀 Starting rating migration...\n');
          
          const startTime = Date.now();
          const result = await migrateAllRatings();
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          
          console.log('\n🎉 Migration Results:');
          console.log(`   ✅ Users updated: ${result.usersUpdated}/${result.totalUsers}`);
          console.log(`   📊 Contests processed: ${result.trainingsProcessed}`);
          console.log(`   ⏱️  Duration: ${duration} seconds`);
          console.log(`   ❌ Errors: ${result.errors.length}`);
          
          if (result.errors.length > 0) {
            console.log('\n❌ Errors encountered:');
            result.errors.forEach(error => console.log(`   ${error}`));
          }
          
          console.log('\n📈 Top Rating Changes:');
          const sortedChanges = result.ratingChanges
            .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
            .slice(0, 10);
            
          sortedChanges.forEach(change => {
            const deltaStr = change.delta >= 0 ? `+${change.delta}` : `${change.delta}`;
            const handlePadded = change.handle.padEnd(15);
            console.log(`   ${handlePadded} ${change.oldRating} → ${change.newRating} (${deltaStr})`);
          });
          
          console.log('\n✅ Migration completed successfully!');
        });
        break;
      }

      case 'user': {
        const handle = args[1];
        if (!handle) {
          console.log('❌ Error: Please provide a Codeforces handle');
          console.log('   Usage: npm run migrate-ratings user <handle>');
          process.exit(1);
        }
        
        console.log(`🔄 Recalculating rating for user: ${handle}\n`);
        
        const result = await recalculateUserRating(handle);
        
        console.log('✅ User Rating Updated:');
        console.log(`   Handle: ${handle}`);
        console.log(`   Old Rating: ${result.oldRating}`);
        console.log(`   New Rating: ${result.newRating}`);
        console.log(`   Change: ${result.delta >= 0 ? '+' : ''}${result.delta}`);
        console.log(`   Contests: ${result.trainingsProcessed}`);
        break;
      }

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Available commands: preview, run, user');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}
