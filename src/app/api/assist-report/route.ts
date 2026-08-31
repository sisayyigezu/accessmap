import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI assistance is not configured." },
        { status: 500 },
      );
    }

    const body = await request.json();

    const rawReport =
      typeof body.rawReport === "string"
        ? body.rawReport.trim()
        : "";

    if (rawReport.length < 15) {
      return NextResponse.json(
        {
          error:
            "Please describe the accessibility barrier in a little more detail.",
        },
        { status: 400 },
      );
    }

    if (rawReport.length > 1200) {
      return NextResponse.json(
        {
          error: "Please keep the description under 1200 characters.",
        },
        { status: 400 },
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",

      input: [
        {
          role: "system",
          content:
            "You convert informal accessibility barrier descriptions into clear, neutral, structured reports. Do not invent facts.",
        },
        {
          role: "user",
          content: rawReport,
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "accessibility_report",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description:
                  "A concise descriptive title under 90 characters.",
              },
              category: {
                type: "string",
                enum: [
                  "ramp",
                  "elevator",
                  "sidewalk",
                  "restroom",
                  "entrance",
                  "construction",
                  "other",
                ],
              },
              severity: {
                type: "string",
                enum: ["low", "medium", "high"],
              },
              description: {
                type: "string",
                description:
                  "A clear neutral description under 500 characters.",
              },
            },
            required: [
              "title",
              "category",
              "severity",
              "description",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    if (!response.output_text) {
      throw new Error("OpenAI returned no text output.");
    }

    const result = JSON.parse(response.output_text);

    return NextResponse.json(result);
  } catch (error) {
  console.error("AI report assistance failed:", error);

  return NextResponse.json(
    {
      error: "AI assistance is temporarily unavailable.",
      fallback: true,
    },
    { status: 503 },
  );
}
}