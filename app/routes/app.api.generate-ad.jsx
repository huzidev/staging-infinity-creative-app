import { authenticate } from "../shopify.server";
import { googleAI } from "../services/googleAI";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  try {
    // Handle both old and new form data formats
    let adData;
    if (formData.get("adData")) {
      // Old format - JSON string
      adData = JSON.parse(formData.get("adData"));
    } else {
      // New format - direct form fields
      adData = {
        productId: formData.get("productId"),
        imageUrl: formData.get("imageUrl"),
        adType: formData.get("adType"),
        prompt: formData.get("prompt"),
        config: formData.get("config") ? JSON.parse(formData.get("config")) : {}
      };
    }
    
    const {
      productId,
      imageUrl,
      adType,
      prompt,
      config
    } = adData;

    // Use the provided imageUrl or fallback
    const sourceImageUrl = imageUrl || adData.sourceImageUrl || `https://via.placeholder.com/800x600`;

    let result;
    
    if (adType === "IMAGE_TO_IMAGE") {
      result = await googleAI.generateImageFromImage(sourceImageUrl, prompt);
    } else if (adType === "IMAGE_TO_VIDEO") {
      result = await googleAI.generateVideoFromImage(sourceImageUrl, prompt);
    } else {
      throw new Error(`Unsupported ad type: ${adType}`);
    }

    if (result.success) {
      // TODO: Save the asset to database
      // await prisma.adAsset.create({
      //   data: {
      //     campaignId: campaign.id,
      //     sourceImageUrl: sourceImageUrl,
      //     assetType: adType,
      //     status: "COMPLETED",
      //     prompt: prompt,
      //     generatedUrl: result.imageUrl || result.videoUrl,
      //     thumbnailUrl: result.thumbnailUrl,
      //     fileSize: result.imageData ? Buffer.byteLength(result.imageData, 'base64') : null,
      //     mimeType: adType === "IMAGE_TO_VIDEO" ? "video/mp4" : "image/png",
      //     config: config
      //   }
      // });

      return Response.json({
        success: true,
        message: `${adType === "IMAGE_TO_VIDEO" ? "Video" : "Image"} generation completed successfully!`,
        assetUrl: result.imageUrl || result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        textResponse: result.textResponse,
        filename: result.filename,
        adType: adType
      });
    } else {
      return Response.json({
        success: false,
        error: result.error || "Generation failed"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in ad generation:", error);
    return Response.json({
      success: false,
      error: error.message || "Failed to start ad generation"
    }, { status: 500 });
  }
};