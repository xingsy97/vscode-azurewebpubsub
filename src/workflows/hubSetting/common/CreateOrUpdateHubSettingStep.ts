/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { AzureWizardExecuteStep } from "@microsoft/vscode-azext-utils";
import { Progress } from "vscode";
import { localize, nonNullProp } from "../../../utils";
import { ICreateOrUpdateHubSettingContext } from "../create/ICreateEventHandlerContext";

export class CreateOrUpdateHubSettingStep extends AzureWizardExecuteStep<ICreateOrUpdateHubSettingContext> {
    public priority: number = 135;

    constructor(private readonly client: WebPubSubManagementClient) { super(); }

    public async execute(context: ICreateOrUpdateHubSettingContext, progress: Progress<{ message?: string; increment?: number }>): Promise<void> {
        const message: string = localize('creatingEventHandler', `Creating Event Handler in Hub ${context.hubName}`);
        progress.report({ message });
        if (!context.hubProperties) throw new Error("hubProperties is null");

        var hubProperties = context.hubProperties;
        if (!hubProperties.eventHandlers) hubProperties.eventHandlers = [];
        if (!hubProperties.eventListeners) hubProperties.eventListeners = [];

        const response = await this.client.webPubSubHubs.beginCreateOrUpdateAndWait(
            nonNullProp(context, 'hubName'),
            nonNullProp(context, 'resourceGroupName'),
            nonNullProp(context, 'webPubSubName'),
            {
                properties: hubProperties
            }
        );
    }

    public shouldExecute(context: ICreateOrUpdateHubSettingContext): boolean {
        if (!context.hubName || !context.resourceGroupName || !context.webPubSubName || !context.hubProperties)
            throw new Error(`Invalid context = ${context}`);
        return true;
    }
}
