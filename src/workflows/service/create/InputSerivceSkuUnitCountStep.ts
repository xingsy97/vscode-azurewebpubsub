import { AzureWizardPromptStep, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../utils";
import { ICreateServiceContext } from "./ICreateServiceContext";

const paidUnitCountList = {
    "Free": [1],
    "Standard": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    "Premium": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
}

export class InputSerivceSkuUnitCountStep extends AzureWizardPromptStep<ICreateServiceContext> {
    public async prompt(context: ICreateServiceContext): Promise<void> {
        const placeHolder: string = localize("selectUnitCount", "Select a unit count");
        var picks: IAzureQuickPickItem<number>[] = [];
        const tier: string | undefined = context.Sku!.sku!.tier
        switch (tier) {
            case "Free":
            case "Standard":
            case "Premium":
                paidUnitCountList[tier].forEach(element => { picks.push({ label: element.toString(), data: element }); });
                break;
            default:
                throw new Error(`Invalid sku tier ${tier}`);
        }

        context.Sku!.sku!.capacity = (await context.ui.showQuickPick(picks, {
            placeHolder,
            suppressPersistence: true
        })).data;
    }

    public shouldPrompt(context: ICreateServiceContext): boolean {
        return true;
    }
}
