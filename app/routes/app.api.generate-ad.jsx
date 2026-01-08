import { authenticate } from "../../shopify.server";
import { googleAI } from "../../services/googleAI";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  try {
    const adData = JSON.parse(formData.get("adData"));
    
    const {
      campaignName,
      productId,
      imageId,
      adType,
      prompt,
      config
    } = adData;

    // TODO: Save campaign to database
    // const campaign = await prisma.adCampaign.create({
    //   data: {
    //     name: campaignName,
    //     productId: productId,
    //     shop: session.shop,
    //     status: "ACTIVE"
    //   }
    // });

    // Extract image URL from the adData
    // In production, you would fetch the actual image URL from your database
    // using the imageId to look up the ProductImage record
    const imageUrl = adData.sourceImageUrl || `https://via.placeholder.com/800x600`; // Fallback placeholder

    let result;
    
    if (adType === "IMAGE_TO_IMAGE") {
      result = await googleAI.generateImageFromImage(imageUrl, prompt);
    } else if (adType === "IMAGE_TO_VIDEO") {
      result = await googleAI.generateVideoFromImage(imageUrl, prompt);
    }

    if (result.success) {
      // TODO: Save the asset to database
      // await prisma.adAsset.create({
      //   data: {
      //     campaignId: campaign.id,
      //     sourceImageId: imageId,
      //     assetType: adType,
      //     status: "COMPLETED",
      //     prompt: prompt,
      //     generatedUrl: result.imageUrl || result.videoUrl,
      //     thumbnailUrl: result.thumbnailUrl,
      //     fileSize: result.imageData ? Buffer.byteLength(result.imageData, 'base64') : null,
      //     mimeType: adType === "IMAGE_TO_VIDEO" ? "video/mp4" : "image/png"
      //   }
      // });

      return Response.json({
        success: true,
        message: "Ad generation completed successfully!",
        assetUrl: result.imageUrl || result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        textResponse: result.textResponse,
        filename: result.filename
      });
    } else {
      return Response.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in ad generation:", error);
    return Response.json({
      success: false,
      error: "Failed to start ad generation"
    }, { status: 500 });
  }
};