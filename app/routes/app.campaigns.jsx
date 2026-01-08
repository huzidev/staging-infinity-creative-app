import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  InlineStack,
  BlockStack,
  Badge,
  ResourceList,
  ResourceItem,
  Thumbnail,
  DescriptionList,
  EmptyState,
} from "@shopify/polaris";
import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useNavigate } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // TODO: Fetch campaigns from database
  // const campaigns = await prisma.adCampaign.findMany({
  //   where: { shop: session.shop },
  //   include: {
  //     product: true,
  //     adAssets: true
  //   },
  //   orderBy: { createdAt: 'desc' }
  // });

  // Mock data for now
  const campaigns = [
    {
      id: "1",
      name: "Summer Collection Promo",
      status: "ACTIVE",
      createdAt: "2024-01-08",
      product: {
        title: "Premium Sunglasses",
        images: [{ url: "https://example.com/sunglasses.jpg" }]
      },
      adAssets: [
        {
          id: "asset1",
          assetType: "IMAGE_TO_IMAGE",
          status: "COMPLETED",
          generatedUrl: "https://example.com/generated-ad.jpg",
          createdAt: "2024-01-08"
        }
      ]
    }
  ];

  return { campaigns };
};

export default function Campaigns() {
  const { campaigns } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { tone: "info", children: "Draft" },
      ACTIVE: { tone: "success", children: "Active" },
      PAUSED: { tone: "warning", children: "Paused" },
      COMPLETED: { tone: "success", children: "Completed" },
      ARCHIVED: { tone: "subdued", children: "Archived" }
    };
    return statusConfig[status] || statusConfig.DRAFT;
  };

  const getAssetStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { tone: "info", children: "Pending" },
      PROCESSING: { tone: "warning", children: "Processing" },
      COMPLETED: { tone: "success", children: "Ready" },
      FAILED: { tone: "critical", children: "Failed" }
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

  return (
    <Page 
      title="Ad Campaigns" 
      subtitle="Manage your AI-generated advertising content"
      primaryAction={{
        content: "Create New Campaign",
        onAction: () => navigate("/app")
      }}
    >
      <Layout>
        <Layout.Section>
          {campaigns.length === 0 ? (
            <EmptyState
              heading="No campaigns yet"
              body="Create your first AI-generated ad campaign to get started."
              action={{
                content: "Create Campaign",
                onAction: () => navigate("/app")
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            />
          ) : (
            <Card>
              <ResourceList
                items={campaigns.map((campaign) => ({
                  id: campaign.id,
                  name: campaign.name,
                  status: campaign.status,
                  productTitle: campaign.product?.title,
                  assetCount: campaign.adAssets?.length || 0,
                  createdAt: campaign.createdAt,
                  thumbnail: campaign.product?.images?.[0]?.url
                }))}
                renderItem={(campaign) => (
                  <ResourceItem
                    id={campaign.id}
                    onClick={() => setSelectedCampaign(campaigns.find(c => c.id === campaign.id))}
                  >
                    <InlineStack gap="300" blockAlign="center">
                      {campaign.thumbnail && (
                        <Thumbnail 
                          source={campaign.thumbnail} 
                          alt={campaign.productTitle}
                          size="large"
                        />
                      )}
                      <BlockStack gap="200" inlineAlign="start">
                        <InlineStack gap="200" blockAlign="center">
                          <Text variant="headingSm" as="h3">{campaign.name}</Text>
                          <Badge {...getStatusBadge(campaign.status)} />
                        </InlineStack>
                        <Text tone="subdued">
                          {campaign.productTitle} • {campaign.assetCount} assets
                        </Text>
                        <Text tone="subdued">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                  </ResourceItem>
                )}
              />
            </Card>
          )}
        </Layout.Section>

        {selectedCampaign && (
          <Layout.Section secondary>
            <Card padding="400">
              <BlockStack gap="300">
                <InlineStack blockAlign="center" gap="200">
                  <Text variant="headingMd" as="h2">{selectedCampaign.name}</Text>
                  <Badge {...getStatusBadge(selectedCampaign.status)} />
                </InlineStack>
                
                <DescriptionList
                  items={[
                    {
                      term: "Product",
                      description: selectedCampaign.product?.title
                    },
                    {
                      term: "Assets",
                      description: `${selectedCampaign.adAssets?.length || 0} generated`
                    },
                    {
                      term: "Created",
                      description: new Date(selectedCampaign.createdAt).toLocaleDateString()
                    }
                  ]}
                />

                {selectedCampaign.adAssets?.length > 0 && (
                  <BlockStack gap="300">
                    <Text variant="headingSm" as="h3">Generated Assets</Text>
                    {selectedCampaign.adAssets.map((asset) => (
                      <Card key={asset.id} padding="300">
                        <InlineStack gap="300" blockAlign="center">
                          <BlockStack gap="200" inlineAlign="start">
                            <InlineStack gap="200" blockAlign="center">
                              <Text variant="bodyMd">
                                {asset.assetType.replace('_', ' to ')}
                              </Text>
                              <Badge {...getAssetStatusBadge(asset.status)} />
                            </InlineStack>
                            <Text tone="subdued">
                              Generated {new Date(asset.createdAt).toLocaleDateString()}
                            </Text>
                          </BlockStack>
                          {asset.generatedUrl && asset.status === "COMPLETED" && (
                            <Button
                              variant="primary"
                              size="slim"
                              onClick={() => window.open(asset.generatedUrl, '_blank')}
                            >
                              View
                            </Button>
                          )}
                        </InlineStack>
                      </Card>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}