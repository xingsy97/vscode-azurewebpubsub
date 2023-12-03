import { KnownWebPubSubSkuTier } from "@azure/arm-webpubsub";
import { AzureWizardPromptStep, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { tierToUnitCountList } from "../../../constants";
import { localize } from "../../../utils";
import { ICreateServiceContext } from "./ICreateServiceContext";

export class InputSerivceSkuUnitCountStep extends AzureWizardPromptStep<ICreateServiceContext> {
    public async prompt(context: ICreateServiceContext): Promise<void> {
        const placeHolder: string = localize("selectUnitCount", "Select the unit count for your service");
        var picks: IAzureQuickPickItem<number>[] = [];
        if (!context.Sku || !context.Sku.sku) {
            throw new Error("Failed to fetch sku of the service");
        }
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
            placeHolder,
            suppressPersistence: true
        })).data;
    }

    public shouldPrompt(context: ICreateServiceContext): boolean {
        return true;
    }
}
