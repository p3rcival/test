// filepath: c:\Users\localadmin\Desktop\workout_app4\alterTable.js
const { Client } = require('pg');

// Replace with your Supabase database connection details
const client = new Client({
    host: 'https://uplzwvwxfeuyioozfoof.supabase.co',
    port: 5432,
    user: 'your-database-user',
    password: 'your-database-password',
    database: 'your-database-name',
});

const alterTable = async () => {
    try {
        await client.connect();
        const query = `
            ALTER TABLE exercise_templates
            ADD CONSTRAINT unique_user_name_per_user UNIQUE (user_id, name);
        `;
        await client.query(query);
        console.log('Table altered successfully.');
    } catch (error) {
        console.error('Error altering table:', error);
    } finally {
        await client.end();
    }
};

alterTable();