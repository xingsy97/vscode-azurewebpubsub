/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import  { type WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { AzureWizardExecuteStep } from "@microsoft/vscode-azext-utils";
import  { type Progress } from "vscode";
import { localize, nonNullProp } from "../../../../utils";
import  { type IDeleteEventHandlerContext } from "./IDeleteEventHandlerContext";

export class DeleteEventHandlerStep extends AzureWizardExecuteStep<IDeleteEventHandlerContext> {
    public priority: number = 135;

    constructor(private readonly client: WebPubSubManagementClient) {
        super();
    }

    public async execute(context: IDeleteEventHandlerContext, progress: Progress<{ message?: string; increment?: number }>): Promise<void> {
        const message: string = localize('deletingEventHandler', `Deleting Event Handler in Hub ${context.hubName}`);
        progress.report({ message });

        const hubProperties = context.hubProperties;
        if (hubProperties.eventHandlers) {
            hubProperties.eventHandlers.splice(context.indexInHub, 1);
        }

        const response = await this.client.webPubSubHubs.beginCreateOrUpdateAndWait(
            nonNullProp(context, 'hubName'),
            nonNullProp(context, 'resourceGroupName'),
            nonNullProp(context, 'webPubSubResourceName'),
            {
                properties: hubProperties
            }
        );
    }

    public shouldExecute(context: IDeleteEventHandlerContext): boolean {
        if (!context.hubName || !context.resourceGroupName || !context.webPubSubResourceName) {
            throw new Error(`Invalid hubName = ${context.hubName} or resourceGroupName = ${context.resourceGroupName} or webPubSubResourceName = ${context.webPubSubResourceName}`);
        }
        return true;
    }
}
