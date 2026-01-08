import {
  Card,
  Text,
  BlockStack,
  ChoiceList,
  Icon,
  InlineStack,
} from "@shopify/polaris";
import { ImageIcon, PlayIcon } from "@shopify/polaris-icons";

export function AdTypeSelector({ selectedType, onTypeSelect }) {
  const adTypeOptions = [
    {
      label: (
        <InlineStack gap="200" align="start">
          <Icon source={ImageIcon} />
          <BlockStack gap="100">
            <Text variant="headingSm">Image to Image</Text>
            <Text variant="bodySm" tone="subdued">
              Transform your product image into professional ad creatives with different styles and backgrounds
            </Text>
          </BlockStack>
        </InlineStack>
      ),
      value: "IMAGE_TO_IMAGE",
    },
    {
      label: (
        <InlineStack gap="200" align="start">
          <Icon source={PlayIcon} />
          <BlockStack gap="100">
            <Text variant="headingSm">Image to Video</Text>
            <Text variant="bodySm" tone="subdued">
              Create dynamic video advertisements from static product images
            </Text>
          </BlockStack>
        </InlineStack>
      ),
      value: "IMAGE_TO_VIDEO",
    },
  ];

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          Generation Type
        </Text>
        <ChoiceList
          title="Select the type of content you want to generate"
          choices={adTypeOptions}
          selected={[selectedType]}
          onChange={(value) => onTypeSelect(value[0])}
        />
      </BlockStack>
    </Card>
  );
}