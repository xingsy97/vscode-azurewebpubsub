/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardExecuteStep, parseError } from "@microsoft/vscode-azext-utils";
import  { type IPickKeyContext } from "src/workflows/common/contexts";
import * as vscode from 'vscode';
import { type Progress } from "vscode";
import { ext } from "../../../extensionVariables";
import { createWebPubSubHubsAPIClient, localize } from '../../../utils';

export class RegenerateKeyStep extends AzureWizardExecuteStep<IPickKeyContext> {
    public priority: number = 110;

    public async execute(context: IPickKeyContext, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        if (!context.webPubSubName || !context.resourceGroupName) {
            throw new Error(
                localize(
                    'regenerateKeyError',
                    'Failed to regenerate key for "{0}" in resource group "{1}"', context.webPubSubName, context.resourceGroupName
                ));
        }

        const client = await createWebPubSubHubsAPIClient([context, context.subscription!]);

        progress.report({ message: localize('takeSeveralSeconds', 'This may take several seconds...') });

        try {
            const result = await client.webPubSub.beginRegenerateKeyAndWait(context.resourceGroupName, context.webPubSubName, { keyType: context.keyType });
            // the api doesn't return key content as described. Bug?
            // if (!result || !result.primaryConnectionString) {
            //     vscode.window.showErrorMessage(localize('regenerateKeyError', `Failed to regenerate key of ${context.webPubSubName}.`));
            // }
            // else {
            vscode.window.showInformationMessage(
                localize("regeneratedKey", "Regenerated {0} Key of {1}", context.keyType, context.webPubSubName)
            );
            // }
        } catch (error) {
            const pError = parseError(error);
            if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                throw error;
            }
        }

        ext.outputChannel.appendLog(`Regenerated key for "${context.webPubSubName}" in resource group "${context.resourceGroupName}".`);
    }

    public shouldExecute(context: IPickKeyContext): boolean {
        return !!context.webPubSubName && !!context.resourceGroupName && !!context.keyType;
    }
}
