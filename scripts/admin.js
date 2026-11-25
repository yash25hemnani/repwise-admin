import { auth } from '../src/firebase.js';

const [command, email] = process.argv.slice(2);

async function grant(email) {
  const user = await auth.getUserByEmail(email);
  // Keep any other claims the account already has
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
  console.log(`Granted admin to ${email}`);
}

async function revoke(email) {
  const user = await auth.getUserByEmail(email);
  const { admin, ...rest } = user.customClaims ?? {};
  // Claim only; tokens stay valid so their app session is untouched
  await auth.setCustomUserClaims(user.uid, rest);
  console.log(`Revoked admin from ${email}`);
}

async function list() {
  const admins = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const user of page.users) {
      if (user.customClaims?.admin === true) admins.push(user.email);
    }
    pageToken = page.pageToken;
  } while (pageToken);
  console.log(admins.length ? admins.join('\n') : 'No admins');
}

try {
  if (command === 'grant' && email) await grant(email);
  else if (command === 'revoke' && email) await revoke(email);
  else if (command === 'list') await list();
  else {
    console.log('Usage: npm run admin -- grant <email> | revoke <email> | list');
    process.exitCode = 1;
  }
} catch (err) {
  if (err.code === 'auth/user-not-found') {
    console.error(`No Firebase account for ${email}. Sign up in the app first.`);
  } else {
    console.error(err.message);
  }
  process.exitCode = 1;
}
