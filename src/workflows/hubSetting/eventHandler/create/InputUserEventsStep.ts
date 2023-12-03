/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureNameStep } from "@microsoft/vscode-azext-utils";
import { KnownUserEvents, eventHandlerUserEvents } from "../../../../constants";
import { localize } from "../../../../utils";
import { ICreateEventHandlerContext } from "./ICreateEventHandlerContext";


export class InputUserEventsStep extends AzureNameStep<ICreateEventHandlerContext> {
    public async prompt(context: ICreateEventHandlerContext): Promise<void> {
        const placeHodler: string = localize('userEventsPrompt', 'Select User Events');
        const candidateItems = eventHandlerUserEvents.map((event) => ({ label: event, data: event }));
        const userEvent = (await (context.ui.showQuickPick(candidateItems, { placeHolder: placeHodler }))).data;
        var userEventPattern: string = "";
        switch (userEvent) {
            case KnownUserEvents.All: userEventPattern = "*"; break;
            case KnownUserEvents.None: userEventPattern = ""; break;
            case KnownUserEvents.Specify:
                const showInputBox = context.ui.showInputBox({
                    prompt: localize('userEventsPatternPrompt', 'Speicify the user events, Separate multiple event names using comma(,)')
                });
                userEventPattern = (await showInputBox).trim();
                break;
            default:
                throw new Error(`Invalid User Event Type ${userEvent}`);
        }
        context.eventHandler.userEventPattern = userEventPattern;
    }

    public shouldPrompt(context: ICreateEventHandlerContext): boolean { return true; }

    protected async isRelatedNameAvailable(_context: ICreateEventHandlerContext, _name: string): Promise<boolean> {
        return false;
    }
}
