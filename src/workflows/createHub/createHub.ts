// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, IActionContext, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import { AzureSubscription } from "@microsoft/vscode-azureresources-api";
import { WebPubSubModel } from "../../tree";
import * as utils from "../../utils";
import { createActivityContext } from "../../utils";
import { localize } from "../../utils/localize";
import { pickWebPubSub } from "../../utils/pickitem/ItemPicker";
import { CreateHubStep } from "./CreateHubStep";
import { ICreateHubContext } from "./ICreateHubWizardContext";
import { InputHubNameStep } from "./InputHubNameStep";

export async function createHub(context: IActionContext, node?: { subscription: AzureSubscription, webPubSub: WebPubSubModel }): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickWebPubSub(context, {
        title: localize('createHub', 'Create Web PubSub Hub'),
    });

    const subContext = createSubscriptionContext(subscription);
    const wizardContext: ICreateHubContext = {
        ...context,
        ...await createActivityContext(),
        subscription: subContext,
        resourceGroupName: webPubSub.resourceGroup,
    };

    const client = createAzureClient([context, subContext], WebPubSubManagementClient);

    const wizard: AzureWizard<ICreateHubContext> = new AzureWizard(wizardContext, {
        title: localize('createWebPubSubHub', 'Create Web PubSub Hub "{0}"', webPubSub.name),
        promptSteps: [new InputHubNameStep()],
        executeSteps: [new CreateHubStep(client)]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('createWebPubSubHub', 'Create Web PubSub Hub "{0}"', wizardContext.hubName);
    await wizard.execute();
}
