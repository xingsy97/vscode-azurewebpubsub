/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { createAzureClient } from "@microsoft/vscode-azext-azureutils";
import  { type IActionContext} from "@microsoft/vscode-azext-utils";
import { AzureWizard, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import { HubsItem } from "../../../tree/hub/HubsItem";
import { pickHubs } from "../../../tree/pickitem/pickHubs";
import  { type ServiceItem } from "../../../tree/service/ServiceItem";
import * as utils from "../../../utils";
import { createActivityContext, localize } from "../../../utils";
import { CreateOrUpdateHubSettingStep } from "../common/CreateOrUpdateHubSettingStep";
import  { type ICreateOrUpdateHubSettingContext } from "./ICreateEventHandlerContext";
import { InputHubSettingStep } from "./InputHubSettingStep";

export async function createHubSetting(context: IActionContext, node?: HubsItem | ServiceItem): Promise<void> {
    node = node ? node : await pickHubs(context);
    const service: ServiceItem = node instanceof HubsItem ? node.service : node.hubs.service;

    const subContext = createSubscriptionContext(service.subscription);
    const wizardContext: ICreateOrUpdateHubSettingContext = {
        ...context,
        ...await createActivityContext(),
        subscription: subContext,
        resourceGroupName: service.resourceGroup,
        webPubSubName: service.name,
        hubProperties: {
            eventHandlers: [],
            eventListeners: []
        },
    };

    const client = createAzureClient([context, subContext], WebPubSubManagementClient);

    const wizard: AzureWizard<ICreateOrUpdateHubSettingContext> = new AzureWizard(wizardContext, {
        title: localize('createHubSetting', `Create Hub Setting`),
        promptSteps: [new InputHubSettingStep()],
        executeSteps: [new CreateOrUpdateHubSettingStep(client)]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('createHubSetting', `Create Hub Setting ${wizardContext.hubName}`);
    await ext.state.runWithTemporaryDescription(service.id, `Creating Hub Setting...`, async () => {
        await wizard.execute();
    });
    ext.branchDataProvider.refresh();
}
