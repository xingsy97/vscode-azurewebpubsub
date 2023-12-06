/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, QuickPickAzureSubscriptionStep, TreeElementBase, type IActionContext } from "@microsoft/vscode-azext-utils";
import { AzureResourceBranchDataProvider, AzureSubscription } from "@microsoft/vscode-azureresources-api";

// Modified from function subscriptionExperience(context, tdp)

export async function pickSubscription(context: IActionContext, tdp: AzureResourceBranchDataProvider<TreeElementBase>): Promise<AzureSubscription> {
    const wizardContext = Object.assign({}, context);
    wizardContext["pickedNodes"] = [];
    const wizard = new AzureWizard(wizardContext, {
        hideStepCount: true,
        promptSteps: [new QuickPickAzureSubscriptionStep(tdp)],
        showLoadingPrompt: true
    });
    await wizard.prompt();
    if (!wizardContext["subscription"]) throw new Error("Subscription not found");
    return wizardContext["subscription"];
}
