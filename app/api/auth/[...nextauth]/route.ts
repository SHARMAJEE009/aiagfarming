import { handlers } from "@/auth";

function wrap(handler: any) {
	return async (req: Request) => {
		try {
			return await handler(req as any);
		} catch (err) {
			// Log server-side error and return JSON so the client doesn't try to parse HTML
			// (which causes the `Unexpected token '<'` JSON parse error).
			// This helps reveal the real error in server logs.
			// eslint-disable-next-line no-console
			console.error("NextAuth handler error:", err);
			return new Response(JSON.stringify({ error: "NextAuth internal error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	};
}

export const GET = handlers.GET ? wrap(handlers.GET) : undefined;
export const POST = handlers.POST ? wrap(handlers.POST) : undefined;
