/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { ContextValueQuickPickStep, runQuickPickWizard, type AzureResourceQuickPickWizardContext, type AzureWizardPromptStep, type IActionContext, type QuickPickWizardContext } from "@microsoft/vscode-azext-utils";
import { type ResourceGroupsTreeDataProvider } from "@microsoft/vscode-azureresources-api";
import { ext } from "../../extensionVariables";
import { EventHandlerItem } from "../../tree/hub/properties/EventHandlerItem";
import { localize } from "../../utils/localize";
import { type PickItemOptions } from "./PickItemOptions";
import { getPickHubSteps } from "./pickHub";

export async function pickEventHandler(context: IActionContext, options?: PickItemOptions): Promise<EventHandlerItem> {
    const promptSteps: AzureWizardPromptStep<QuickPickWizardContext>[] = [...getPickEventHandlerSteps()];

    return await runQuickPickWizard(context,
        {
            promptSteps,
            title: options?.title,
            showLoadingPrompt: options?.showLoadingPrompt
        });
}

export function getPickEventHandlerSteps(skipIfOne: boolean = false): AzureWizardPromptStep<AzureResourceQuickPickWizardContext>[] {
    const tdp: ResourceGroupsTreeDataProvider = ext.rgApiV2.resources.azureResourceTreeDataProvider;
    // const types = [AzExtResourceType.ContainerAppsEnvironment];
    const types = ["WebPubSub"];

    let eventHandlerFilter: RegExp | undefined;
    // if (hubName) {
    //     hubFilter = hubName instanceof RegExp ? hubName : new RegExp(`^${hubName}$`);
    // } else {
    eventHandlerFilter = EventHandlerItem.contextValueRegExp;
    // }

    return [
        ...getPickHubSteps(),
        new ContextValueQuickPickStep(ext.branchDataProvider,
            {
                contextValueFilter: { include: eventHandlerFilter },
                skipIfOne,
            },
            {
                placeHolder: localize('selectEventHandler', 'Select an event handler'),
                noPicksMessage: localize('noEventHandler', 'Current hub has no event handler'),
            }
        )
    ];
}


