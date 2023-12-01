/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubSkuTier } from "@azure/arm-webpubsub";
import { AzureNameStep } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../utils";
import { ICreateServiceContext } from "./ICreateServiceContext";

export class InputServiceNameStep extends AzureNameStep<ICreateServiceContext> {
    //refer: https://dev.azure.com/msazure/AzureDMSS/_git/AzureDMSS-PortalExtension?path=%2Fsrc%2FSpringCloudPortalExt%2FClient%2FCreateApplication%2FCreateApplicationBlade.ts&version=GBdev&line=463&lineEnd=463&lineStartColumn=25&lineEndColumn=55&lineStyle=plain&_a=contents
    private static readonly VALID_NAME_REGEX: RegExp = /^[a-z][a-z0-9-]{2,30}[a-z0-9]$/;

    constructor() {
        super();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.validateWebPubSubName = this.validateWebPubSubName.bind(this);
    }

    public async prompt(context: ICreateServiceContext): Promise<void> {
        const prompt: string = localize('webPubSubNamePrompt', 'Enter a globally unique name for the new Web PubSub resource.');
        context.webPubSubName = (await context.ui.showInputBox({ prompt, validateInput: this.validateWebPubSubName })).trim();
        return Promise.resolve(undefined);
    }

    public shouldPrompt(context: ICreateServiceContext): boolean {
        return true;
    }

    protected async isRelatedNameAvailable(_context: ICreateServiceContext, _name: string): Promise<boolean> {
        return false;
    }

    private async validateWebPubSubName(name: string): Promise<string | undefined> {
        name = name.trim();
        if (!name) {
            return localize('emptyName', 'The name is required.');
        }
        if (!InputServiceNameStep.VALID_NAME_REGEX.test(name)) {
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

export const getSkuTierFromSkuName = (tier: WebPubSubSkuTier) => {
    switch (tier) {
        case "Free": return "Free_F1";
        case "Standard": return "Standard_S1";
        case "Premium": return "Premium_P1";
        default: throw new Error("Invalid sku tier");
    }
}
