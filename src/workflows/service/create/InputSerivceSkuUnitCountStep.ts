import { KnownWebPubSubSkuTier } from "@azure/arm-webpubsub";
import  { type IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { AzureWizardPromptStep } from "@microsoft/vscode-azext-utils";
import { tierToUnitCountList } from "../../../constants";
import { localize } from "../../../utils";
import  { type ICreateServiceContext } from "./ICreateServiceContext";

export class InputSerivceSkuUnitCountStep extends AzureWizardPromptStep<ICreateServiceContext> {
    public async prompt(context: ICreateServiceContext): Promise<void> {
        if (!(context.Sku?.sku)) {
            throw new Error("Invalid context or sku");
        }

        const picks: IAzureQuickPickItem<number>[] = [];
        const tier: string | undefined = context.Sku.sku.tier
        switch (tier) {
            case KnownWebPubSubSkuTier.Free:
            case KnownWebPubSubSkuTier.Standard:
            case KnownWebPubSubSkuTier.Premium:
                tierToUnitCountList[tier].forEach(element => { picks.push({ label: `Unit ${element}`, data: element }); });
                break;
            default:
                throw new Error(`Invalid Sku Tier ${tier}`);
        }

        context.Sku.sku.capacity = (await context.ui.showQuickPick(picks, {
            placeHolder: localize("selectUnitCount", `Select the unit count for your service. Click "?" in the top right corner to learn more`),
            suppressPersistence: true,
            learnMoreLink: "https://azure.microsoft.com/en-us/pricing/details/web-pubsub/"
        })).data;
    }

    public shouldPrompt(context: ICreateServiceContext): boolean {
        return true;
    }
}
