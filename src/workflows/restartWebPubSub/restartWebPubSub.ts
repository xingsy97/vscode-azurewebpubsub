/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { WebPubSubItem } from "src/tree/WebPubSubItem";
import { pickWebPubSub } from "src/utils/pickitem/pickWebPubSub";
import { ext } from "../../extensionVariables";
import { createActivityContext } from "../../utils";
import { localize } from "../../utils/localize";
import { IRestartWebPubSubContext } from "./IRestartWebPubSubContext";
import { RestartWebPubSubConfirmationStep } from "./RestartWebPubSubConfirmationStep";
import { RestartWebPubSubStep } from "./RestartWebPubSubStep";

export async function restartWebPubSub(context: IActionContext, node?: WebPubSubItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickWebPubSub(context, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub'),
    });

    const wizardContext: IRestartWebPubSubContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        resourceGroupName: webPubSub.resourceGroup,
        webPubSubName: webPubSub.name
    };

    const wizard: AzureWizard<IRestartWebPubSubContext> = new AzureWizard(wizardContext, {
        title: localize('restartWebPubSub', 'Restart Web PubSub "{0}"', webPubSub.name),
        promptSteps: [new RestartWebPubSubConfirmationStep()],
        executeSteps: [new RestartWebPubSubStep()]
    });

    await wizard.prompt();

    await ext.state.runWithTemporaryDescription(webPubSub.id, "Restarting...", async () => {
        await wizard.execute();
    });

    ext.branchDataProvider.refresh();
}
