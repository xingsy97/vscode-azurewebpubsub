/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import  { type WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { AzureWizardExecuteStep } from "@microsoft/vscode-azext-utils";
import  { type Progress } from "vscode";
import { localize, nonNullProp } from "../../../../utils";
import  { type ICreateEventHandlerContext } from "./ICreateEventHandlerContext";

export class CreateEventHandlerStep extends AzureWizardExecuteStep<ICreateEventHandlerContext> {
    public priority: number = 135;

    constructor(private readonly client: WebPubSubManagementClient) {
        super();
    }

    public async execute(context: ICreateEventHandlerContext, progress: Progress<{ message?: string; increment?: number }>): Promise<void> {
        const message: string = localize('creatingEventHandler', `Creating Event Handler in Hub ${context.hubName}`);
        progress.report({ message });
        const hubProperties = context.hubProperties;
        if (!hubProperties.eventHandlers) hubProperties.eventHandlers = [];

        hubProperties.eventHandlers.push(context.eventHandler);
        const response = await this.client.webPubSubHubs.beginCreateOrUpdateAndWait(
            nonNullProp(context, 'hubName'),
            nonNullProp(context, 'resourceGroupName'),
            nonNullProp(context, 'webPubSubResourceName'),
            {
                properties: hubProperties
            }
        );
    }

    public shouldExecute(context: ICreateEventHandlerContext): boolean {
        if (!context.eventHandler || !context.resourceGroupName || !context.webPubSubResourceName || !context.hubName) {
            throw new Error(`Invalid context for creating event handler`)
        }
        return true;
    }
}
