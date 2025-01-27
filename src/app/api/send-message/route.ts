import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get("content-type") || "";

        if (!contentType.includes("multipart/form-data")) {
            return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
        }

        const boundary = contentType.split("boundary=")[1];
        if (!boundary) {
            return NextResponse.json({ error: "Boundary not found" }, { status: 400 });
        }

        const bodyText = await req.text();

        const parts = bodyText.split(`--${boundary}`).filter((part) => part && part !== "--");

        const fields: { [key: string]: string } = {};
        let fileBuffer: Buffer | null = null;
        let fileType = "";

        for (const part of parts) {
            const [headersPart, bodyPart] = part.split("\r\n\r\n");
            if (!headersPart || !bodyPart) continue;

            const headers = headersPart.split("\r\n").reduce((acc, line) => {
                const [key, value] = line.split(": ");
                if (key && value) acc[key.toLowerCase()] = value;
                return acc;
            }, {} as { [key: string]: string });

            const contentDisposition = headers["content-disposition"];
            if (contentDisposition) {
                const matchName = contentDisposition.match(/name="([^"]+)"/);
                const matchFilename = contentDisposition.match(/filename="([^"]+)"/);

                const fieldName = matchName ? matchName[1] : null;
                const fileName = matchFilename ? matchFilename[1] : null;

                if (fileName) {
                    fileBuffer = Buffer.from(bodyPart.split("\r\n")[0], "binary");
                    fileType = headers["content-type"] || "application/octet-stream";
                } else if (fieldName) {
                    fields[fieldName] = bodyPart.trim();
                }
            }
        }

        const { phone, message } = fields;

        if (!phone || !message) {
            return NextResponse.json({ error: "Phone and message are required" }, { status: 400 });
        }

        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!accessToken || !phoneNumberId) {
            return NextResponse.json({ error: "Server configuration is missing" }, { status: 500 });
        }

        let mediaId = null;

        if (fileBuffer) {
            const uploadResponse = await fetch(
                `https://graph.facebook.com/v17.0/${phoneNumberId}/media`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: (() => {
                        const formData = new FormData();
                        formData.append("file", new Blob([fileBuffer], { type: fileType }));
                        formData.append("messaging_product", "whatsapp");
                        return formData;
                    })(),
                }
            );


            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) {
                return NextResponse.json(
                    { error: uploadData.error?.message || "Failed to upload media" },
                    { status: 500 }
                );
            }

            mediaId = uploadData.id;
        }

        const messageBody = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "template",
            template: {
                name: "moksha_event",
                language: { code: "en_US" },
                components: [
                    ...(mediaId
                        ? [
                            {
                                type: "header",
                                parameters: [{ type: "image", image: { id: mediaId } }],
                            },
                        ]
                        : []),
                    {
                        type: "body",
                        parameters: [
                            { type: "text", text: message },
                            { type: "text", text: message },
                            { type: "text", text: message },
                            { type: "text", text: message },
                            { type: "text", text: message },
                        ],
                    },
                ],
            },
        };

        const response = await fetch(
            `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(messageBody),
            }
        );

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: data.error?.message || "Failed to send message" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
