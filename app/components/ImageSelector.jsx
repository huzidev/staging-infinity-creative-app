import { useState } from "react";

export function ImageSelector({ images, onImageSelect, selectedImage }) {
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  if (!images || images.length === 0) {
    return (
      <s-empty-state
        heading="No images available"
        body="This product doesn't have any images. Please select a different product with images."
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      />
    );
  }

  return (
    <div className="image-selector">
      <s-stack direction="inline" alignment="center" gap="base">
        <s-heading variant="headingMd">Select Product Image</s-heading>
        <s-button-group>
          <s-button
            pressed={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
            size="slim"
          >
            Grid
          </s-button>
          <s-button
            pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
            size="slim"
          >
            List
          </s-button>
        </s-button-group>
      </s-stack>

      <div className={`image-grid ${viewMode}`}>
        {viewMode === "grid" ? (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "1rem",
            marginTop: "1rem"
          }}>
            {images.map((image) => (
              <s-card key={image.id} sectioned>
                <s-stack direction="block" gap="base">
                  <div 
                    style={{ 
                      position: "relative",
                      cursor: "pointer",
                      border: selectedImage?.id === image.id ? "2px solid #008060" : "1px solid #e1e3e5",
                      borderRadius: "4px",
                      padding: "4px"
                    }}
                    onClick={() => onImageSelect(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || "Product image"}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                        borderRadius: "4px"
                      }}
                    />
                    {selectedImage?.id === image.id && (
                      <div style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "#008060",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <s-icon source="check" color="white" />
                      </div>
                    )}
                  </div>
                  <s-text variant="captionMd" alignment="center">
                    {image.width}×{image.height}
                  </s-text>
                </s-stack>
              </s-card>
            ))}
          </div>
        ) : (
          <s-resource-list
            items={images.map((image) => ({
              id: image.id,
              url: image.url,
              name: image.altText || `Image ${image.position || 1}`,
              dimensions: `${image.width}×${image.height}`
            }))}
            renderItem={(image) => (
              <s-resource-item
                id={image.id}
                onClick={() => onImageSelect(images.find(img => img.id === image.id))}
              >
                <s-stack direction="inline" gap="base" alignment="center">
                  <s-thumbnail source={image.url} alt={image.name} size="large" />
                  <s-stack direction="block" gap="tight">
                    <s-text variant="bodyMd">{image.name}</s-text>
                    <s-text variant="bodySm" color="subdued">{image.dimensions}</s-text>
                  </s-stack>
                  {selectedImage?.id === image.id && (
                    <s-icon source="check" color="success" />
                  )}
                </s-stack>
              </s-resource-item>
            )}
          />
        )}
      </div>
    </div>
  );
}