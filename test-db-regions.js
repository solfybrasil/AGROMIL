const { PrismaClient } = require('@prisma/client');

const regions = [
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ca-central-1',
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.ntouxmjmlrjehjsqkowr:Larnjasouza12*@${host}:6543/postgres?pgbouncer=true`;
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  try {
    await prisma.$connect();
    console.log(`✅ SUCCESS: Connected to region ${region}`);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log(`❌ FAILED for ${region}: ${err.message.replace(/\n/g, ' ')}`);
    return false;
  }
}

async function run() {
  for (const region of regions) {
    await testRegion(region);
  }
}

run();
