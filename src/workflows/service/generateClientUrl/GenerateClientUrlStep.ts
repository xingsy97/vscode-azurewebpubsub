/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KnownKeyType } from "@azure/arm-webpubsub";
import { WebPubSubServiceClient } from "@azure/web-pubsub";
import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
import { IPickKeyContext } from "src/workflows/common/contexts";
import * as vscode from 'vscode';
import { env, type Progress } from "vscode";
import { ext } from "../../../extensionVariables";
import { createWebPubSubHubsAPIClient, localize } from '../../../utils';

export class GenerateClientUrlStep extends AzureWizardExecuteStep<IPickKeyContext> {
    public priority: number = 110;

    public async execute(context: IPickKeyContext, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const client = await createWebPubSubHubsAPIClient([context, context.subscription!]);

        progress.report({ message: localize('takeSeveralSeconds', 'This may take several seconds...') });

        if (!context.webPubSubName || !context.resourceGroupName) {
            throw new Error(localize(
                'invalidCopyConnectionStringParms',
                `Failed to copy connection string of "${context.webPubSubName}" in resource group "${context.resourceGroupName}"`)
            );
        };
        try {
            const serviceClient = new WebPubSubServiceClient(
                "<ConnectionString>",
                "<hubName>"
            );
            const keys = await client.webPubSub.listKeys(context.resourceGroupName, context.webPubSubName);
            const connString = context.keyType === KnownKeyType.Primary ? keys.primaryConnectionString : keys.secondaryConnectionString;
            if (connString === undefined) {
                vscode.window.showErrorMessage(localize('copyConnectionStringError', `Failed to copy connection string of ${context.webPubSubName}.`));
            }
            else {
                env.clipboard.writeText(connString);
                vscode.window.showInformationMessage(
                    localize("copiedConnectionString", "Copied {0} Connection String of {1} to Clipboard", context.keyType, context.webPubSubName)
                );
            }
        } catch (error) {
            const pError = parseError(error);
            if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                throw error;
            }
        }
        ext.outputChannel.appendLog(`Copied connection of "${context.webPubSubName}" in resource group "${context.resourceGroupName}" to clipboard.`);
    }

    public shouldExecute(context: IPickKeyContext): boolean {
        return !!context.resourceGroupName && !!context.webPubSubName && !!context.keyType;
    }
}
