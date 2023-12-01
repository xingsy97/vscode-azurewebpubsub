/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
import { createWebPubSubHubsAPIClient } from "src/utils/createControlPlaneClient";
import { type Progress } from "vscode";
import { ext } from "../../../extensionVariables";
import { localize } from "../../../utils/localize";
import { IPickServiceContext } from "../../common/IPickServiceContext";

export class RestartWebPubSubStep extends AzureWizardExecuteStep<IPickServiceContext> {
    public priority: number = 110;

    public async execute(context: IPickServiceContext, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const client = await createWebPubSubHubsAPIClient([context, context.subscription!]);

        const restarting: string = localize('restartingWebPubSub', 'This may take some time...');
        progress.report({ message: restarting });

        if (!context.webPubSubName || !context.resourceGroupName) {
            throw new Error(localize(
                'restartWebPubSubError',
                `Failed to restart Web PubSub "${context.webPubSubName}", resource group "${context.resourceGroupName}"`)
            );
        };
        try {
            await client.webPubSub.beginRestartAndWait(context.resourceGroupName, context.webPubSubName);
        } catch (error) {
            const pError = parseError(error);
            // a 204 indicates a success, but sdk is catching it as an exception:
            // Received unexpected HTTP status code 204 while polling. This may indicate a server issue.
            if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                throw error;
            }
        }

        const restarted: string = localize('restartedWebPubSub', 'Restarted Web PubSub "{0}".', context.webPubSubName);
        ext.outputChannel.appendLog(restarted);
    }

    public shouldExecute(context: IPickServiceContext): boolean {
        return !!context.webPubSubName && !!context.resourceGroupName;
    }
}
