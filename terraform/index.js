
// This is the temporary script for the downtime between provisioning resources and deployment
// The "cloudflare_worker_version" resource requires a script to be uploaded.
// This script is replaced with the production one by opennextjs-cloudflare in .github/workflows/deploy.yml

export default {
  async fetch(request, env, ctx) {
    return new Response(`This site is under maintenance. Please check back in a few moments.`, { status: 503 });
  }
};
