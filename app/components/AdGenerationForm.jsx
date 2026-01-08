import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

export function AdGenerationForm({ 
  selectedProduct, 
  selectedImage, 
  adConfig, 
  onGenerate,
  isGenerating = false 
}) {
  const [campaignName, setCampaignName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [useAutoPrompt, setUseAutoPrompt] = useState(true);
  const promptFetcher = useFetcher();

  // Auto-generate prompt when product/config changes
  useEffect(() => {
    if (selectedProduct && adConfig && useAutoPrompt) {
      promptFetcher.submit(
        {
          productTitle: selectedProduct.title,
          productDesc: selectedProduct.description || "",
          targetAudience: adConfig.targetAudience || "",
          tone: adConfig.tone || "",
          purpose: adConfig.purpose || ""
        },
        { method: "POST", action: "/app/api/generate-prompt" }
      );
    }
  }, [selectedProduct, adConfig, useAutoPrompt]);

  const canGenerate = selectedProduct && selectedImage && adConfig?.adType && campaignName.trim();

  const handleGenerate = () => {
    if (!canGenerate) return;

    const prompt = useAutoPrompt ? promptFetcher.data?.prompt : customPrompt;
    
    onGenerate({
      campaignName: campaignName.trim(),
      productId: selectedProduct.id,
      imageId: selectedImage.id,
      sourceImageUrl: selectedImage.url, // Pass the actual image URL
      adType: adConfig.adType,
      prompt,
      config: adConfig
    });
  };

  return (
    <s-card sectioned>
      <s-stack direction="block" gap="base">
        <s-heading variant="headingMd">Generate Your Ad</s-heading>
        
        <s-form-layout>
          {/* Campaign Name */}
          <s-text-field
            label="Campaign Name"
            value={campaignName}
            onChange={setCampaignName}
            placeholder="e.g., Summer Collection Promo"
            helpText="Give your ad campaign a memorable name"
          />

          {/* Prompt Configuration */}
          <s-stack direction="block" gap="base">
            <s-checkbox
              label="Use AI-generated prompt"
              checked={useAutoPrompt}
              onChange={setUseAutoPrompt}
              helpText="Let AI create the perfect prompt based on your product and settings"
            />

            {useAutoPrompt ? (
              <s-card sectioned>
                <s-stack direction="block" gap="base">
                  <s-text variant="headingSm">AI-Generated Prompt</s-text>
                  {promptFetcher.state === "loading" ? (
                    <s-skeleton-body-text lines={3} />
                  ) : promptFetcher.data?.prompt ? (
                    <s-scrollable style={{ maxHeight: "120px" }}>
                      <s-text>{promptFetcher.data.prompt}</s-text>
                    </s-scrollable>
                  ) : (
                    <s-text variant="subdued">
                      Configure your ad settings to generate a prompt
                    </s-text>
                  )}
                </s-stack>
              </s-card>
            ) : (
              <s-text-field
                label="Custom Prompt"
                value={customPrompt}
                onChange={setCustomPrompt}
                multiline={4}
                placeholder="Describe how you want your ad to look..."
                helpText="Write your own detailed prompt for the AI to follow"
              />
            )}
          </s-stack>

          {/* Generation Preview */}
          {selectedProduct && selectedImage && (
            <s-card sectioned>
              <s-stack direction="block" gap="base">
                <s-text variant="headingSm">Generation Preview</s-text>
                <s-stack direction="inline" gap="base" alignment="center">
                  <s-thumbnail
                    source={selectedImage.url}
                    alt={selectedImage.altText}
                    size="large"
                  />
                  <s-icon source="arrow-right" />
                  <div style={{ 
                    border: "2px dashed #c9cccf", 
                    borderRadius: "8px", 
                    padding: "2rem",
                    textAlign: "center",
                    minWidth: "120px"
                  }}>
                    <s-icon source={adConfig?.adType === "IMAGE_TO_VIDEO" ? "play-circle" : "image"} />
                    <s-text variant="bodySm" color="subdued">
                      {adConfig?.adType === "IMAGE_TO_VIDEO" ? "Video Ad" : "Enhanced Image"}
                    </s-text>
                  </div>
                </s-stack>
                
                <s-description-list>
                  <s-description-list-item 
                    term="Product" 
                    description={selectedProduct.title} 
                  />
                  <s-description-list-item 
                    term="Ad Type" 
                    description={adConfig?.adType?.replace('_', ' to ') || "Not selected"} 
                  />
                  <s-description-list-item 
                    term="Target" 
                    description={adConfig?.targetAudience || "Not specified"} 
                  />
                </s-description-list>
              </s-stack>
            </s-card>
          )}

          {/* Generate Button */}
          <s-button
            primary
            size="large"
            onClick={handleGenerate}
            disabled={!canGenerate}
            loading={isGenerating}
            fullWidth
          >
            {isGenerating 
              ? `Generating ${adConfig?.adType?.replace('_', ' to ')}...` 
              : "Generate Ad"
            }
          </s-button>

          {!canGenerate && (
            <s-inline-error
              message="Please complete all steps above to generate your ad"
            />
          )}
        </s-form-layout>
      </s-stack>
    </s-card>
  );
}