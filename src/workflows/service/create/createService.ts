/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { ResourceSku, WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { LocationListStep, ResourceGroupListStep, VerifyProvidersStep, createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, AzureWizardExecuteStep, AzureWizardPromptStep, IActionContext, createSubscriptionContext, subscriptionExperience } from "@microsoft/vscode-azext-utils";
import { AzureSubscription } from "@microsoft/vscode-azureresources-api";
import * as vscode from "vscode";
import { webPubSubId, webPubSubProvider } from "../../../constants";
import { ext } from "../../../extensionVariables";
import * as utils from "../../../utils";
import { createActivityContext } from "../../../utils";
import { CreateServiceStep } from "./CreateServiceStep";
import { ICreateServiceContext } from "./ICreateServiceContext";
import { InputSerivceSkuUnitCountStep } from "./InputSerivceSkuUnitCountStep";
import { InputServiceKindStep } from "./InputServiceKindStep";
import { InputServiceNameStep } from "./InputServiceNameStep";
import { InputServiceSkuTierStep } from "./InputServiceSkuTierStep";

export async function createService(context: IActionContext, node?: { subscription: AzureSubscription }): Promise<void> {
    const subscription = node?.subscription ?? await subscriptionExperience(context, ext.rgApiV2.resources.azureResourceTreeDataProvider);

    const wizardContext: ICreateServiceContext = {
        ...context,
        ...createSubscriptionContext(subscription),
        ...(await createActivityContext()),
        Sku: {
            sku: {
                name: "",
                tier: "",
                capacity: 0
            } as ResourceSku
        }
    };

    const title: string = utils.localize('createWebPubSub', "Create Web PubSub");

    const promptSteps: AzureWizardPromptStep<ICreateServiceContext>[] = [
        new ResourceGroupListStep(),
        new InputServiceNameStep(),
        new InputServiceKindStep(),
        new InputServiceSkuTierStep(),
        new InputSerivceSkuUnitCountStep(),
    ];

    const subContext = createSubscriptionContext(subscription);
    const client: WebPubSubManagementClient = createAzureClient([context, subContext], WebPubSubManagementClient);

    const executeSteps: AzureWizardExecuteStep<ICreateServiceContext>[] = [
        new VerifyProvidersStep([webPubSubProvider]),
        // new ResourceGroupCreateStep<IWebPubSubCreationWizardContext>(),
        new CreateServiceStep(client),
    ];

    LocationListStep.addProviderForFiltering(wizardContext, webPubSubProvider, webPubSubId);
    LocationListStep.addStep(wizardContext, promptSteps);

    const wizard: AzureWizard<ICreateServiceContext> = new AzureWizard(wizardContext, {
        title,
        promptSteps,
        executeSteps,
        showLoadingPrompt: true
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('createWebPubSub', 'Create Azure Web PubSub "{0}"', wizardContext.webPubSubName);
    await wizard.execute();
    ext.branchDataProvider.refresh();

    const message = "\
Successfully created Web PubSub resource. \
You will need to: \
1. Create a hub and configure its settings. \
2. Start local tunnel or other tool to enable deployment or test. \n\
Click button to create and configure a hub.";
    vscode.window.showInformationMessage(
        message,
        ...["Create a hub", "Ignore"]
    ).then(async (selection) => {
        // const selectedItem = selection as string;
        // if (selectedItem !== "Ignore") {
        //     createHub(context, )
        //     vscode.window.showInformationMessage(`Create event handler for ${hub.hubName}`);
        // }
    });
}
