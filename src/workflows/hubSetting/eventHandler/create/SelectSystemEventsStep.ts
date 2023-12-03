/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureNameStep } from "@microsoft/vscode-azext-utils";
import { eventHandlerSystemEvents } from "../../../../constants";
import { localize } from "../../../../utils";
import { ICreateEventHandlerContext } from "./ICreateEventHandlerContext";


export class SelectSystemEventsStep extends AzureNameStep<ICreateEventHandlerContext> {
    public async prompt(context: ICreateEventHandlerContext): Promise<void> {
        if (!context.eventHandler) throw new Error(`Invalid event handler ${context.eventHandler}`);
        const placeHodler: string = localize('systemEventsPrompt', 'Select System Events');
        const candidateItems = eventHandlerSystemEvents.map((event) => ({ label: event, data: event }));
        const selectedItems = await (context.ui.showQuickPick(candidateItems, {
            placeHolder: placeHodler,
            canPickMany: true
        }));
        context.eventHandler.systemEvents = selectedItems.map((item) => item.data);
    }

    public shouldPrompt(context: ICreateEventHandlerContext): boolean { return true; }

    protected async isRelatedNameAvailable(_context: ICreateEventHandlerContext, _name: string): Promise<boolean> {
        return false;
    }
}
