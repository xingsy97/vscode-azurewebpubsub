/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
import { type Progress } from "vscode";
import { ext } from "../../../extensionVariables";
import { createWebPubSubHubsAPIClient } from "../../../tree";
import { localize } from "../../../utils/localize";
import { IPickWebPubSubContext } from "../../common/IPickWebPubSubContext";

export class DeleteServiceStep extends AzureWizardExecuteStep<IPickWebPubSubContext> {
    public priority: number = 110;

    public async execute(context: IPickWebPubSubContext, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const client = await createWebPubSubHubsAPIClient([context, context.subscription!]);

        const deleting: string = localize('deletingWebPubSub', 'This may take several minutes...');
        progress.report({ message: deleting });

        if (!context.webPubSubName || !context.resourceGroupName) {
            throw new Error(localize(
                'deleteWebPubSubError',
                `Failed to delete Web PubSub "${context.webPubSubName}", resource group "${context.resourceGroupName}"`)
            );
        };
        try {
            await client.webPubSub.beginDeleteAndWait(context.resourceGroupName, context.webPubSubName);
        } catch (error) {
            const pError = parseError(error);
            // a 204 indicates a success, but sdk is catching it as an exception:
            // Received unexpected HTTP status code 204 while polling. This may indicate a server issue.
            if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                throw error;
            }
        }

        const deleted: string = localize('deletedWebPubSub', 'Deleted Web PubSub "{0}".', context.webPubSubName);
        ext.outputChannel.appendLog(deleted);
    }

    public shouldExecute(context: IPickWebPubSubContext): boolean {
        return !!context.webPubSubName && !!context.resourceGroupName;
    }
}
