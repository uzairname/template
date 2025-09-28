
export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext): Promise<Response> {
    return new Response("a")
  }
}
