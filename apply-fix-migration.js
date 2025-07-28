import { exec } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const applyMigration = async () => {
    console.log('Applying new migration to fix user creation...');
    
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '005_fix_duplicate_email_in_user_creation.sql');
    const command = `psql "${process.env.SUPABASE_DB_URL}" -f "${migrationPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error applying migration: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Migration script error: ${stderr}`);
            return;
        }
        console.log('Migration applied successfully!');
        console.log(stdout);
    });
};

applyMigration(); 