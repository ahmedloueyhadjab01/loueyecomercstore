require('dotenv').config();
const { Pool } = require('pg');

async function test() {
  const targetUserId = 2; // Kalkoul
  const pool = new Pool({ connectionString: 'postgresql://postgres.lvainiusgzxbysnhqidr:kalkoul.dz28@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', ssl: { rejectUnauthorized: false } });
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Delete Orders and Stats
    await client.query('DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)', [targetUserId]);
    await client.query('DELETE FROM orders WHERE user_id = $1', [targetUserId]);
    
    // 2. Delete Ads and Finance
    await client.query('DELETE FROM campaign_ad_spend WHERE user_id = $1', [targetUserId]);
    await client.query('DELETE FROM ad_visits WHERE user_id = $1', [targetUserId]);
    
    const exists = await client.query('SELECT id FROM financial_archive WHERE user_id = $1', [targetUserId]);
    if (exists.rows.length === 0) {
      await client.query('INSERT INTO financial_archive (user_id, archived_sales, archived_cogs, archived_shipping_cost) VALUES ($1, 0, 0, 0) ON CONFLICT(user_id) DO NOTHING', [targetUserId]);
    }
    await client.query('UPDATE financial_archive SET archived_sales = 0, archived_cogs = 0, archived_shipping_cost = 0 WHERE user_id = $1', [targetUserId]);

    // 3. Delete Products and Inventory
    await client.query('DELETE FROM stock_restocks WHERE product_id IN (SELECT id FROM products WHERE user_id = $1)', [targetUserId]);
    await client.query('DELETE FROM variant_restocks WHERE variant_id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE p.user_id = $1)', [targetUserId]);
    await client.query('DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE user_id = $1)', [targetUserId]);
    await client.query('DELETE FROM products WHERE user_id = $1', [targetUserId]);

    // 4. Delete Categories safely
    await client.query('DELETE FROM categories WHERE user_id = $1 AND parent_id IS NOT NULL', [targetUserId]);
    await client.query('DELETE FROM categories WHERE user_id = $1', [targetUserId]);
    
    // 5. Delete settings
    await client.query('DELETE FROM settings WHERE user_id = $1', [targetUserId]);
    
    await client.query('ROLLBACK'); 
    console.log('Success! No errors in SQL transaction.');
  } catch(e) {
    await client.query('ROLLBACK');
    console.error('Error during transaction:', e.message);
  } finally {
    client.release();
    pool.end();
  }
}
test();
