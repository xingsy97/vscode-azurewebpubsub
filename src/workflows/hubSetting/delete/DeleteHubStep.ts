/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
import { type Progress } from "vscode";
import { ext } from "../../../extensionVariables";
import { createWebPubSubHubsAPIClient, localize } from '../../../utils';
import { IDeleteHubSettingContext } from "./IDeleteHubContext";

export class DeleteHubSettingStep extends AzureWizardExecuteStep<IDeleteHubSettingContext> {
    public priority: number = 110;

    public async execute(context: IDeleteHubSettingContext, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const client = await createWebPubSubHubsAPIClient([context, context.subscription!]);

        const deleting: string = localize('deletingHub', 'Deleting Hub ...');
        progress.report({ message: deleting });

        if (!context.hubName || !context.resourceGroupName || !context.webPubSubResourceName) {
            throw new Error(localize(
                'deleteHubError',
                `Failed to delete Hub "${context.hubName}", resource group "${context.resourceGroupName}", webPubSubResourceName "${context.webPubSubResourceName}"`)
            );
        }
        try {
            await client.webPubSubHubs.beginDeleteAndWait(context.hubName, context.resourceGroupName, context.webPubSubResourceName);
        } catch (error) {
            const pError = parseError(error);
            // a 204 indicates a success, but sdk is catching it as an exception:
            // Received unexpected HTTP status code 204 while polling. This may indicate a server issue.
            if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                throw error;
            }
        }

        const deleted: string = localize('deleteHubSetting', 'Deleted Hub Setting "{0}".', context.webPubSubResourceName);
        ext.outputChannel.appendLog(deleted);
    }

    public shouldExecute(context: IDeleteHubSettingContext): boolean {
        if (!context.resourceGroupName || !context.resourceGroupName) {
            throw new Error(`Invalid resourceGroupName = ${context.resourceGroupName} or resourceName = ${context.resourceGroupName}`);
        }
        return true;
    }
}
