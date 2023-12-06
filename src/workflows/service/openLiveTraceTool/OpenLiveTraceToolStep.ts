/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
import { IPickServiceContext } from "src/workflows/common/contexts";
import * as vscode from 'vscode';
import { window, type Progress } from "vscode";
import { ext } from "../../../extensionVariables";
import { createEndpointFromHostName, createLiveTraceToolUrl, createWebPubSubHubsAPIClient, localize } from '../../../utils';

export class OpenLiveTraceToolStep extends AzureWizardExecuteStep<IPickServiceContext> {
    public priority: number = 110;

    public async execute(context: IPickServiceContext, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const client = await createWebPubSubHubsAPIClient([context, context.subscription!]);

        const restarting: string = localize('openingLiveTraceTool', 'This may take several seconds...');
        progress.report({ message: restarting });

        if (!context.webPubSubName || !context.resourceGroupName) {
            throw new Error(localize(
                'openLiveTraceToolError',
                `Failed to open LiveTrace Tool "${context.webPubSubName}", resource group "${context.resourceGroupName}"`)
            );
        };
        try {
            const resource = (await (client.webPubSub.get(context.resourceGroupName, context.webPubSubName)));
            const connectionString = (await (client.webPubSub.listKeys(context.resourceGroupName, context.webPubSubName))).primaryConnectionString;
            const accessToken = "???";
            if (!resource || !resource.hostName || !connectionString) {
                window.showErrorMessage(localize('openLiveTraceToolError', `Failed to open LiveTrace Tool of ${context.webPubSubName}.`));
            }
            else {
                const url = createLiveTraceToolUrl(
                    resource.location,
                    createEndpointFromHostName(resource.hostName),
                    accessToken);
                await vscode.env.openExternal(url);
            }
        } catch (error) {
            const pError = parseError(error);
            // a 204 indicates a success, but sdk is catching it as an exception:
            // Received unexpected HTTP status code 204 while polling. This may indicate a server issue.
            if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                throw error;
            }
        }

        const copied: string = localize('openLiveTraceTool', 'Opened LiveTrace Tool of "{0}".', context.webPubSubName);
        ext.outputChannel.appendLog(copied);
    }

    public shouldExecute(context: IPickServiceContext): boolean {
        return !!context.webPubSubName && !!context.resourceGroupName;
    }
}
