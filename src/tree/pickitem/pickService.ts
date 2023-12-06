/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { ContextValueQuickPickStep, QuickPickAzureSubscriptionStep, QuickPickGroupStep, runQuickPickWizard, type AzureResourceQuickPickWizardContext, type AzureWizardPromptStep, type IActionContext, type QuickPickWizardContext } from "@microsoft/vscode-azext-utils";
import { type ResourceGroupsTreeDataProvider } from "@microsoft/vscode-azureresources-api";
import { ext } from "../../extensionVariables";
import { localize } from "../../utils";
import { ServiceItem } from "../service/ServiceItem";
import { type PickItemOptions } from "./PickItemOptions";

export async function pickService(context: IActionContext, options?: PickItemOptions): Promise<ServiceItem> {
    const promptSteps: AzureWizardPromptStep<QuickPickWizardContext>[] = [...getPickServiceSteps()];

    return await runQuickPickWizard(context, { promptSteps, title: options?.title, showLoadingPrompt: options?.showLoadingPrompt });
}

export function getPickServiceSteps(skipIfOne: boolean = false, webPubSubName?: string | RegExp): AzureWizardPromptStep<AzureResourceQuickPickWizardContext>[] {
    const tdp: ResourceGroupsTreeDataProvider = ext.rgApiV2.resources.azureResourceTreeDataProvider;
    const types = ["WebPubSub" as any];
    // const types = [AzExtResourceType.ContainerAppsEnvironment];

    let webPubSubFilter: RegExp | undefined;
    if (webPubSubName) {
        webPubSubFilter = webPubSubName instanceof RegExp ? webPubSubName : new RegExp(`^${webPubSubName}$`);
    } else {
        webPubSubFilter = ServiceItem.contextValueRegExp;
    }

    return [
        new QuickPickAzureSubscriptionStep(tdp),
        new QuickPickGroupStep(tdp, { groupType: types }),
        new ContextValueQuickPickStep(
            ext.rgApiV2.resources.azureResourceTreeDataProvider,
            {
                contextValueFilter: { include: webPubSubFilter },
                skipIfOne,
            },
            {
                placeHolder: localize('selectAzureWebPubSub', 'Select an Azure Web PubSub resource'),
                noPicksMessage: localize('noAzureWebPubSub', 'Current subscription has no Web PubSub resource'),
            }
        )
    ];
}
