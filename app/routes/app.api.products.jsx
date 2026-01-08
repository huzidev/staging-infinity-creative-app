import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";

  try {
    const response = await admin.graphql(
      `#graphql
        query getProducts($first: Int!, $query: String) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                handle
                description
                vendor
                productType
                tags
                images(first: 10) {
                  edges {
                    node {
                      id
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }`,
      {
        variables: {
          first: 20,
          query: search ? `title:*${search}*` : ""
        }
      }
    );

    const responseJson = await response.json();
    
    if (responseJson.errors) {
      throw new Error(responseJson.errors[0].message);
    }

    const products = responseJson.data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      vendor: node.vendor,
      productType: node.productType,
      tags: node.tags,
      images: node.images.edges.map(({ node: image }) => ({
        id: image.id,
        url: image.url,
        altText: image.altText,
        width: image.width,
        height: image.height
      }))
    }));

    return Response.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
};