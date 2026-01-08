import { authenticate } from "../../shopify.server";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const productTitle = formData.get("productTitle");
  const productDesc = formData.get("productDesc");
  const targetAudience = formData.get("targetAudience");
  const tone = formData.get("tone");
  const purpose = formData.get("purpose");

  try {
    // For now, generate a basic prompt template
    // In production, this would call Google's Gemini API
    const prompt = generateAdPrompt({
      productTitle,
      productDesc,
      targetAudience,
      tone,
      purpose
    });

    // TODO: Save to database for future reference
    // await prisma.adPrompt.create({
    //   data: {
    //     productTitle,
    //     productDesc,
    //     targetAudience,
    //     tone,
    //     purpose,
    //     generatedPrompt: prompt,
    //     shop: session.shop
    //   }
    // });

    return Response.json({ prompt });
  } catch (error) {
    console.error("Error generating prompt:", error);
    return Response.json(
      { error: "Failed to generate prompt" },
      { status: 500 }
    );
  }
};

function generateAdPrompt({ productTitle, productDesc, targetAudience, tone, purpose }) {
  const audienceMap = {
    young_adults: "young, trendy audience aged 18-25",
    professionals: "working professionals aged 25-40",
    parents: "busy parents with children",
    seniors: "mature customers aged 45+",
    general: "broad consumer audience"
  };

  const toneMap = {
    professional: "professional and trustworthy",
    casual: "casual and friendly",
    exciting: "exciting and energetic",
    luxury: "luxurious and premium",
    playful: "fun and playful"
  };

  const purposeMap = {
    awareness: "increase brand awareness and visibility",
    conversion: "drive sales and conversions",
    engagement: "boost social media engagement",
    launch: "announce and promote a new product"
  };

  const audience = audienceMap[targetAudience] || "target audience";
  const toneDesc = toneMap[tone] || "engaging";
  const purposeDesc = purposeMap[purpose] || "promote the product";

  return `Create a compelling advertising visual for "${productTitle}". 
Product details: ${productDesc || "Premium quality product with excellent features."}

Target audience: ${audience}
Tone: ${toneDesc}
Purpose: ${purposeDesc}

Visual requirements:
- Eye-catching and professional composition
- Clear product focus with lifestyle context
- High-quality, commercial-grade appearance
- Optimized for social media and digital advertising
- Include subtle branding elements
- Use modern, clean design principles
- Ensure the product stands out prominently
- Create emotional connection with the target audience
- Professional lighting and color grading
- Clean, uncluttered background that complements the product

Style: Modern commercial advertising photography with ${toneDesc} aesthetics, perfect for ${purposeDesc}.`;
}