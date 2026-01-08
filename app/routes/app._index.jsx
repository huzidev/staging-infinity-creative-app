import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  return {
    shop: session.shop
  };
};

export default function Index() {
  const shopify = useAppBridge();

  const navigateToCampaigns = () => {
    window.location.href = "/app/campaigns";
  };

  const showToast = (message) => {
    shopify.toast.show(message);
  };

  return (
    <s-page heading="AI Ad Creator" subtitle="Create stunning ads from your product images">
      <s-layout>
        <s-layout-section>
          <s-card sectioned>
            <s-stack direction="block" gap="base">
              <s-heading variant="headingMd">Welcome to AI Ad Creator</s-heading>
              <s-text variant="bodyMd">
                Transform your product images into professional advertising content using Google's advanced AI technology.
              </s-text>
              
              <s-stack direction="inline" gap="base">
                <s-button primary onClick={() => showToast("Coming soon!")}>
                  Create New Campaign
                </s-button>
                <s-button onClick={navigateToCampaigns}>
                  View Campaigns
                </s-button>
                <s-button variant="tertiary" onClick={() => showToast("Feature in development")}>
                  View Analytics
                </s-button>
              </s-stack>
            </s-stack>
          </s-card>

          <s-card sectioned>
            <s-stack direction="block" gap="base">
              <s-heading variant="headingMd">Features</s-heading>
              <s-stack direction="inline" gap="base">
                <s-card>
                  <s-card-section>
                    <s-stack direction="block" gap="tight">
                      <s-icon source="image" />
                      <s-text variant="headingSm">Image to Image</s-text>
                      <s-text variant="bodySm" color="subdued">
                        Transform product images into professional ad creatives
                      </s-text>
                    </s-stack>
                  </s-card-section>
                </s-card>

                <s-card>
                  <s-card-section>
                    <s-stack direction="block" gap="tight">
                      <s-icon source="play-circle" />
                      <s-text variant="headingSm">Image to Video</s-text>
                      <s-text variant="bodySm" color="subdued">
                        Create engaging video ads from static images
                      </s-text>
                    </s-stack>
                  </s-card-section>
                </s-card>

                <s-card>
                  <s-card-section>
                    <s-stack direction="block" gap="tight">
                      <s-icon source="magic" />
                      <s-text variant="headingSm">AI Prompts</s-text>
                      <s-text variant="bodySm" color="subdued">
                        Generate perfect prompts with Google Gemini
                      </s-text>
                    </s-stack>
                  </s-card-section>
                </s-card>
              </s-stack>
            </s-stack>
          </s-card>
        </s-layout-section>

        <s-layout-section secondary>
          <s-card sectioned>
            <s-stack direction="block" gap="base">
              <s-heading variant="headingMd">Quick Stats</s-heading>
              <s-description-list>
                <s-description-list-item
                  term="Total Campaigns"
                  description="0"
                />
                <s-description-list-item
                  term="Images Generated"
                  description="0"
                />
                <s-description-list-item
                  term="Videos Generated"
                  description="0"
                />
              </s-description-list>
            </s-stack>
          </s-card>

          <s-card sectioned>
            <s-stack direction="block" gap="base">
              <s-heading variant="headingMd">Navigation</s-heading>
              <s-stack direction="block" gap="tight">
                <s-button fullWidth onClick={() => window.location.href = "/app"}>
                  Dashboard
                </s-button>
                <s-button fullWidth onClick={navigateToCampaigns}>
                  Campaigns
                </s-button>
                <s-button fullWidth onClick={() => window.location.href = "/app/additional"}>
                  Additional Page
                </s-button>
              </s-stack>
            </s-stack>
          </s-card>

          <s-card sectioned>
            <s-stack direction="block" gap="base">
              <s-heading variant="headingMd">Getting Started</s-heading>
              <s-unordered-list>
                <s-list-item>Set up your Google AI API key</s-list-item>
                <s-list-item>Select a product with good images</s-list-item>
                <s-list-item>Choose your target audience</s-list-item>
                <s-list-item>Generate your first ad!</s-list-item>
              </s-unordered-list>
            </s-stack>
          </s-card>
        </s-layout-section>
      </s-layout>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};