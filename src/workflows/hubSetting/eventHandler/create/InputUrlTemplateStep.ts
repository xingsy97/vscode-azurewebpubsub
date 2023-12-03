/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureNameStep } from "@microsoft/vscode-azext-utils";
import { localize } from "../../../../utils";
import { ICreateEventHandlerContext } from "./ICreateEventHandlerContext";


export class InputUrlTemplateStep extends AzureNameStep<ICreateEventHandlerContext> {
    constructor() {
        super();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.valideteUrlTemplate = this.valideteUrlTemplate.bind(this);
    }

    public async prompt(context: ICreateEventHandlerContext): Promise<void> {
        if (!context.eventHandler) throw new Error(`Invalid event handler ${context.eventHandler}`);
        const prompt: string = localize('eventHandlerPrompt', 'Enter an URL Template for the Event Handler.');
        context.eventHandler.urlTemplate = (await context.ui.showInputBox({ prompt, validateInput: this.valideteUrlTemplate }));
    }

    public shouldPrompt(context: ICreateEventHandlerContext): boolean {
        return true;
    }

    protected async isRelatedNameAvailable(_context: ICreateEventHandlerContext, _name: string): Promise<boolean> {
        return false;
    }

    private async valideteUrlTemplate(urlTemplate: string): Promise<string | undefined> {
        if (!urlTemplate) {
            return localize('emptyUrlTemplate', 'The Url Template Is Required.');
        }
        try {
            new URL(urlTemplate);
            return undefined;
        } catch (err) {
            return localize('invalidUrlTemplate', `The URL template must be a valid URL.`);
        }
    }
}
