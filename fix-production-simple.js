import { Client } from 'pg';

async function fixProduction() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to production database...');
    await client.connect();
    
    // Check current predictions table structure
    console.log('📋 Checking current predictions table structure...');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'predictions'
      ORDER BY ordinal_position
    `);
    
    console.log('Current predictions table columns:');
    tableStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if timeframe column exists
    const timeframeExists = tableStructure.rows.some(col => col.column_name === 'timeframe');
    
    if (!timeframeExists) {
      console.log('⚠️ Missing timeframe column - adding it for monthly prediction system...');
      
      // Add timeframe column with proper constraints for monthly predictions
      await client.query(`
        ALTER TABLE predictions 
        ADD COLUMN timeframe text NOT NULL DEFAULT '3mo'
      `);
      
      // Add check constraint for valid monthly timeframes
      await client.query(`
        ALTER TABLE predictions 
        ADD CONSTRAINT predictions_timeframe_check 
        CHECK (timeframe IN ('3mo', '6mo', '9mo', '12mo', '7d'))
      `);
      
      console.log('✅ Added timeframe column with monthly prediction constraints');
      
      // Update any existing old 7-day predictions if they exist
      const updateResult = await client.query(`
        UPDATE predictions 
        SET timeframe = '3mo' 
        WHERE timeframe = '7d' OR timeframe IS NULL
      `);
      
      if (updateResult.rowCount > 0) {
        console.log(`📊 Updated ${updateResult.rowCount} existing predictions to 3mo timeframe`);
      }
      
    } else {
      console.log('✅ Timeframe column already exists');
      
      // Check if we have the proper constraints for monthly predictions
      const constraintCheck = await client.query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'predictions' AND constraint_name = 'predictions_timeframe_check'
      `);
      
      if (constraintCheck.rows.length === 0) {
        console.log('⚠️ Adding monthly timeframe constraints...');
        await client.query(`
          ALTER TABLE predictions 
          ADD CONSTRAINT predictions_timeframe_check 
          CHECK (timeframe IN ('3mo', '6mo', '9mo', '12mo', '7d'))
        `);
        console.log('✅ Added monthly prediction timeframe constraints');
      }
    }
    
    // Test query with monthly timeframes
    console.log('🧪 Testing monthly prediction queries...');
    const testResult = await client.query(`
      SELECT timeframe, COUNT(*) as count 
      FROM predictions 
      GROUP BY timeframe 
      ORDER BY timeframe
    `);
    
    console.log('📊 Current prediction distribution by timeframe:');
    if (testResult.rows.length === 0) {
      console.log('  - No predictions found (this is expected for new deployments)');
    } else {
      testResult.rows.forEach(row => {
        console.log(`  - ${row.timeframe}: ${row.count} predictions`);
      });
    }
    
    // Verify the monthly prediction scheduler requirements
    console.log('🔍 Verifying monthly prediction system compatibility...');
    
    // Check if we have the required AI models
    const aiModelsCheck = await client.query('SELECT name FROM ai_models WHERE is_active = 1');
    console.log('📊 Active AI models:');
    aiModelsCheck.rows.forEach(model => {
      console.log(`  - ${model.name}`);
    });
    
    // Check if we have commodities
    const commoditiesCheck = await client.query('SELECT COUNT(*) as count FROM commodities');
    console.log(`📊 Total commodities configured: ${commoditiesCheck.rows[0].count}`);
    
    console.log('');
    console.log('🎯 Production database is now ready for monthly predictions!');
    console.log('📅 Predictions will be generated on the 1st of each month for:');
    console.log('   - 3 months ahead');
    console.log('   - 6 months ahead'); 
    console.log('   - 9 months ahead');
    console.log('   - 12 months ahead');
    console.log('');
    console.log('🔄 Please restart your application to clear any cached schema.');
    
  } catch (error) {
    console.error('❌ Production fix failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixProduction();