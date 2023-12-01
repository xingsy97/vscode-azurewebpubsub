/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { AzureWizardExecuteStep } from "@microsoft/vscode-azext-utils";
import { Progress } from "vscode";
import { localize, nonNullProp } from "../../../utils";
import { ICreateHubContext } from "./ICreateHubContext";

export class CreateHubStep extends AzureWizardExecuteStep<ICreateHubContext> {
    public priority: number = 135;

    constructor(private readonly client: WebPubSubManagementClient) {
        super();
    }

    public async execute(context: ICreateHubContext, progress: Progress<{ message?: string; increment?: number }>): Promise<void> {
        const message: string = localize('creatingWebPubSubHub', 'Creating New Hub "{0}"...', context.hubName);
        progress.report({ message });
        const response = await this.client.webPubSubHubs.beginCreateOrUpdateAndWait(
            nonNullProp(context, 'hubName'),
            nonNullProp(context, 'resourceGroupName'),
            nonNullProp(context, 'webPubSubResourceName'),
            context.hubSetting!
        );
    }

    public shouldExecute(context: ICreateHubContext): boolean {
        return true;
    }
}
