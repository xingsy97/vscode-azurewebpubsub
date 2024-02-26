import  { type WebPubSubSkuTier } from "@azure/arm-webpubsub";
import { KnownWebPubSubSkuTier } from "@azure/arm-webpubsub";
import  { type IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { AzureWizardPromptStep } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../utils";
import  { type ICreateServiceContext } from "./ICreateServiceContext";
import { getSkuTierFromSkuName } from "./InputServiceNameStep";

const skuTierPickItems: IAzureQuickPickItem<WebPubSubSkuTier>[] = [
    { label: "Premium", data: KnownWebPubSubSkuTier.Premium, description: "This is premium tier desc", detail: "This is premium tier detail" },
    { label: "Standard", data: KnownWebPubSubSkuTier.Standard, description: "This is standard tier desc", detail: "This is standard tier detail" },
    { label: "Free", data: KnownWebPubSubSkuTier.Free, description: "This is free tier desc", detail: "This is free tier detail" },
];

export class InputServiceSkuTierStep extends AzureWizardPromptStep<ICreateServiceContext> {
    public async prompt(context: ICreateServiceContext): Promise<void> {
        if (!(context?.Sku?.sku)) {
            throw new Error(`Invalid context ${context}, Sku or Sku.sku is undefined`);
        }
        const chosenItem = await context.ui.showQuickPick(skuTierPickItems, {
            placeHolder: localize("tier", `Select price tier for Web PubSub, Click "?" in the top right corner to learn more`),
            suppressPersistence: true,
            learnMoreLink: "https://azure.microsoft.com/en-us/pricing/details/web-pubsub/"
        });
        const tier = chosenItem.data;
        context.Sku.sku.tier = tier;
        context.Sku.sku.name = getSkuTierFromSkuName(tier);
    }

    public shouldPrompt(context: ICreateServiceContext): boolean {
        return true;
    }
}
