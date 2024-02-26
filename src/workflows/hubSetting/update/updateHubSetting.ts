/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/


import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import  { type HubItem } from "../../../tree/hub/HubItem";
import { pickHub } from "../../../tree/pickitem/pickHub";
import * as utils from "../../../utils";
import { createActivityContext, localize } from "../../../utils";
import { CreateOrUpdateHubSettingStep } from "../common/CreateOrUpdateHubSettingStep";
import  { type ICreateOrUpdateHubSettingContext } from "../create/ICreateEventHandlerContext";

export async function updateHubSetting(context: IActionContext, node?: HubItem): Promise<void> {
    const { service, hub: webPubSubHub } = node ?? await pickHub(context, {
        title: localize('updateHubSetting', 'Update Web PubSub Hub Setting'),
    });

    const subContext = createSubscriptionContext(service.subscription);
    const wizardContext: ICreateOrUpdateHubSettingContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(service.subscription),
        resourceGroupName: webPubSubHub.resourceGroup,
        hubName: webPubSubHub.hubName,
        hubProperties: webPubSubHub.properties
    };

    const client = createAzureClient([context, subContext], WebPubSubManagementClient);

    const wizard: AzureWizard<ICreateOrUpdateHubSettingContext> = new AzureWizard(wizardContext, {
        title: localize('updateHubSetting', 'Update Hub Setting "{0}"', webPubSubHub.hubName),
        executeSteps: [new CreateOrUpdateHubSettingStep(client)]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('updateHubSetting', 'Updating Web PubSub Hub Setting "{0}"', wizardContext.hubName);
    await ext.state.runWithTemporaryDescription(webPubSubHub.id, `Updating Web PubSub Hub Setting "${wizardContext.hubName}"...`, async () => {
        await wizard.execute();
    });

    ext.branchDataProvider.refresh();
}
