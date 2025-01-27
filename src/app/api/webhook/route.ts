import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "your_verify_token";

export async function GET(req: NextRequest): Promise<NextResponse> {
	const queryParams = new URL(req.url).searchParams;
	const mode = queryParams.get("hub.mode");
	const token = queryParams.get("hub.verify_token");
	const challenge = queryParams.get("hub.challenge");

	if (mode === "subscribe" && token === VERIFY_TOKEN) {
		console.log("Webhook Verified!");
		return new NextResponse(challenge || "", { status: 200 });
	}

	console.error("Webhook Verification Failed!");
	return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const body = await req.json();

		console.log("Webhook Event Received:", JSON.stringify(body, null, 2));

		if (body.object === "whatsapp_business_account") {
			const entry = body.entry;

			for (const e of entry) {
				const changes = e.changes;

				for (const change of changes) {
					const messageData = change.value.messages?.[0];
					if (messageData) {
						const from = messageData.from;
						const text = messageData.text?.body;

						console.log(`Message received from ${from}: ${text}`);
					}
				}
			}
		}

		return new NextResponse("Event Received", { status: 200 });
	} catch (error) {
		console.error("Error handling webhook event:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
