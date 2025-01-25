import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { phone, message }: { phone: string; message: string } = await req.json();

        if (!phone || !message) {
            return NextResponse.json({ error: 'Phone and message are required' }, { status: 400 });
        }

        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!accessToken || !phoneNumberId) {
            return NextResponse.json(
                { error: 'Server configuration is missing' },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: phone,
                    type: 'text',
                    text: { body: message },
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error.message || 'Failed to send message' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
