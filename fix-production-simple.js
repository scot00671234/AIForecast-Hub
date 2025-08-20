import { Client } from 'pg';

async function fixProduction() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    // Check if column exists
    const result = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'predictions' AND column_name = 'timeframe'
    `);
    
    if (result.rows.length === 0) {
      console.log('Adding timeframe column...');
      await client.query('ALTER TABLE predictions ADD COLUMN timeframe text NOT NULL DEFAULT \'7d\'');
      console.log('✅ Column added successfully');
    } else {
      console.log('✅ Column already exists');
    }
    
    // Test query
    await client.query('SELECT timeframe FROM predictions LIMIT 1');
    console.log('✅ Test query successful');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixProduction();