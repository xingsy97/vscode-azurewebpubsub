/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { KnownServiceKind, ServiceKind, WebPubSubSkuTier } from "@azure/arm-webpubsub";
import { AzureNameStep, AzureWizardPromptStep, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import { localize } from "../../utils";
import { ICreateWebPubSubContext } from "./ICreateWebPubSubContext";

export class InputWebPubSubNameStep extends AzureNameStep<ICreateWebPubSubContext> {
    //refer: https://dev.azure.com/msazure/AzureDMSS/_git/AzureDMSS-PortalExtension?path=%2Fsrc%2FSpringCloudPortalExt%2FClient%2FCreateApplication%2FCreateApplicationBlade.ts&version=GBdev&line=463&lineEnd=463&lineStartColumn=25&lineEndColumn=55&lineStyle=plain&_a=contents
    private static readonly VALID_NAME_REGEX: RegExp = /^[a-z][a-z0-9-]{2,30}[a-z0-9]$/;

    constructor() {
        super();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.validateWebPubSubName = this.validateWebPubSubName.bind(this);
    }

    public async prompt(context: ICreateWebPubSubContext): Promise<void> {
        const prompt: string = localize('webPubSubNamePrompt', 'Enter a globally unique name for the new Web PubSub resource.');
        context.webPubSubName = (await context.ui.showInputBox({ prompt, validateInput: this.validateWebPubSubName })).trim();
        return Promise.resolve(undefined);
    }

    public shouldPrompt(context: ICreateWebPubSubContext): boolean {
        return true;
    }

    protected async isRelatedNameAvailable(_context: ICreateWebPubSubContext, _name: string): Promise<boolean> {
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

export class InputWebPubSubSkuTierListStep extends AzureWizardPromptStep<ICreateWebPubSubContext> {
    public async prompt(context: ICreateWebPubSubContext): Promise<void> {
        const placeHolder: string = localize("tier", "Select price tier for Web PubSub");
        const picks: IAzureQuickPickItem<WebPubSubSkuTier>[] = [
            { label: "Free", data: "Free", description: "This is free tier desc", detail: "This is free tier detail" },
            { label: "Standard", data: "Standard", description: "This is standard tier desc", detail: "This is standard tier detail" },
            { label: "Premium", data: "Premium", description: "This is premium tier desc", detail: "This is premium tier detail" },
        ];
        const tier = (await context.ui.showQuickPick(picks, {
            placeHolder,
            suppressPersistence: true
        })).data;
        context.Sku!.sku!.tier = tier;
        context.Sku!.sku!.name = skuTierToName(tier);
    }

    public shouldPrompt(context: ICreateWebPubSubContext): boolean {
        return true;
    }
}

const paidUnitCountList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

export class InputWebPubSubSkuUnitCountListStep extends AzureWizardPromptStep<ICreateWebPubSubContext> {
    public async prompt(context: ICreateWebPubSubContext): Promise<void> {
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

    public shouldPrompt(context: ICreateWebPubSubContext): boolean {
        return true;
    }
}

export class InputWebPubSubKindListStep extends AzureWizardPromptStep<ICreateWebPubSubContext> {
    public async prompt(context: ICreateWebPubSubContext): Promise<void> {
        const placeHolder: string = localize("kind", "Select resource kind");
        const picks: IAzureQuickPickItem<ServiceKind>[] = [
            { label: "Web PubSub", data: KnownServiceKind.WebPubSub, detail: "Supports the native Web PubSub API and provides SDKs in various languages" },
            { label: "SocketIO", data: KnownServiceKind.SocketIO, detail: "Supports Socket.IO protocols and compatible with Socket.IO client and server SDKs" }
        ];
        const kind = (await context.ui.showQuickPick(picks, {
            placeHolder,
            suppressPersistence: true
        })).data;
        context.kind = kind;
    }

    public shouldPrompt(context: ICreateWebPubSubContext): boolean {
        return true;
    }
}



