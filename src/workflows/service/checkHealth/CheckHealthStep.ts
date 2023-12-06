/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardExecuteStep } from "@microsoft/vscode-azext-utils";
import fetch from "node-fetch";
import * as vscode from 'vscode';
import { type Progress } from "vscode";
import { ext } from "../../../extensionVariables";
import { localize } from "../../../utils";
import { ICheckHealthContext } from "./ICheckHealthContext";

export class CheckHealthStep extends AzureWizardExecuteStep<ICheckHealthContext> {
    public priority: number = 110;

    public async execute(context: ICheckHealthContext, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const checking: string = localize('checkingHealth', 'This may take several seconds...');
        progress.report({ message: checking });

        try {
            const url = `${context.endpoint}/api/health`;
            const response = await fetch(url);
            if (response.status !== 200) {
                const error = localize('checkHealthError', `Bad health of ${context.webPubSubName}. Status code = ${response.status}`);
                throw new Error(error);
            }
            else {
                vscode.window.showInformationMessage(`Good Health of ${context.webPubSubName}!`)
            }
        } catch (error) {
            const failed: string = localize('checkHealthError', `Failed to Check Health of "{0}".`, context.webPubSubName);
            ext.outputChannel.appendLog(failed);
            throw error;
        }
        const checked: string = localize('checkHealth', 'Checked Health of "{0}".', context.webPubSubName);
        ext.outputChannel.appendLog(checked);
    }

    public shouldExecute(context: ICheckHealthContext): boolean {
        if (!context.webPubSubName || !context.resourceGroupName || !context.endpoint) {
            throw new Error(localize(
                'checkHealthError',
                `Failed to check health of "${context.webPubSubName}", resource group "${context.resourceGroupName}"`)
            );
        };
        return true;
    }
}
