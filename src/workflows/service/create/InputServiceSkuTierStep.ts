import { KnownWebPubSubSkuTier, WebPubSubSkuTier } from "@azure/arm-webpubsub";
import { AzureWizardPromptStep, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../utils";
import { ICreateServiceContext } from "./ICreateServiceContext";
import { getSkuTierFromSkuName } from "./InputServiceNameStep";

const skuTierPickItems: IAzureQuickPickItem<WebPubSubSkuTier>[] = [
    { label: "Premium", data: KnownWebPubSubSkuTier.Premium, description: "This is premium tier desc", detail: "This is premium tier detail" },
    { label: "Standard", data: KnownWebPubSubSkuTier.Standard, description: "This is standard tier desc", detail: "This is standard tier detail" },
    { label: "Free", data: KnownWebPubSubSkuTier.Free, description: "This is free tier desc", detail: "This is free tier detail" },
];

export class InputServiceSkuTierStep extends AzureWizardPromptStep<ICreateServiceContext> {
    public async prompt(context: ICreateServiceContext): Promise<void> {
        const placeHolder: string = localize("tier", "Select price tier for Web PubSub");
        const chosenItem = await context.ui.showQuickPick(skuTierPickItems, { placeHolder, suppressPersistence: true });
        const tier = chosenItem.data;
        context.Sku!.sku!.tier = tier;
        context.Sku!.sku!.name = getSkuTierFromSkuName(tier);
    }

    public shouldPrompt(context: ICreateServiceContext): boolean {
        return true;
    }
}
