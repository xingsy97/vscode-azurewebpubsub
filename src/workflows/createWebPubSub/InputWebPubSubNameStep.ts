// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { WebPubSubSkuTier } from "@azure/arm-webpubsub";
import { AzureNameStep, AzureWizardPromptStep, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { localize } from "../../utils";
import { IWebPubSubCreationWizardContext } from "./IWebPubSubCreationWizardContext";

export class InputWebPubSubNameStep extends AzureNameStep<IWebPubSubCreationWizardContext> {
    //refer: https://dev.azure.com/msazure/AzureDMSS/_git/AzureDMSS-PortalExtension?path=%2Fsrc%2FSpringCloudPortalExt%2FClient%2FCreateApplication%2FCreateApplicationBlade.ts&version=GBdev&line=463&lineEnd=463&lineStartColumn=25&lineEndColumn=55&lineStyle=plain&_a=contents
    private static readonly VALID_NAME_REGEX: RegExp = /^[a-z][a-z0-9-]{2,30}[a-z0-9]$/;

    constructor() {
        super();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.validateWebPubSubName = this.validateWebPubSubName.bind(this);
    }

    public async prompt(context: IWebPubSubCreationWizardContext): Promise<void> {
        const prompt: string = localize('webPubSubNamePrompt', 'Enter a globally unique name for the new Web PubSub resource.');
        context.webPubSubName = (await context.ui.showInputBox({ prompt, validateInput: this.validateWebPubSubName })).trim();
        return Promise.resolve(undefined);
    }

    public shouldPrompt(context: IWebPubSubCreationWizardContext): boolean {
        return true;
    }

    protected async isRelatedNameAvailable(_context: IWebPubSubCreationWizardContext, _name: string): Promise<boolean> {
        return false;
    }

    private async validateWebPubSubName(name: string): Promise<string | undefined> {
        name = name.trim();
        if (!name) {
            return localize('emptyName', 'The name is required.');
        }
        if (!InputWebPubSubNameStep.VALID_NAME_REGEX.test(name)) {
            return localize('invalidName', `
                    The name is invalid. It can contain only lowercase letters, numbers and hyphens.
                    The first character must be a letter.
                    The last character must be a letter or number.
                    The value must be between 4 and 32 characters long.
                `);
        } else {
            // const webPubSubs: EnhancedWebPubSub[] = await this.service.getWebPubSub();
            // if (!webPubSubs.every(wps => wps.name !== name)) {
            //     return localize('existWebPubSubName', "Web PubSub with this name already exists.");
            // }
        }
        return undefined;
    }
}

const skuTierToName = (tier: WebPubSubSkuTier) => {
    switch (tier) {
        case "Free": return "Free_F1";
        case "Standard": return "Standard_S1";
        case "Premium": return "Premium_P1";
        default: throw new Error("Invalid sku tier");
    }
}

export class InputWebPubSubSkuTierListStep extends AzureWizardPromptStep<IWebPubSubCreationWizardContext> {
    public async prompt(context: IWebPubSubCreationWizardContext): Promise<void> {
        const placeHolder: string = localize("sku", "Select a SKU");
        const picks: IAzureQuickPickItem<WebPubSubSkuTier>[] = [
            { label: "Free", data: "Free" },
            { label: "Standard", data: "Standard" },
            { label: "Premium", data: "Premium" },
        ];
        const tier = (await context.ui.showQuickPick(picks, {
            placeHolder,
            suppressPersistence: true
        })).data;
        context.Sku!.sku!.tier = tier;
        context.Sku!.sku!.name = skuTierToName(tier);
    }

    public shouldPrompt(context: IWebPubSubCreationWizardContext): boolean {
        return true;
    }
}

const paidUnitCountList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

export class InputWebPubSubSkuUnitCountListStep extends AzureWizardPromptStep<IWebPubSubCreationWizardContext> {
    public async prompt(context: IWebPubSubCreationWizardContext): Promise<void> {
        const placeHolder: string = localize("unit count", "Select a unit count");
        var picks: IAzureQuickPickItem<number>[] = [];
        switch (context.Sku!.sku!.tier) {
            case "Free":
                picks.push({ label: "1", data: 1 });
                break;
            case "Standard":
                paidUnitCountList.forEach(element => { picks.push({ label: element.toString(), data: element }); });
                break;
            case "Premium":
                paidUnitCountList.forEach(element => { picks.push({ label: element.toString(), data: element }); });
                break;
            default:
                throw new Error("Invalid sku tier");
        }

        context.Sku!.sku!.capacity = (await context.ui.showQuickPick(picks, {
            placeHolder,
            suppressPersistence: true
        })).data;
    }

    public shouldPrompt(context: IWebPubSubCreationWizardContext): boolean {
        return true;
    }
}

import { VerifyProvidersStep } from "@microsoft/vscode-azext-azureutils";
import { type ISubscriptionActionContext } from "@microsoft/vscode-azext-utils";

/**
 * Use to obtain a `VerifyProvidersStep` that registers all known container app providers to the user's subscription
 */
export function getVerifyProvidersStep<T extends ISubscriptionActionContext>(): VerifyProvidersStep<T> {
    return new VerifyProvidersStep<T>([
        "Microsoft.SignalRService/WebPubSub",
    ]);
}
