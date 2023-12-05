/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { createAzureClient } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, IActionContext, createSubscriptionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { ext } from "../../../extensionVariables";
import { HubsItem } from "../../../tree/hub/HubsItem";
import { ServiceItem } from "../../../tree/service/ServiceItem";
import * as utils from "../../../utils";
import { createActivityContext } from "../../../utils";
import { localize } from "../../../utils/localize";
import { pickService } from "../../../utils/pickitem/pickService";
import { createEventHandler } from "../../hubSetting/eventHandler/create/createEventHandler";
import { CreateHubStep } from "./CreateHubStep";
import { ICreateHubContext } from "./ICreateHubContext";
import { InputHubNameStep } from "./InputHubNameStep";

export async function createHub(context: IActionContext, node?: HubsItem | ServiceItem): Promise<void> {
    let serviceItem: ServiceItem;
    if (node) {
        serviceItem = node instanceof HubsItem ? node.service : node;
    }
    else {
        serviceItem = await pickService(context, { title: localize('deleteWebPubSub', 'Delete Web PubSub Hub'), });
    }

    const subContext = createSubscriptionContext(serviceItem.subscription);
    const wizardContext: ICreateHubContext = {
        ...context,
        ...await createActivityContext(),
        subscription: subContext,
        resourceGroupName: serviceItem.resourceGroup,
        webPubSubResourceName: serviceItem.name,
        hubSetting: {
            properties: {}
        }
    };

    const client = createAzureClient([context, subContext], WebPubSubManagementClient);

    const wizard: AzureWizard<ICreateHubContext> = new AzureWizard(wizardContext, {
        title: localize('createWebPubSubHub', 'Create New Hub In "{0}"', serviceItem.name),
        promptSteps: [new InputHubNameStep()],
        executeSteps: [new CreateHubStep(client)]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('createWebPubSubHub', 'Create New Web PubSub Hub "{0}"', wizardContext.hubName);

    await ext.state.runWithTemporaryDescription(serviceItem.id, `Creating Hub...`, async () => {
        await wizard.execute();
    });
    ext.branchDataProvider.refresh();

    vscode.window.showInformationMessage(
        `Successfully create a Hub ${wizardContext.hubName} in Web PubSub service ${serviceItem.name}. You need to create a event handler or event listner to make it work. Click button below to create a new event handler in the hub. `,
        ...["Create a event handler", "Ignore"]
    ).then(async (selection) => {
        const selectedItem = selection as string;
        if (selectedItem !== "Ignore") {
            const hubs = await serviceItem.hubs.getChildren();
            if (hubs.length === 0) throw new Error("No hub found");
            const hub = hubs[hubs.length - 1];
            vscode.window.showInformationMessage(`Create event handler for ${hub.hubName}`);
            createEventHandler(context, hub);
        }
    });
}
