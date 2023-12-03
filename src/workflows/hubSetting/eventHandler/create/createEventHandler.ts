/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, IActionContext, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../../extensionVariables";
import { HubItem } from "../../../../tree/hub/HubItem";
import { EventHandlersItem } from "../../../../tree/hub/properties/EventHandlersItem";
import { ServiceItem } from "../../../../tree/service/ServiceItem";
import * as utils from "../../../../utils";
import { createActivityContext } from "../../../../utils";
import { localize } from "../../../../utils/localize";
import { pickHub } from "../../../../utils/pickitem/pickHub";
import { CreateEventHandlerStep } from "./CreateEventHandlerStep";
import { ICreateEventHandlerContext } from "./ICreateEventHandlerContext";
import { InputUrlTemplateStep } from "./InputUrlTemplateStep";
import { InputUserEventsStep } from "./InputUserEventsStep";
import { SelectSystemEventsStep } from "./SelectSystemEventsStep";

export async function createEventHandler(context: IActionContext, node?: HubItem | EventHandlersItem): Promise<void> {
    let serivce: ServiceItem, hub: HubItem;
    if (node instanceof HubItem) hub = node;
    if (node instanceof EventHandlersItem) hub = node.hubItem;
    if (!node) hub = await pickHub(context);
    serivce = hub!.service;

    const subContext = createSubscriptionContext(serivce.subscription);
    const wizardContext: ICreateEventHandlerContext = {
        ...context,
        ...await createActivityContext(),
        subscription: subContext,
        resourceGroupName: serivce.resourceGroup,
        webPubSubResourceName: serivce.name,
        hubName: hub!.hubName,
        hubProperties: hub!.hub.properties,
        eventHandler: {
            urlTemplate: "",
            systemEvents: [],
            userEventPattern: "",
            auth: { type: "None", managedIdentity: { resource: "" } }
        }
    };

    const client = createAzureClient([context, subContext], WebPubSubManagementClient);

    const wizard: AzureWizard<ICreateEventHandlerContext> = new AzureWizard(wizardContext, {
        title: localize('createEventHandler', `Create New Event Handler In ${hub!.hubName}`),
        promptSteps: [
            new InputUrlTemplateStep(),
            new SelectSystemEventsStep(),
            new InputUserEventsStep()
        ],
        executeSteps: [new CreateEventHandlerStep(client)]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('createEventHandler', `Create New Event Handler In Hub ${hub!.hubName}`);
    await ext.state.runWithTemporaryDescription(hub!.id, `Creating Event Handler...`, async () => {
        await wizard.execute();
    });
    ext.branchDataProvider.refresh(hub!);
}
