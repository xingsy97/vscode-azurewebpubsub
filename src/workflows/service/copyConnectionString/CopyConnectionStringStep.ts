/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { env, type Progress } from "vscode";
import { ext } from "../../../extensionVariables";
import { createWebPubSubHubsAPIClient } from "../../../utils/createControlPlaneClient";
import { localize } from "../../../utils/localize";
import { IPickServiceContext } from "../../common/IPickServiceContext";

export class CopyConnectionStringStep extends AzureWizardExecuteStep<IPickServiceContext> {
    public priority: number = 110;

    public async execute(context: IPickServiceContext, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const client = await createWebPubSubHubsAPIClient([context, context.subscription!]);

        const restarting: string = localize('copyingConnectionString', 'This may take several seconds...');
        progress.report({ message: restarting });

        if (!context.webPubSubName || !context.resourceGroupName) {
            throw new Error(localize(
                'copyConnectionStringError',
                `Failed to copy connection string "${context.webPubSubName}", resource group "${context.resourceGroupName}"`)
            );
        };
        try {
            const connString = (await (client.webPubSub.listKeys(context.resourceGroupName, context.webPubSubName))).primaryConnectionString;
            if (connString === undefined) {
                vscode.window.showErrorMessage(localize('copyConnectionStringError', `Failed to copy connection string of ${context.webPubSubName}.`));
            }
            else {
                env.clipboard.writeText(connString);
                vscode.window.showInformationMessage(`Copied Connection String of ${context.webPubSubName} to Clipboard`);
            }
        } catch (error) {
            const pError = parseError(error);
            // a 204 indicates a success, but sdk is catching it as an exception:
            // Received unexpected HTTP status code 204 while polling. This may indicate a server issue.
            if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                throw error;
            }
        }

        const copied: string = localize('copyConnectionString', 'Copied Connection String of "{0}".', context.webPubSubName);
        ext.outputChannel.appendLog(copied);
    }

    public shouldExecute(context: IPickServiceContext): boolean {
        return !!context.webPubSubName && !!context.resourceGroupName;
    }
}
