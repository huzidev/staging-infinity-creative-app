import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  InlineStack,
  BlockStack,
  TextField,
  Select,
  ChoiceList,
  Divider,
  Banner,
  ProgressBar,
  Thumbnail,
  ResourceList,
  ResourceItem,
  Badge,
  Frame,
  Loading,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { useLoaderData, useFetcher, Form, useActionData, useNavigation } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { getProducts } from "../models/products.server";
import { ProductSelector } from "../components/ProductSelector";
import { ImageSelector } from "../components/ImageSelector";
import { AdTypeSelector } from "../components/AdTypeSelector";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    // Fetch products using GraphQL
    const productsData = await getProducts(request, 50);
    
    return {
      shop: session.shop,
      products: productsData.products?.nodes || [],
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      shop: session.shop,
      products: [],
      error: "Failed to load products",
    };
  }
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  try {
    const campaignData = {
      name: formData.get("campaignName"),
      productId: formData.get("productId"),
      imageUrl: formData.get("imageUrl"),
      adType: formData.get("adType"),
      prompt: formData.get("prompt"),
      targetAudience: formData.get("targetAudience"),
      tone: formData.get("tone"),
      purpose: formData.get("purpose"),
    };

    // TODO: Save campaign to database
    // const campaign = await prisma.adCampaign.create({
    //   data: {
    //     ...campaignData,
    //     shop: session.shop,
    //     status: "DRAFT",
    //   },
    // });

    // Mock campaign creation for now
    const mockCampaign = {
      id: `campaign_${Date.now()}`,
      ...campaignData,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      campaign: mockCampaign,
      message: "Campaign created successfully!",
    };
  } catch (error) {
    console.error("Error creating campaign:", error);
    return {
      success: false,
      error: error.message || "Failed to create campaign",
    };
  }
};

