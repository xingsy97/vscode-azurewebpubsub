/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureNameStep } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../utils";
import { ICreateHubContext } from "./ICreateHubContext";

export class InputHubNameStep extends AzureNameStep<ICreateHubContext> {
    //refer:
    private static readonly VALID_HUB_REGEX: RegExp = /^[A-Za-z][A-Za-z0-9_`,.[/\]]{0,127}$/;

    constructor() {
        super();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.validateWebPubSubName = this.validateWebPubSubName.bind(this);
    }

    public async prompt(context: ICreateHubContext): Promise<void> {
        const prompt: string = localize('hubNamePrompt', 'Enter a name for the new hub.');
        context.hubName = (await context.ui.showInputBox({ prompt, validateInput: this.validateWebPubSubName })).trim();
        return Promise.resolve(undefined);
    }

    public shouldPrompt(context: ICreateHubContext): boolean {
        return true;
    }

    protected async isRelatedNameAvailable(_context: ICreateHubContext, _name: string): Promise<boolean> {
        return false;
    }

    private async validateWebPubSubName(name: string): Promise<string | undefined> {
        name = name.trim();
        if (!name) {
            return localize('emptyName', 'The hub name is required.');
        }
        if (!InputHubNameStep.VALID_HUB_REGEX.test(name)) {
            return localize('invalidHubName', `
                    The name is invalid.
                    The first character must be a letter.
                    The ther characters must be a letter, number, or one of {'_', ',', '.', '/', '\`'}
                    The value must be between 1 and 127 characters long.
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
