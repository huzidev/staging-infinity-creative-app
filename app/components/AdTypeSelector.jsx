import { useState } from "react";

export function AdTypeSelector({ onSelectionChange, selection }) {
  const [adType, setAdType] = useState(selection?.adType || "");
  const [targetAudience, setTargetAudience] = useState(selection?.targetAudience || "");
  const [tone, setTone] = useState(selection?.tone || "");
  const [purpose, setPurpose] = useState(selection?.purpose || "");

  const handleChange = (field, value) => {
    const newSelection = {
      ...selection,
      [field]: value
    };
    
    switch(field) {
      case 'adType':
        setAdType(value);
        break;
      case 'targetAudience':
        setTargetAudience(value);
        break;
      case 'tone':
        setTone(value);
        break;
      case 'purpose':
        setPurpose(value);
        break;
    }
    
    onSelectionChange(newSelection);
  };

  const adTypeOptions = [
    { label: "Image to Image", value: "IMAGE_TO_IMAGE", description: "Transform your product image into a new styled image" },
    { label: "Image to Video", value: "IMAGE_TO_VIDEO", description: "Create an engaging video ad from your product image" }
  ];

  const audienceOptions = [
    { label: "Young Adults (18-25)", value: "young_adults" },
    { label: "Professionals (25-40)", value: "professionals" },
    { label: "Parents (25-45)", value: "parents" },
    { label: "Seniors (45+)", value: "seniors" },
    { label: "General Audience", value: "general" }
  ];

  const toneOptions = [
    { label: "Professional", value: "professional" },
    { label: "Casual & Friendly", value: "casual" },
    { label: "Exciting & Energetic", value: "exciting" },
    { label: "Luxurious & Premium", value: "luxury" },
    { label: "Fun & Playful", value: "playful" }
  ];

  const purposeOptions = [
    { label: "Brand Awareness", value: "awareness" },
    { label: "Drive Sales", value: "conversion" },
    { label: "Social Engagement", value: "engagement" },
    { label: "Product Launch", value: "launch" }
  ];

  return (
    <s-card sectioned>
      <s-stack direction="block" gap="base">
        <s-heading variant="headingMd">Configure Your Ad</s-heading>
        
        {/* Ad Type Selection */}
        <s-form-layout>
          <s-form-layout-group>
            <s-stack direction="block" gap="base">
              <s-text variant="headingSm">Ad Type</s-text>
              <s-choice-list
                title="Choose ad format"
                choices={adTypeOptions}
                selected={[adType]}
                onChange={(value) => handleChange('adType', value[0])}
              />
            </s-stack>
          </s-form-layout-group>

          {/* Target Audience */}
          <s-form-layout-group>
            <s-select
              label="Target Audience"
              options={[
                { label: "Select target audience...", value: "" },
                ...audienceOptions
              ]}
              value={targetAudience}
              onChange={(value) => handleChange('targetAudience', value)}
            />
          </s-form-layout-group>

          {/* Tone */}
          <s-form-layout-group>
            <s-select
              label="Tone & Style"
              options={[
                { label: "Select tone...", value: "" },
                ...toneOptions
              ]}
              value={tone}
              onChange={(value) => handleChange('tone', value)}
            />
          </s-form-layout-group>

          {/* Purpose */}
          <s-form-layout-group>
            <s-select
              label="Ad Purpose"
              options={[
                { label: "Select purpose...", value: "" },
                ...purposeOptions
              ]}
              value={purpose}
              onChange={(value) => handleChange('purpose', value)}
            />
          </s-form-layout-group>
        </s-form-layout>

        {adType && (
          <s-callout-card
            title={adType === "IMAGE_TO_IMAGE" ? "Image to Image Generation" : "Image to Video Generation"}
            illustration="https://cdn.shopify.com/s/files/1/0446/6937/files/jaded-pixel-perfect-icons-Artboard_1_4.png"
            primaryAction={{
              content: "Learn more",
              url: "#"
            }}
          >
            <p>
              {adType === "IMAGE_TO_IMAGE" 
                ? "Transform your product image into stunning ad creatives using Google's advanced AI. Perfect for social media posts, banner ads, and marketing materials."
                : "Create engaging video content from your static product images. Ideal for reels, stories, and video advertisements that capture attention."
              }
            </p>
          </s-callout-card>
        )}
      </s-stack>
    </s-card>
  );
}