export default function NewCampaign() {
  const { shop, products } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const generateFetcher = useFetcher();
  const promptFetcher = useFetcher();

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [adType, setAdType] = useState("IMAGE_TO_IMAGE");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [purpose, setPurpose] = useState("social_media");
  const [customPrompt, setCustomPrompt] = useState("");
  const [useAutoPrompt, setUseAutoPrompt] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [currentStep, setCurrentStep] = useState("campaign_details");

  const isSubmitting = navigation.state === "submitting";
  const isGeneratingContent = generateFetcher.state === "submitting";

  const toneOptions = [
    { label: "Professional", value: "professional" },
    { label: "Casual", value: "casual" },
    { label: "Playful", value: "playful" },
    { label: "Luxury", value: "luxury" },
    { label: "Modern", value: "modern" },
    { label: "Vintage", value: "vintage" },
  ];

  const purposeOptions = [
    { label: "Social Media", value: "social_media" },
    { label: "E-commerce", value: "ecommerce" },
    { label: "Print Advertising", value: "print" },
    { label: "Email Marketing", value: "email" },
    { label: "Web Banner", value: "web_banner" },
    { label: "Video Advertisement", value: "video_ad" },
  ];

  // Auto-generate prompt when product/config changes
  useEffect(() => {
    if (selectedProduct && useAutoPrompt && targetAudience) {
      promptFetcher.submit(
        {
          productTitle: selectedProduct.title,
          productDesc: selectedProduct.body_html || "",
          targetAudience,
          tone,
          purpose,
        },
        { method: "POST", action: "/app/api/generate-prompt" }
      );
    }
  }, [selectedProduct, targetAudience, tone, purpose, useAutoPrompt]);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedImage(null); // Reset image when product changes
  }, []);

  const handleImageSelect = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  const handleAdTypeSelect = useCallback((type) => {
    setAdType(type);
  }, []);

  const handleGenerateContent = useCallback(() => {
    if (!selectedProduct || !selectedImage) return;

    const prompt = useAutoPrompt ? promptFetcher.data?.prompt : customPrompt;
    
    if (!prompt) {
      shopify.toast.show("Please wait for prompt generation or enter a custom prompt");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    generateFetcher.submit(
      {
        productId: selectedProduct.id,
        imageUrl: selectedImage.src,
        adType,
        prompt,
        config: JSON.stringify({
          targetAudience,
          tone,
          purpose,
        }),
      },
      { method: "POST", action: "/app/api/generate-ad" }
    );

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    // Handle completion
    setTimeout(() => {
      setGenerationProgress(100);
      setIsGenerating(false);
      clearInterval(progressInterval);
    }, 8000);
  }, [selectedProduct, selectedImage, adType, targetAudience, tone, purpose, customPrompt, useAutoPrompt, promptFetcher.data]);

  const handleSaveCampaign = useCallback(() => {
    if (!campaignName.trim()) {
      shopify.toast.show("Please enter a campaign name");
      return;
    }
    
    setCurrentStep("review");
  }, [campaignName]);

  const canGenerateContent = selectedProduct && selectedImage && (useAutoPrompt ? promptFetcher.data?.prompt : customPrompt);
  const canSaveCampaign = campaignName.trim() && selectedProduct && selectedImage;

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show(actionData.message);
      navigate("/app/campaigns");
    } else if (actionData?.error) {
      shopify.toast.show(actionData.error, { isError: true });
    }
  }, [actionData]);

  const stepContent = () => {
    switch (currentStep) {
      case "campaign_details":
        return (
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Campaign Details
                </Text>
                <TextField
                  label="Campaign Name"
                  value={campaignName}
                  onChange={setCampaignName}
                  placeholder="e.g., Summer Collection 2024"
                  requiredIndicator
                />
                <TextField
                  label="Target Audience"
                  value={targetAudience}
                  onChange={setTargetAudience}
                  placeholder="e.g., Young professionals aged 25-35"
                  helpText="Describe your target audience for better AI prompt generation"
                />
                <Select
                  label="Tone"
                  options={toneOptions}
                  value={tone}
                  onChange={setTone}
                />
                <Select
                  label="Purpose"
                  options={purposeOptions}
                  value={purpose}
                  onChange={setPurpose}
                />
              </BlockStack>
            </Card>

            <ProductSelector
              products={products}
              selectedProduct={selectedProduct}
              onProductSelect={handleProductSelect}
            />

            {selectedProduct && (
              <ImageSelector
                product={selectedProduct}
                selectedImage={selectedImage}
                onImageSelect={handleImageSelect}
              />
            )}

            <AdTypeSelector
              selectedType={adType}
              onTypeSelect={handleAdTypeSelect}
            />

            {selectedProduct && selectedImage && (
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h2">
                    AI Prompt Configuration
                  </Text>
                  <ChoiceList
                    title="Prompt Generation"
                    choices={[
                      { label: "Auto-generate prompt with AI", value: "auto" },
                      { label: "Use custom prompt", value: "custom" },
                    ]}
                    selected={[useAutoPrompt ? "auto" : "custom"]}
                    onChange={(value) => setUseAutoPrompt(value[0] === "auto")}
                  />
                  
                  {useAutoPrompt ? (
                    <Card background="bg-surface-secondary">
                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3">
                          AI Generated Prompt
                        </Text>
                        {promptFetcher.state === "submitting" ? (
                          <Text tone="subdued">Generating prompt...</Text>
                        ) : promptFetcher.data?.prompt ? (
                          <Text>{promptFetcher.data.prompt}</Text>
                        ) : (
                          <Text tone="critical">
                            Please fill in target audience to generate prompt
                          </Text>
                        )}
                      </BlockStack>
                    </Card>
                  ) : (
                    <TextField
                      label="Custom Prompt"
                      value={customPrompt}
                      onChange={setCustomPrompt}
                      multiline={4}
                      placeholder="Enter your custom prompt for AI generation..."
                    />
                  )}
                </BlockStack>
              </Card>
            )}

            <InlineStack gap="200">
              <Button 
                primary 
                onClick={handleSaveCampaign}
                disabled={!canSaveCampaign}
              >
                Continue to Content Generation
              </Button>
              <Button onClick={() => navigate("/app/campaigns")}>
                Cancel
              </Button>
            </InlineStack>
          </BlockStack>
        );

      case "review":
        return (
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Review Campaign
                </Text>
                
                <div>
                  <Text variant="headingSm" as="h3">Campaign Name</Text>
                  <Text>{campaignName}</Text>
                </div>
                
                <div>
                  <Text variant="headingSm" as="h3">Product</Text>
                  <Text>{selectedProduct?.title}</Text>
                </div>
                
                <div>
                  <Text variant="headingSm" as="h3">Ad Type</Text>
                  <Badge tone={adType === "IMAGE_TO_IMAGE" ? "info" : "attention"}>
                    {adType === "IMAGE_TO_IMAGE" ? "Image to Image" : "Image to Video"}
                  </Badge>
                </div>
                
                {selectedImage && (
                  <div>
                    <Text variant="headingSm" as="h3">Selected Image</Text>
                    <Thumbnail source={selectedImage.src} alt={selectedProduct?.title} />
                  </div>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Content Generation
                </Text>
                
                {isGenerating && (
                  <BlockStack gap="200">
                    <Text>Generating {adType === "IMAGE_TO_IMAGE" ? "image" : "video"} content...</Text>
                    <ProgressBar progress={generationProgress} />
                  </BlockStack>
                )}
                
                {generateFetcher.data?.success && (
                  <Banner tone="success">
                    <p>Content generated successfully!</p>
                  </Banner>
                )}
                
                <InlineStack gap="200">
                  <Button 
                    primary 
                    onClick={handleGenerateContent}
                    disabled={!canGenerateContent || isGenerating}
                    loading={isGeneratingContent}
                  >
                    {adType === "IMAGE_TO_IMAGE" ? "Generate Images" : "Generate Video"}
                  </Button>
                  <Button onClick={() => setCurrentStep("campaign_details")}>
                    Back to Details
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            <Form method="post">
              <input type="hidden" name="campaignName" value={campaignName} />
              <input type="hidden" name="productId" value={selectedProduct?.id} />
              <input type="hidden" name="imageUrl" value={selectedImage?.src} />
              <input type="hidden" name="adType" value={adType} />
              <input type="hidden" name="prompt" value={useAutoPrompt ? promptFetcher.data?.prompt : customPrompt} />
              <input type="hidden" name="targetAudience" value={targetAudience} />
              <input type="hidden" name="tone" value={tone} />
              <input type="hidden" name="purpose" value={purpose} />
              
              <InlineStack gap="200">
                <Button primary submit disabled={isSubmitting || !canSaveCampaign}>
                  {isSubmitting ? "Saving..." : "Save Campaign"}
                </Button>
                <Button onClick={() => navigate("/app/campaigns")}>
                  Cancel
                </Button>
              </InlineStack>
            </Form>
          </BlockStack>
        );

      default:
        return null;
    }
  };

  return (
    <Frame>
      {isSubmitting && <Loading />}
      <Page
        title="Create New Campaign"
        subtitle="Generate AI-powered image and video content for your products"
        backAction={{
          content: "Campaigns",
          onAction: () => navigate("/app/campaigns"),
        }}
      >
        <Layout>
          <Layout.Section>
            {stepContent()}
          </Layout.Section>
          
          <Layout.Section secondary>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">
                  Steps
                </Text>
                <div>
                  <Badge tone={currentStep === "campaign_details" ? "info" : "success"}>
                    1. Campaign Setup
                  </Badge>
                </div>
                <div>
                  <Badge tone={currentStep === "review" ? "info" : currentStep === "campaign_details" ? "" : "success"}>
                    2. Content Generation
                  </Badge>
                </div>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">
                  Generation Types
                </Text>
                <div>
                  <Text variant="headingSm" as="h3">Image to Image</Text>
                  <Text tone="subdued" as="p">
                    Transform product photos into professional ad creatives with different styles and backgrounds
                  </Text>
                </div>
                <div>
                  <Text variant="headingSm" as="h3">Image to Video</Text>
                  <Text tone="subdued" as="p">
                    Create dynamic video advertisements from static product images
                  </Text>
                </div>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}