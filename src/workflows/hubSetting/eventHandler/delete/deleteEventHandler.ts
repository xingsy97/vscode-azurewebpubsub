/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, IActionContext, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../../extensionVariables";
import { EventHandlerItem } from "../../../../tree/hub/properties/EventHandlerItem";
import { pickEventHandler } from "../../../../tree/pickitem/pickEventHandler";
import * as utils from "../../../../utils";
import { createActivityContext, localize } from "../../../../utils";
import { DeleteEventHandlerStep } from "./DeleteEventHandlerStep";
import { IDeleteEventHandlerContext } from "./IDeleteEventHandlerContext";

export async function deleteEventHandler(context: IActionContext, node?: EventHandlerItem): Promise<void> {
    const eventHandler: EventHandlerItem = node ? node : await pickEventHandler(context);

    const hubItem = eventHandler!.eventHandlersItem.hubItem;
    const serviceItem = hubItem.service;
    const order = eventHandler!.indexInHub;

    const subContext = createSubscriptionContext(serviceItem.subscription);
    const wizardContext: IDeleteEventHandlerContext = {
        ...context,
        ...await createActivityContext(),
        subscription: subContext,
        resourceGroupName: serviceItem.resourceGroup,
        webPubSubResourceName: serviceItem.name,
        hubName: hubItem.hubName,
        indexInHub: order,
        hubProperties: hubItem.hub.properties
    };

    const client = createAzureClient([context, subContext], WebPubSubManagementClient);

    const wizard: AzureWizard<IDeleteEventHandlerContext> = new AzureWizard(wizardContext, {
        title: localize('deleteEventHandler', `Delete Event Handler In ${hubItem.hubName}`),
        executeSteps: [new DeleteEventHandlerStep(client)]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('deleteEventHandler', `Delete Event Handler In Hub ${hubItem.hubName}`);
    await ext.state.runWithTemporaryDescription(hubItem.id, `Deleting Event Handler...`, async () => {
        await wizard.execute();
    });
    ext.branchDataProvider.refresh(hubItem);
}
