import { useState, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";

export function ProductSelector({ onProductSelect, selectedProduct }) {
  const fetcher = useFetcher();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const loadProducts = useCallback(() => {
    if (searchTerm.length >= 2 || searchTerm === "") {
      fetcher.load(`/app/api/products?search=${encodeURIComponent(searchTerm)}`);
    }
  }, [searchTerm, fetcher]);

  useEffect(() => {
    const timeoutId = setTimeout(loadProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [loadProducts]);

  const products = fetcher.data?.products || [];

  const handleProductSelect = (product) => {
    onProductSelect(product);
    setIsOpen(false);
  };

  return (
    <div className="product-selector">
      <s-autocomplete
        label="Search and select a product"
        value={selectedProduct?.title || ""}
        options={products.map(product => ({
          value: product.id,
          label: product.title,
          prefix: product.images?.[0] && (
            <s-thumbnail
              source={product.images[0].url}
              alt={product.images[0].altText || product.title}
              size="small"
            />
          )
        }))}
        onSelect={(value) => {
          const product = products.find(p => p.id === value);
          if (product) handleProductSelect(product);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Type to search products..."
        loading={fetcher.state === "loading"}
      />
      
      {selectedProduct && (
        <s-card sectioned>
          <s-stack direction="inline" gap="base" alignment="center">
            {selectedProduct.images?.[0] && (
              <s-thumbnail
                source={selectedProduct.images[0].url}
                alt={selectedProduct.images[0].altText || selectedProduct.title}
                size="medium"
              />
            )}
            <s-stack direction="block" gap="tight">
              <s-heading>{selectedProduct.title}</s-heading>
              <s-text variant="subdued">
                {selectedProduct.images?.length || 0} images available
              </s-text>
            </s-stack>
          </s-stack>
        </s-card>
      )}
    </div>
  );
}