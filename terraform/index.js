
// worker.js
export default {
  async fetch(request, env, ctx) {
    return new Response(`Hello`);
  },
};