import { parseArgs } from 'util';

// Required env variables:
/**
 * SUPABASE_BEARER_TOKEN
 * SUPABASE_ORG_ID
 */

// Arguments:
/**
 * --name (required)
 * --region (optional, default: us-east-1)
 */

// Parse command line arguments using util.parseArgs
const { values: argMap } = parseArgs({
  options: {
    'name': { type: 'string', required: true },
    'region': { type: 'string', default: 'us-east-1' },
  },
  allowPositionals: false,
});

const projectName = argMap['name'];
const region = argMap['region'];

if (!projectName) {
  throw new Error('Project name is required');
}

if (!process.env.SUPABASE_BEARER_TOKEN) {
  console.error(`SUPABASE_BEARER_TOKEN is required in env`);
  process.exit(1);
}

if (!process.env.SUPABASE_ORG_ID) {
  console.error(`SUPABASE_ORG_ID is required in env`);
  process.exit(1);
}

async function fetchSupabase(endpoint, options) {
  const res = await fetch(`https://api.supabase.io/v1${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error fetching ${endpoint}: ${res.status} ${res.statusText} - ${errorText}`);
  }

  return res.json();
}


async function createProject() {

  if (process.env.SUPABASE_PROJECT_REF && process.env.SUPABASE_DB_PASSWORD) {
    return { projectRef: process.env.SUPABASE_PROJECT_REF, password: process.env.SUPABASE_DB_PASSWORD };
  }

  const password = crypto.randomUUID();

  const data = await fetchSupabase('/projects', {
    method: 'POST',
    body: JSON.stringify({
      name: projectName,
      organization_id: process.env.SUPABASE_ORG_ID,
      region: region,
      db_pass: password
    })
  })

  const projectRef = data.id;
  return { projectRef, password };
}

async function getKeys(projectRef) {

  async function getExistingKeys() {
    const data = await fetchSupabase(`/projects/${projectRef}/api-keys`, { method: 'GET' })
    return data
  }

  async function getPublishableKey(existingKeys) {
    if (process.env.SUPABASE_PUBLISHABLE_KEY) {
      return process.env.SUPABASE_PUBLISHABLE_KEY;
    }

    const existingPublishableKey = existingKeys.find((key) => key.type === 'publishable' && key.name === 'default')?.api_key;
    if (existingPublishableKey) {
      return existingPublishableKey;
    }

    // create a new publishable key and return it

    const data = await fetchSupabase(`/projects/${projectRef}/api-keys`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'publishable',
        name: `default`
      }),
    });

    return data.api_key;
  }

  async function getSecretKey(projectRef, existingKeys) {
    if (process.env.SUPABASE_SECRET_KEY) {
      return process.env.SUPABASE_SECRET_KEY;
    }

    // if the key already exists, delete it first
    
    const existingSecretKey = existingKeys.find((key) => key.type === 'secret' && key.name === 'default');
    
    if (existingSecretKey) {
      await fetchSupabase(`/projects/${projectRef}/api-keys/${existingSecretKey.id}`, {
        method: 'DELETE',
      });
    }
    
    // Create a new secret key and return it

    const data = await fetchSupabase(`/projects/${projectRef}/api-keys?reveal=true`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'secret',
        name: `default`
      }),
    });

    console.log(data);
  
    return data.api_key

  }

  const existingKeys = await getExistingKeys();
  const publishableKey = await getPublishableKey(existingKeys);
  const secretKey = await getSecretKey(projectRef, existingKeys);
  return { publishableKey, secretKey };
}

async function main() {
  const { projectRef, password } = await createProject();
  const supabaseUrl = `https://${projectRef}.supabase.co`;

  const { publishableKey, secretKey } = await getKeys(projectRef);

  // Return the variables in JSON format so that they can be used in GitHub Actions
  console.log(JSON.stringify({
    SUPABASE_PROJECT_REF: projectRef,
    SUPABASE_DB_PASSWORD: password,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_PUBLISHABLE_KEY: publishableKey,
    SUPABASE_SECRET_KEY: secretKey,
  }, null, 2));
}

main().then(() => process.exit(0))


// Example command to run this script with dotenv

/*
pnpm exec dotenv -e .env -- node supabase.js --name test
*/
