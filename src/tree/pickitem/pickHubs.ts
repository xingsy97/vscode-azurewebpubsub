/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { ContextValueQuickPickStep, runQuickPickWizard, type AzureResourceQuickPickWizardContext, type AzureWizardPromptStep, type IActionContext, type QuickPickWizardContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../extensionVariables";
import { localize } from "../../utils";
import { HubsItem } from "../hub/HubsItem";
import { type PickItemOptions } from "./PickItemOptions";
import { getPickServiceSteps } from "./pickService";

export async function pickHubs(context: IActionContext, options?: PickItemOptions): Promise<HubsItem> {
    const promptSteps: AzureWizardPromptStep<QuickPickWizardContext>[] = [...getPickHubsSteps()];

    return await runQuickPickWizard(context,
        {
            promptSteps,
            title: options?.title,
            showLoadingPrompt: options?.showLoadingPrompt
        });
}

export function getPickHubsSteps(skipIfOne: boolean = false): AzureWizardPromptStep<AzureResourceQuickPickWizardContext>[] {
    const hubsFilter = HubsItem.contextValueRegExp;

    return [
        ...getPickServiceSteps(),
        new ContextValueQuickPickStep(ext.rgApiV2.resources.azureResourceTreeDataProvider,
            {
                contextValueFilter: { include: hubsFilter },
                skipIfOne: true,
            },
            {
                placeHolder: localize('selectHub', 'Select hubs'),
                noPicksMessage: localize('noHub', 'Current Web PubSub serivce has no hubs'),
            }
        )
    ];
}


