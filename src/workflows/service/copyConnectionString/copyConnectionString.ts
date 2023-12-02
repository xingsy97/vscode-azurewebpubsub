/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../../../extensionVariables";
import { ServiceItem } from "../../../tree/service/ServiceItem";
import * as utils from "../../../utils";
import { createActivityContext } from "../../../utils";
import { localize } from "../../../utils/localize";
import { pickService } from "../../../utils/pickitem/pickService";
import { IPickServiceContext } from "../../common/IPickServiceContext";
import { CopyConnectionStringStep } from "./CopyConnectionStringStep";

export async function copyServiceConnectionString(context: IActionContext, node?: ServiceItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickService(context, {
        title: localize('copyConnectionString', 'Copy Connection String'),
    });

    const wizardContext: IPickServiceContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        webPubSubName: webPubSub.name,
        resourceGroupName: webPubSub.resourceGroup
    };

    const wizard: AzureWizard<IPickServiceContext> = new AzureWizard(wizardContext, {
        title: localize('copyConnectionString', 'Copy Connection String of "{0}"', webPubSub.name),
        promptSteps: [],
        executeSteps: [new CopyConnectionStringStep()]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('copyConnectionString', 'Copy Connection String of "{0}"', wizardContext.webPubSubName);
    await ext.state.runWithTemporaryDescription(webPubSub.id, "Retrieving Keys...", async () => {
        await wizard.execute();
    });

    // ext.branchDataProvider.refresh();
}
