/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import { ServiceItem } from "../../../tree/service/ServiceItem";
import { createActivityContext } from "../../../utils";
import { localize } from "../../../utils/localize";
import { pickService } from "../../../utils/pickitem/pickService";
import { IPickServiceContext } from "../../common/IPickServiceContext";
import { RestartWebPubSubConfirmationStep } from "./RestartWebPubSubConfirmationStep";
import { RestartWebPubSubStep } from "./RestartWebPubSubStep";

export async function restartWebPubSub(context: IActionContext, node?: ServiceItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickService(context, {
        title: localize('deleteWebPubSub', 'Delete Web PubSub'),
    });

    const wizardContext: IPickServiceContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        resourceGroupName: webPubSub.resourceGroup,
        webPubSubName: webPubSub.name
    };

    const wizard: AzureWizard<IPickServiceContext> = new AzureWizard(wizardContext, {
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
