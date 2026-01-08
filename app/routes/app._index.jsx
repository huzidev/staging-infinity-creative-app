import { useState, useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { ProductSelector } from "../components/ProductSelector";
import { ImageSelector } from "../components/ImageSelector";
import { AdTypeSelector } from "../components/AdTypeSelector";
import { AdGenerationForm } from "../components/AdGenerationForm";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Get recent campaigns for the shop
  try {
    const campaigns = []; // TODO: Fetch from database
    const recentAssets = []; // TODO: Fetch recent generated assets
    
    return {
      shop: session.shop,
      campaigns,
      recentAssets
    };
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return {
      shop: session.shop,
      campaigns: [],
      recentAssets: []
    };
  }
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "generateAd") {
    try {
      const adData = JSON.parse(formData.get("adData"));
      
      // TODO: Implement ad generation logic
      // 1. Save campaign to database
      // 2. Call Google's nano banana API or Veo3 API
      // 3. Store the generation task
      
      return {
        success: true,
        message: "Ad generation started successfully",
        taskId: "temp-task-id" // Replace with actual task ID
      };
    } catch (error) {
      console.error("Error generating ad:", error);
      return {
        success: false,
        error: "Failed to start ad generation"
      };
    }
  }

  // Legacy product generation (keep for now)
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  // State for ad generation workflow
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [adConfig, setAdConfig] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const isGenerating = fetcher.state === "submitting" && fetcher.formData?.get("actionType") === "generateAd";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(fetcher.data.message);
      if (fetcher.data.taskId) {
        // Could redirect to a monitoring page or show progress
      }
    } else if (fetcher.data?.error) {
      shopify.toast.show(fetcher.data.error, { isError: true });
    }
  }, [fetcher.data, shopify]);

  // Reset image selection when product changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedImage(null);
      setCurrentStep(2);
    }
  }, [selectedProduct]);

  // Move to next step when image is selected
  useEffect(() => {
    if (selectedImage) {
      setCurrentStep(3);
    }
  }, [selectedImage]);

  // Move to final step when ad config is complete
  useEffect(() => {
    if (adConfig?.adType) {
      setCurrentStep(4);
    }
  }, [adConfig]);

  const handleGenerateAd = (adData) => {
    const formData = new FormData();
    formData.append("actionType", "generateAd");
    formData.append("adData", JSON.stringify(adData));
    
    fetcher.submit(formData, { method: "POST" });
  };

  const progressSteps = [
    { id: 1, label: "Select Product", completed: !!selectedProduct },
    { id: 2, label: "Choose Image", completed: !!selectedImage },
    { id: 3, label: "Configure Ad", completed: !!adConfig?.adType },
    { id: 4, label: "Generate", completed: false }
  ];

  return (
    <s-page heading="AI Ad Creator" subtitle="Create stunning ads from your product images">
      {/* Progress Indicator */}
      <s-card sectioned>
        <s-stack direction="inline" gap="large" alignment="center">
          {progressSteps.map((step, index) => (
            <s-stack direction="inline" gap="tight" alignment="center" key={step.id}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: step.completed ? "#008060" : currentStep === step.id ? "#006eff" : "#e1e3e5",
                color: step.completed || currentStep === step.id ? "white" : "#6d7175",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "14px"
              }}>
                {step.completed ? "✓" : step.id}
              </div>
              <s-text 
                variant="bodyMd" 
                color={step.completed || currentStep === step.id ? "success" : "subdued"}
              >
                {step.label}
              </s-text>
              {index < progressSteps.length - 1 && (
                <div style={{
                  width: "40px",
                  height: "2px",
                  background: step.completed ? "#008060" : "#e1e3e5",
                  marginLeft: "8px",
                  marginRight: "8px"
                }} />
              )}
            </s-stack>
          ))}
        </s-stack>
      </s-card>

      <s-layout>
        <s-layout-section>
          <s-stack direction="block" gap="base">
            {/* Step 1: Product Selection */}
            <ProductSelector
              onProductSelect={setSelectedProduct}
              selectedProduct={selectedProduct}
            />

            {/* Step 2: Image Selection */}
            {selectedProduct && (
              <ImageSelector
                images={selectedProduct.images}
                onImageSelect={setSelectedImage}
                selectedImage={selectedImage}
              />
            )}

            {/* Step 3: Ad Configuration */}
            {selectedImage && (
              <AdTypeSelector
                onSelectionChange={setAdConfig}
                selection={adConfig}
              />
            )}

            {/* Step 4: Generation */}
            {selectedProduct && selectedImage && adConfig?.adType && (
              <AdGenerationForm
                selectedProduct={selectedProduct}
                selectedImage={selectedImage}
                adConfig={adConfig}
                onGenerate={handleGenerateAd}
                isGenerating={isGenerating}
              />
            )}
          </s-stack>
        </s-layout-section>

        {/* Sidebar with recent campaigns and tips */}
        <s-layout-section secondary>
          <s-stack direction="block" gap="base">
            {/* Recent Campaigns */}
            <s-card sectioned>
              <s-stack direction="block" gap="base">
                <s-heading variant="headingMd">Recent Campaigns</s-heading>
                {data?.campaigns?.length > 0 ? (
                  <s-resource-list
                    items={data.campaigns.slice(0, 5)}
                    renderItem={(campaign) => (
                      <s-resource-item id={campaign.id}>
                        <s-stack direction="block" gap="tight">
                          <s-text variant="bodyMd">{campaign.name}</s-text>
                          <s-text variant="bodySm" color="subdued">
                            {campaign.status} • {new Date(campaign.createdAt).toLocaleDateString()}
                          </s-text>
                        </s-stack>
                      </s-resource-item>
                    )}
                  />
                ) : (
                  <s-empty-state
                    heading="No campaigns yet"
                    body="Your generated ad campaigns will appear here."
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  />
                )}
              </s-stack>
            </s-card>

            {/* Tips & Guidelines */}
            <s-card sectioned>
              <s-stack direction="block" gap="base">
                <s-heading variant="headingMd">Tips for Better Ads</s-heading>
                <s-unordered-list>
                  <s-list-item>Use high-quality product images (min 1080x1080px)</s-list-item>
                  <s-list-item>Clear, uncluttered backgrounds work best</s-list-item>
                  <s-list-item>Products should be well-lit and in focus</s-list-item>
                  <s-list-item>Consider your target audience when selecting tone</s-list-item>
                </s-unordered-list>
              </s-stack>
            </s-card>

            {/* AI Credits/Usage */}
            <s-card sectioned>
              <s-stack direction="block" gap="base">
                <s-heading variant="headingMd">AI Usage</s-heading>
                <s-description-list>
                  <s-description-list-item
                    term="Images Generated"
                    description="12 this month"
                  />
                  <s-description-list-item
                    term="Videos Generated"
                    description="5 this month"
                  />
                  <s-description-list-item
                    term="Prompts Generated"
                    description="23 this month"
                  />
                </s-description-list>
              </s-stack>
            </s-card>
          </s-stack>
        </s-layout-section>
      </s-layout>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
