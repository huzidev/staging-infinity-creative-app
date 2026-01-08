import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  InlineStack,
  BlockStack,
  Icon,
  DescriptionList,
  List,
} from "@shopify/polaris";
import { ImageIcon, PlayIcon, MagicIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
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
    <Page
      title="AI Ad Creator"
      subtitle="Create stunning ads from your product images"
    >
      <Layout>
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Welcome to AI Ad Creator
              </Text>
              <Text as="p">
                Transform your product images into professional advertising
                content using Google’s advanced AI technology.
              </Text>

              <InlineStack gap="200">
                <Button primary onClick={() => showToast("Coming soon!")}
                >
                  Create New Campaign
                </Button>
                <Button onClick={navigateToCampaigns}>View Campaigns</Button>
                <Button
                  variant="tertiary"
                  onClick={() => showToast("Feature in development")}
                >
                  View Analytics
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>

          <Card padding="400">
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Features
              </Text>

              <InlineStack gap="300" wrap>
                <Card padding="300">
                  <BlockStack gap="200">
                    <Icon source={ImageIcon} />
                    <Text variant="headingSm" as="h3">
                      Image to Image
                    </Text>
                    <Text tone="subdued">
                      Transform product images into professional ad creatives
                    </Text>
                  </BlockStack>
                </Card>

                <Card padding="300">
                  <BlockStack gap="200">
                    <Icon source={PlayIcon} />
                    <Text variant="headingSm" as="h3">
                      Image to Video
                    </Text>
                    <Text tone="subdued">
                      Create engaging video ads from static images
                    </Text>
                  </BlockStack>
                </Card>

                <Card padding="300">
                  <BlockStack gap="200">
                    <Icon source={MagicIcon} />
                    <Text variant="headingSm" as="h3">
                      AI Prompts
                    </Text>
                    <Text tone="subdued">
                      Generate perfect prompts with Google Gemini
                    </Text>
                  </BlockStack>
                </Card>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card padding="400">
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Quick Stats
              </Text>
              <DescriptionList
                items={[
                  { term: "Total Campaigns", description: "0" },
                  { term: "Images Generated", description: "0" },
                  { term: "Videos Generated", description: "0" },
                ]}
              />
            </BlockStack>
          </Card>

          <Card padding="400">
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Navigation
              </Text>
              <BlockStack gap="200">
                <Button fullWidth onClick={() => (window.location.href = "/app")}>
                  Dashboard
                </Button>
                <Button fullWidth onClick={navigateToCampaigns}>
                  Campaigns
                </Button>
                <Button
                  fullWidth
                  onClick={() => (window.location.href = "/app/additional")}
                >
                  Additional Page
                </Button>
              </BlockStack>
            </BlockStack>
          </Card>

          <Card padding="400">
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Getting Started
              </Text>
              <List type="bullet">
                <List.Item>Set up your Google AI API key</List.Item>
                <List.Item>Select a product with good images</List.Item>
                <List.Item>Choose your target audience</List.Item>
                <List.Item>Generate your first ad!</List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};