/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { ContextValueQuickPickStep, QuickPickAzureSubscriptionStep, QuickPickGroupStep, runQuickPickWizard, type AzureResourceQuickPickWizardContext, type AzureWizardPromptStep, type IActionContext, type QuickPickWizardContext } from "@microsoft/vscode-azext-utils";
import { AzExtResourceType, type ResourceGroupsTreeDataProvider } from "@microsoft/vscode-azureresources-api";
import { ext } from "../../extensionVariables";
import { WebPubSubItem } from "../../model";
import { localize } from "../../utils/localize";
import { type PickItemOptions } from "./PickItemOptions";

export function getPickWebPubSubSteps(skipIfOne: boolean = false, webPubSubName?: string | RegExp): AzureWizardPromptStep<AzureResourceQuickPickWizardContext>[] {
    const tdp: ResourceGroupsTreeDataProvider = ext.rgApiV2.resources.azureResourceTreeDataProvider;
    const types = [AzExtResourceType.ContainerAppsEnvironment];

    let webPubSubFilter: RegExp | undefined;
    if (webPubSubName) {
        webPubSubFilter = webPubSubName instanceof RegExp ? webPubSubName : new RegExp(`^${webPubSubName}$`);
    } else {
        webPubSubFilter = WebPubSubItem.contextValueRegExp;
    }

    return [
        new QuickPickAzureSubscriptionStep(tdp),
        new QuickPickGroupStep(tdp, {
            groupType: types
        }),
        new ContextValueQuickPickStep(ext.rgApiV2.resources.azureResourceTreeDataProvider, {
            contextValueFilter: { include: webPubSubFilter },
            skipIfOne,
        }, {
            placeHolder: localize('selectContainerAppsEnvironment', 'Select a container apps environment'),
            noPicksMessage: localize('noContainerAppsEnvironment', 'Current subscription has no container apps environments'),
        })
    ];
}

export async function pickWebPubSub(context: IActionContext, options?: PickItemOptions): Promise<WebPubSubItem> {
    const promptSteps: AzureWizardPromptStep<QuickPickWizardContext>[] = [
        ...getPickWebPubSubSteps()
    ];

    return await runQuickPickWizard(context, {
        promptSteps,
        title: options?.title,
        showLoadingPrompt: options?.showLoadingPrompt
    });
}
