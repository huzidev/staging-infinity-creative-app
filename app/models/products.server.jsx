import { authenticate } from "../shopify.server";

/**
 * Fetch products using GraphQL
 * @param {Request} request - The request object
 * @param {number} first - Number of products to fetch (default: 50)
 * @returns {Promise<Object>} Products data
 */
export async function getProducts(request, first = 50) {
  const { admin } = await authenticate.admin(request);
  
  const response = await admin.graphql(
    `#graphql
      query GetProducts($first: Int!) {
        products(first: $first) {
          nodes {
            id
            title
            description
            handle
            status
            vendor
            productType
            tags
            createdAt
            updatedAt
            images(first: 10) {
              nodes {
                id
                url
                altText
                width
                height
              }
            }
            variants(first: 10) {
              nodes {
                id
                title
                price
                compareAtPrice
                sku
                inventoryQuantity
                availableForSale
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
    {
      variables: {
        first: first,
      },
    }
  );

  const json = await response.json();
  
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error("Failed to fetch products");
  }

  return json.data;
}

/**
 * Fetch a single product by ID using GraphQL
 * @param {Request} request - The request object
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} Product data
 */
export async function getProduct(request, productId) {
  const { admin } = await authenticate.admin(request);
  
  const response = await admin.graphql(
    `#graphql
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          handle
          status
          vendor
          productType
          tags
          createdAt
          updatedAt
          images(first: 10) {
            nodes {
              id
              url
              altText
              width
              height
            }
          }
          variants(first: 10) {
            nodes {
              id
              title
              price
              compareAtPrice
              sku
              inventoryQuantity
              availableForSale
            }
          }
        }
      }`,
    {
      variables: {
        id: productId,
      },
    }
  );

  const json = await response.json();
  
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error("Failed to fetch product");
  }

  return json.data;
}