import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';

const dbPath = join(__dirname, '../data/enterprise.db');

// Initialize database connection
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Read and execute schema
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

  db.exec(schema, (err) => {
    if (err) {
      console.error('Error executing schema:', err.message);
    } else {
      console.log('Database schema created successfully');
      seedDatabase();
    }
  });
}

function seedDatabase() {
  // Check if data already exists
  db.get("SELECT COUNT(*) as count FROM users", (err, row: any) => {
    if (err) {
      console.error('Error checking users:', err.message);
      return;
    }

    if (row.count > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database with initial data...');

    // Hash passwords
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const managerPassword = bcrypt.hashSync('manager123', 10);
    const employeePassword = bcrypt.hashSync('employee123', 10);

    // Insert departments
    const departments = [
      { name: 'Executive', code: 'EXEC', description: 'Executive Management', budget: 1000000 },
      { name: 'Engineering', code: 'ENG', description: 'Software Development', budget: 500000 },
      { name: 'Sales', code: 'SALES', description: 'Sales and Marketing', budget: 300000 },
      { name: 'HR', code: 'HR', description: 'Human Resources', budget: 150000 },
      { name: 'Finance', code: 'FIN', description: 'Financial Department', budget: 200000 }
    ];

    const insertDept = db.prepare(
      'INSERT INTO departments (name, code, description, budget) VALUES (?, ?, ?, ?)'
    );

    departments.forEach(dept => {
      insertDept.run(dept.name, dept.code, dept.description, dept.budget);
    });
    insertDept.finalize();

    // Insert users
    db.run(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin', 'admin@ems.com', adminPassword, 'System', 'Administrator', 'admin', 1],
      (err) => {
        if (err) console.error('Error inserting admin:', err.message);
        else console.log('Admin user created');
      }
    );

    // Wait for departments to be inserted, then add more users
    setTimeout(() => {
      db.run(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['john.manager', 'john@ems.com', managerPassword, 'John', 'Manager', 'manager', 2]
      );

      db.run(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['sarah.sales', 'sarah@ems.com', managerPassword, 'Sarah', 'Sales', 'manager', 3]
      );

      db.run(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['mike.hr', 'mike@ems.com', managerPassword, 'Mike', 'HR', 'manager', 4]
      );

      db.run(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['dev1', 'dev1@ems.com', employeePassword, 'Jane', 'Developer', 'employee', 2]
      );

      db.run(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['dev2', 'dev2@ems.com', employeePassword, 'Bob', 'Developer', 'employee', 2]
      );

      console.log('Initial users created');
    }, 1000);
  });
}

// Database helper functions
export function runQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export default db;
