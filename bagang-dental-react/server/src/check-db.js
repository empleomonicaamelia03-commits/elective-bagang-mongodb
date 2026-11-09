// Tests the MongoDB connection from server/.env and lists what is stored.
// Run: npm run db:check   (from the project root)
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set. Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

// Show the target without printing the password.
const masked = uri.replace(/\/\/([^:/@]+):([^@]*)@/, '//$1:*****@');
console.log(`Connecting to: ${masked}`);

const isAtlas = uri.startsWith('mongodb+srv://') || uri.includes('.mongodb.net');
const path = uri.replace(/^mongodb(\+srv)?:\/\/[^/]+\/?/, '').split('?')[0];
if (!path) {
  console.warn('Warning: the URI has no database name. Add /bagang_dental before the "?" (Atlas) or at the end (local).');
}
if (uri.includes('<') || uri.includes('>')) {
  console.warn('Warning: the URI still contains <user> / <password> placeholders. Replace them, without the < >.');
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const { host, name } = mongoose.connection;
  console.log(`\nConnected OK  ->  ${isAtlas ? 'Atlas' : 'local MongoDB'}  host=${host}  database=${name}\n`);

  const cols = await mongoose.connection.db.listCollections().toArray();
  if (!cols.length) {
    console.log('The database is empty. That is normal before the first `npm run server`; it fills with services, dentists and schedules on first start.');
  } else {
    for (const c of cols.sort((a, b) => a.name.localeCompare(b.name))) {
      const n = await mongoose.connection.db.collection(c.name).estimatedDocumentCount();
      console.log(`  ${c.name.padEnd(24)} ${n} document(s)`);
    }
  }
  console.log('\nIn Compass, connect with this same MONGODB_URI to see the same data.');
  await mongoose.disconnect();
} catch (err) {
  console.error(`\nConnection FAILED: ${err.message}\n`);
  const m = err.message || '';
  if (/bad auth|Authentication failed/i.test(m)) console.error('-> Wrong database-user name or password. Special characters in the password must be URL-encoded (@ = %40, # = %23, / = %2F). Or reset the password in Atlas > Database Access.');
  else if (/ENOTFOUND|querySrv/i.test(m)) console.error('-> The cluster address is wrong or DNS is blocked. Copy the string again from Atlas > Connect > Drivers.');
  else if (/ECONNREFUSED/i.test(m)) console.error('-> Nothing is listening on that address. For local MongoDB, start the service. For Atlas, check the host.');
  else if (/timed out|Server selection|ReplicaSetNoPrimary/i.test(m)) console.error('-> Atlas is blocking you: add your current IP in Atlas > Network Access (your IP can change between networks).');
  process.exit(1);
}
