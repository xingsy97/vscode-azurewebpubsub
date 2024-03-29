/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { env, window, type Progress } from "vscode";
import { ext } from "../../../extensionVariables";
import { createWebPubSubHubsAPIClient, localize } from '../../../utils';
import  { type ICopyEndpointContext } from "./ICopyEndpointContext";

export class CopyEndpointStep extends AzureWizardExecuteStep<ICopyEndpointContext> {
    public priority: number = 110;

    public async execute(context: ICopyEndpointContext, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const client = await createWebPubSubHubsAPIClient([context, context.subscription!]);

        const restarting: string = localize('copyingEndpoint', 'This may take several seconds...');
        progress.report({ message: restarting });

        if (!context.webPubSubName || !context.resourceGroupName) {
            throw new Error(localize(
                'copyEndpointError',
                `Failed to copy connection string "${context.webPubSubName}", resource group "${context.resourceGroupName}"`)
            );
        }
        try {
            if (context.endpoint === undefined) {
                window.showErrorMessage(localize('copyEndpointError', `Failed to copy endpoint of ${context.webPubSubName}.`));
            }
            else {
                env.clipboard.writeText(context.endpoint);
                vscode.window.showInformationMessage(`Copied Endpoint of ${context.webPubSubName} to Clipboard`)
            }
        } catch (error) {
            const pError = parseError(error);
            // a 204 indicates a success, but sdk is catching it as an exception:
            // Received unexpected HTTP status code 204 while polling. This may indicate a server issue.
            if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                throw error;
            }
        }

        const copied: string = localize('copyEndpoint', 'Copied Endpoint of "{0}".', context.webPubSubName);
        ext.outputChannel.appendLog(copied);
    }

    public shouldExecute(context: ICopyEndpointContext): boolean {
        return !!context.webPubSubName && !!context.resourceGroupName;
    }
}
