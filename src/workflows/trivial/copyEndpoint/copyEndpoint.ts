/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import { WebPubSubItem } from "../../../tree/WebPubSubItem";
import * as utils from "../../../utils";
import { createActivityContext } from "../../../utils";
import { localize } from "../../../utils/localize";
import { pickWebPubSub } from "../../../utils/pickitem/pickWebPubSub";
import { IPickWebPubSubContext } from "../../common/IPickWebPubSubContext";
import { CopyEndpointStep } from "./CopyEndpointStep";

export async function copyEndpoint(context: IActionContext, node?: WebPubSubItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickWebPubSub(context, {
        title: localize('copyEndpoint', 'Copy Endpoint'),
    });

    const wizardContext: IPickWebPubSubContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        webPubSubName: webPubSub.name,
        resourceGroupName: webPubSub.resourceGroup
    };

    const wizard: AzureWizard<IPickWebPubSubContext> = new AzureWizard(wizardContext, {
        title: localize('copyEndpoint', 'Copy Endpoint of "{0}"', webPubSub.name),
        promptSteps: [],
        executeSteps: [new CopyEndpointStep()]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('copyEndpoint', 'Copy Endpoint of "{0}"', wizardContext.webPubSubName);
    await ext.state.runWithTemporaryDescription(webPubSub.id, "Retrieving Endpoint...", async () => {
        await wizard.execute();
    });

    // ext.branchDataProvider.refresh();
}
