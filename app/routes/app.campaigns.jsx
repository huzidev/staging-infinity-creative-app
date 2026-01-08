import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
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
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { status: "info", children: "Draft" },
      ACTIVE: { status: "success", children: "Active" },
      PAUSED: { status: "warning", children: "Paused" },
      COMPLETED: { status: "success", children: "Completed" },
      ARCHIVED: { status: "subdued", children: "Archived" }
    };
    return statusConfig[status] || statusConfig.DRAFT;
  };

  const getAssetStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { status: "info", children: "Pending" },
      PROCESSING: { status: "warning", children: "Processing" },
      COMPLETED: { status: "success", children: "Ready" },
      FAILED: { status: "critical", children: "Failed" }
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

  return (
    <s-page 
      heading="Ad Campaigns" 
      subtitle="Manage your AI-generated advertising content"
      primaryAction={{
        content: "Create New Campaign",
        url: "/app"
      }}
    >
      <s-layout>
        <s-layout-section>
          {campaigns.length === 0 ? (
            <s-empty-state
              heading="No campaigns yet"
              body="Create your first AI-generated ad campaign to get started."
              action={{
                content: "Create Campaign",
                url: "/app"
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            />
          ) : (
            <s-card>
              <s-resource-list
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
                  <s-resource-item 
                    id={campaign.id}
                    onClick={() => setSelectedCampaign(campaigns.find(c => c.id === campaign.id))}
                  >
                    <s-stack direction="inline" gap="base" alignment="center">
                      {campaign.thumbnail && (
                        <s-thumbnail 
                          source={campaign.thumbnail} 
                          alt={campaign.productTitle}
                          size="large"
                        />
                      )}
                      <s-stack direction="block" gap="tight" fill>
                        <s-stack direction="inline" gap="base" alignment="center">
                          <s-text variant="headingSm">{campaign.name}</s-text>
                          <s-badge {...getStatusBadge(campaign.status)} />
                        </s-stack>
                        <s-text variant="bodySm" color="subdued">
                          {campaign.productTitle} • {campaign.assetCount} assets
                        </s-text>
                        <s-text variant="bodySm" color="subdued">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </s-text>
                      </s-stack>
                    </s-stack>
                  </s-resource-item>
                )}
              />
            </s-card>
          )}
        </s-layout-section>

        {selectedCampaign && (
          <s-layout-section secondary>
            <s-card sectioned>
              <s-stack direction="block" gap="base">
                <s-stack direction="inline" alignment="center" gap="base">
                  <s-heading variant="headingMd">{selectedCampaign.name}</s-heading>
                  <s-badge {...getStatusBadge(selectedCampaign.status)} />
                </s-stack>
                
                <s-description-list>
                  <s-description-list-item
                    term="Product"
                    description={selectedCampaign.product?.title}
                  />
                  <s-description-list-item
                    term="Assets"
                    description={`${selectedCampaign.adAssets?.length || 0} generated`}
                  />
                  <s-description-list-item
                    term="Created"
                    description={new Date(selectedCampaign.createdAt).toLocaleDateString()}
                  />
                </s-description-list>

                {selectedCampaign.adAssets?.length > 0 && (
                  <s-stack direction="block" gap="base">
                    <s-text variant="headingSm">Generated Assets</s-text>
                    {selectedCampaign.adAssets.map((asset) => (
                      <s-card key={asset.id} sectioned>
                        <s-stack direction="inline" gap="base" alignment="center">
                          <s-stack direction="block" gap="tight" fill>
                            <s-stack direction="inline" gap="base" alignment="center">
                              <s-text variant="bodyMd">
                                {asset.assetType.replace('_', ' to ')}
                              </s-text>
                              <s-badge {...getAssetStatusBadge(asset.status)} />
                            </s-stack>
                            <s-text variant="bodySm" color="subdued">
                              Generated {new Date(asset.createdAt).toLocaleDateString()}
                            </s-text>
                          </s-stack>
                          {asset.generatedUrl && asset.status === "COMPLETED" && (
                            <s-button
                              variant="primary"
                              size="slim"
                              onClick={() => window.open(asset.generatedUrl, '_blank')}
                            >
                              View
                            </s-button>
                          )}
                        </s-stack>
                      </s-card>
                    ))}
                  </s-stack>
                )}
              </s-stack>
            </s-card>
          </s-layout-section>
        )}
      </s-layout>
    </s-page>
  );
}