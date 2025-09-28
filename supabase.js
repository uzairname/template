import { parseArgs } from 'util';
import { config } from 'dotenv';
import crypto from 'crypto';

/**

This script is used to create a new Supabase project for production deployment

It returns the following variables in JSON format:
- SUPABASE_PROJECT_ID
- SUPABASE_DB_PASSWORD
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SECRET_KEY
Any of the above variables that are already set in the environment will be reused instead of creating new resources

These variables can be used in GitHub Actions or other CI/CD pipelines

Required env variables to run the script:
- SUPABASE_BEARER_TOKEN
- SUPABASE_ORG_ID
- BASE_URL (base url of the deployed app, e.g. https://app.example.com)

Arguments:
--name (required): The name of the Supabase project to create
--region (optional, default: us-east-1): The region to create the Supabase project in

Example usage:
node supabase.js --name test
*/

// Parse command line arguments using util.parseArgs
const { values: argMap } = parseArgs({
  options: {
    'name': { type: 'string', required: true },
    'region': { type: 'string', default: 'us-east-1' },
  },
  allowPositionals: false,
});

// Try to read environment variables .env if it exists
config();

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
  if (process.env.SUPABASE_PROJECT_ID && process.env.SUPABASE_DB_PASSWORD) {
    return { projectId: process.env.SUPABASE_PROJECT_ID, password: process.env.SUPABASE_DB_PASSWORD };
  } else if (process.env.SUPABASE_PROJECT_ID && !process.env.SUPABASE_DB_PASSWORD) {
    // Change the DB password and return it
    throw new Error('SUPABASE_DB_PASSWORD is required in env when SUPABASE_PROJECT_ID is set');
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

  const projectId = data.id;

  await configureProject(projectId);

  return { projectId, password };
}


// See https://supabase.com/docs/guides/auth/passwords?queryGroups=flow&flow=pkce
const CONFIRMATION_EMAIL_TEMPLATE = `<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}"
    >Confirm your email</a
  >
</p>`

async function configureProject(projectId) {
  
  // Update the project settings to enable email signups
  await fetchSupabase(`/projects/${projectId}/config/auth`, {
    method: 'PATCH',
    body: JSON.stringify({
      mailer_templates_confirmation_content: CONFIRMATION_EMAIL_TEMPLATE
    }),
  })
}


async function getKeys(projectId) {

  async function getExistingKeys() {
    const data = await fetchSupabase(`/projects/${projectId}/api-keys`, { method: 'GET' })
    return data
  }

  async function getPublishableKey(existingKeys) {
    if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    }

    const existingPublishableKey = existingKeys.find((key) => key.type === 'publishable' && key.name === 'default')?.api_key;
    if (existingPublishableKey) {
      return existingPublishableKey;
    }

    // create a new publishable key and return it

    const data = await fetchSupabase(`/projects/${projectId}/api-keys`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'publishable',
        name: `default`
      }),
    });

    return data.api_key;
  }

  async function getSecretKey(projectId, existingKeys) {
    if (process.env.SUPABASE_SECRET_KEY) {
      return process.env.SUPABASE_SECRET_KEY;
    }

    // if the key already exists, delete it first
    
    const existingSecretKey = existingKeys.find((key) => key.type === 'secret' && key.name === 'default');
    
    if (existingSecretKey) {
      await fetchSupabase(`/projects/${projectId}/api-keys/${existingSecretKey.id}`, {
        method: 'DELETE',
      });
    }
    
    // Create a new secret key and return it

    const data = await fetchSupabase(`/projects/${projectId}/api-keys?reveal=true`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'secret',
        name: `default`
      }),
    });

    return data.api_key
  }

  const existingKeys = await getExistingKeys();
  const publishableKey = await getPublishableKey(existingKeys);
  const secretKey = await getSecretKey(projectId, existingKeys);
  return { publishableKey, secretKey };
}

async function main() {
  const { projectId: projectId, password } = await createProject();
  const supabaseUrl = `https://${projectId}.supabase.co`;

  const { publishableKey, secretKey } = await getKeys(projectId);

  // Return the variables in JSON format so that they can be used in GitHub Actions
  console.log(JSON.stringify({
    SUPABASE_PROJECT_ID: projectId,
    SUPABASE_DB_PASSWORD: password,
    SUPABASE_SECRET_KEY: secretKey,
    SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  }, null, 2));
}

main().then(() => process.exit(0))

