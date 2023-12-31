/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, IActionContext, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import { AzureSubscription } from "@microsoft/vscode-azureresources-api";
import { ext } from "../../../extensionVariables";
import { WebPubSubModel } from "../../../tree/models";
import * as utils from "../../../utils";
import { createActivityContext } from "../../../utils";
import { localize } from "../../../utils/localize";
import { pickService } from "../../../utils/pickitem/pickService";
import { CreateHubStep } from "./CreateHubStep";
import { ICreateHubContext } from "./ICreateHubContext";
import { InputHubNameStep } from "./InputHubNameStep";

export async function createHub(context: IActionContext, node?: { subscription: AzureSubscription, webPubSub: WebPubSubModel }): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickService(context, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub'),
    });

    const subContext = createSubscriptionContext(subscription);
    const wizardContext: ICreateHubContext = {
        ...context,
        ...await createActivityContext(),
        subscription: subContext,
        resourceGroupName: webPubSub.resourceGroup,
        webPubSubResourceName: webPubSub.name,
        hubSetting: {
            properties: {}
        }
    };

    const client = createAzureClient([context, subContext], WebPubSubManagementClient);

    const wizard: AzureWizard<ICreateHubContext> = new AzureWizard(wizardContext, {
        title: localize('createWebPubSubHub', 'Create New Hub In "{0}"', webPubSub.name),
        promptSteps: [new InputHubNameStep()],
        executeSteps: [new CreateHubStep(client)]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('createWebPubSubHub', 'Create New Web PubSub Hub "{0}"', wizardContext.hubName);

    await ext.state.runWithTemporaryDescription(webPubSub.id, `Creating Hub...`, async () => {
        await wizard.execute();
    });
    ext.branchDataProvider.refresh();
}
