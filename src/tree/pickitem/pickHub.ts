/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/


import { ContextValueQuickPickStep, runQuickPickWizard, type AzureResourceQuickPickWizardContext, type AzureWizardPromptStep, type IActionContext, type QuickPickWizardContext } from "@microsoft/vscode-azext-utils";
import { type ResourceGroupsTreeDataProvider } from "@microsoft/vscode-azureresources-api";
import { ext } from "../../extensionVariables";
import { localize } from "../../utils";
import { HubItem } from "../hub/HubItem";
import { type PickItemOptions } from "./PickItemOptions";
import { getPickServiceSteps } from "./pickService";

export async function pickHub(context: IActionContext, options?: PickItemOptions): Promise<HubItem> {
    const promptSteps: AzureWizardPromptStep<QuickPickWizardContext>[] = [...getPickHubSteps(true)];

    return await runQuickPickWizard(context,
        {
            promptSteps,
            title: options?.title,
            showLoadingPrompt: options?.showLoadingPrompt
        });
}
// const types = [AzExtResourceType.ContainerAppsEnvironment];
// const types = ["WebPubSub"];

export function getPickHubSteps(skipIfOne: boolean = false, hubName?: string | RegExp): AzureWizardPromptStep<AzureResourceQuickPickWizardContext>[] {
    const tdp: ResourceGroupsTreeDataProvider = ext.rgApiV2.resources.azureResourceTreeDataProvider;

    let hubFilter: RegExp | undefined;
    if (hubName) {
        hubFilter = hubName instanceof RegExp ? hubName : new RegExp(`^${hubName}$`);
    } else {
        hubFilter = HubItem.contextValueRegExp;
    }

    return [
        ...getPickServiceSteps(),
        new ContextValueQuickPickStep(ext.rgApiV2.resources.azureResourceTreeDataProvider,
            {
                contextValueFilter: { include: [HubItem.contextValueRegExp] },
                skipIfOne: true,
            },
            {
                placeHolder: localize('selectHub', 'Select a Hub'),
                noPicksMessage: localize('noHub', 'Current Web PubSub serivce has no hub'),
            }
        ),
        new ContextValueQuickPickStep(ext.rgApiV2.resources.azureResourceTreeDataProvider,
            {
                contextValueFilter: { include: hubFilter },
                skipIfOne: true,
            },
            {
                placeHolder: localize('selectHub', 'Select a Hub'),
                noPicksMessage: localize('noHub', 'Current Web PubSub serivce has no hub'),
            }
        )
    ];
}


