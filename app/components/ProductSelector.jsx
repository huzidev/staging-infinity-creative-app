import { useState, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";
import {
  Card,
  Text,
  BlockStack,
  TextField,
  Thumbnail,
  InlineStack,
  Listbox,
  Popover,
  ActionList,
} from "@shopify/polaris";

export function ProductSelector({ onProductSelect, selectedProduct, products }) {
  const fetcher = useFetcher();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
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

  useEffect(() => {
    // Use either fetched products or passed products
    const productsList = fetcher.data?.products || products || [];
    setFilteredProducts(productsList);
  }, [fetcher.data, products]);

  const handleProductSelect = (product) => {
    onProductSelect(product);
    setSearchTerm(product.title);
    setIsOpen(false);
  };

  const textFieldActivator = (
    <TextField
      label="Search products"
      value={searchTerm}
      onChange={(value) => {
        setSearchTerm(value);
        setIsOpen(true);
      }}
      placeholder="Type to search products..."
      autoComplete="off"
      onFocus={() => setIsOpen(true)}
    />
  );

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          Select Product
        </Text>
        
        <Popover
          active={isOpen && filteredProducts.length > 0}
          activator={textFieldActivator}
          onClose={() => setIsOpen(false)}
          fullWidth
        >
          <ActionList
            items={filteredProducts.slice(0, 10).map(product => ({
              content: (
                <InlineStack gap="200" align="start">
                  {product.images?.[0] && (
                    <Thumbnail
                      source={product.images[0].url}
                      alt={product.images[0].altText || product.title}
                      size="small"
                    />
                  )}
                  <BlockStack gap="050">
                    <Text variant="bodyMd">{product.title}</Text>
                    <Text variant="bodySm" tone="subdued">{product.vendor || 'No vendor'}</Text>
                  </BlockStack>
                </InlineStack>
              ),
              onAction: () => handleProductSelect(product)
            }))}
          />
        </Popover>

        {selectedProduct && (
          <Card background="bg-surface-secondary">
            <InlineStack gap="200" align="start">
              {selectedProduct.images?.[0] && (
                <Thumbnail
                  source={selectedProduct.images[0].url}
                  alt={selectedProduct.title}
                  size="large"
                />
              )}
              <BlockStack gap="100">
                <Text variant="headingSm">{selectedProduct.title}</Text>
                <Text tone="subdued">{selectedProduct.vendor || 'No vendor'}</Text>
                {selectedProduct.description && (
                  <Text tone="subdued" truncate>
                    {selectedProduct.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </Text>
                )}
              </BlockStack>
            </InlineStack>
          </Card>
        )}
      </BlockStack>
    </Card>
  );
}