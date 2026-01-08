import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  ButtonGroup,
  Thumbnail,
  EmptyState,
  Grid,
} from "@shopify/polaris";
import { useState } from "react";

export function ImageSelector({ product, selectedImage, onImageSelect }) {
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  
  // Handle both REST API and GraphQL data structures
  const images = product?.images?.nodes || product?.images || [];

  if (!images || images.length === 0) {
    return (
      <Card>
        <EmptyState
          heading="No images available"
          body="This product doesn't have any images. Please select a different product with images."
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        />
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack gap="200" align="space-between">
          <Text variant="headingMd" as="h2">
            Select Product Image
          </Text>
          <ButtonGroup>
            <Button
              pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              size="slim"
            >
              Grid
            </Button>
            <Button
              pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              size="slim"
            >
              List
            </Button>
          </ButtonGroup>
        </InlineStack>

        {viewMode === "grid" ? (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "1rem"
          }}>
            {images.map((image) => {
              const isSelected = selectedImage?.id === image.id || selectedImage?.url === image.url;
              return (
                <Card key={image.id} background={isSelected ? "bg-surface-selected" : "bg-surface"}>
                  <BlockStack gap="200">
                    <div 
                      style={{ 
                        cursor: "pointer", 
                        border: isSelected ? "2px solid var(--p-color-border-brand)" : "1px solid var(--p-color-border)",
                        borderRadius: "var(--p-border-radius-200)",
                        overflow: "hidden"
                      }}
                      onClick={() => onImageSelect(image)}
                    >
                      <img 
                        src={image.url} 
                        alt={image.altText || "Product image"}
                        style={{ 
                          width: "100%", 
                          height: "150px", 
                          objectFit: "cover", 
                          display: "block" 
                        }}
                      />
                    </div>
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">
                        {image.width}x{image.height}px
                      </Text>
                      {image.altText && (
                        <Text variant="bodySm" tone="subdued" truncate>
                          {image.altText}
                        </Text>
                      )}
                      <Button
                        fullWidth
                        variant={isSelected ? "primary" : "secondary"}
                        onClick={() => onImageSelect(image)}
                        size="slim"
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </BlockStack>
                  </BlockStack>
                </Card>
              );
            })}
          </div>
        ) : (
          <BlockStack gap="200">
            {images.map((image) => {
              const isSelected = selectedImage?.id === image.id || selectedImage?.url === image.url;
              return (
                <Card key={image.id} background={isSelected ? "bg-surface-selected" : "bg-surface"}>
                  <InlineStack gap="300" align="start">
                    <Thumbnail
                      source={image.url}
                      alt={image.altText || "Product image"}
                      size="large"
                    />
                    <BlockStack gap="200">
                      <Text variant="headingSm">
                        {image.altText || "Product Image"}
                      </Text>
                      <Text variant="bodySm" tone="subdued">
                        Dimensions: {image.width}x{image.height}px
                      </Text>
                      <Button
                        variant={isSelected ? "primary" : "secondary"}
                        onClick={() => onImageSelect(image)}
                        size="slim"
                      >
                        {isSelected ? "Selected" : "Select Image"}
                      </Button>
                    </BlockStack>
                  </InlineStack>
                </Card>
              );
            })}
          </BlockStack>
        )}
        
        {selectedImage && (
          <Card background="bg-surface-secondary">
            <BlockStack gap="200">
              <Text variant="headingSm">Selected Image</Text>
              <InlineStack gap="200" align="start">
                <Thumbnail
                  source={selectedImage.url}
                  alt={selectedImage.altText || "Selected image"}
                  size="large"
                />
                <BlockStack gap="100">
                  <Text>{selectedImage.altText || "Product Image"}</Text>
                  <Text tone="subdued">{selectedImage.width}x{selectedImage.height}px</Text>
                </BlockStack>
              </InlineStack>
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </Card>
  );
}