/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureWizard, createSubscriptionContext, type IActionContext } from "@microsoft/vscode-azext-utils";
import  { type IPickKeyContext } from "src/workflows/common/contexts";
import { pickService } from "../../../tree/pickitem/pickService";
import  { type ServiceItem } from "../../../tree/service/ServiceItem";
import * as utils from "../../../utils";
import { createActivityContext, localize } from "../../../utils";
import { GetKeyTypeStep } from "../../common/getKeyTypeStep";
import { RegenerateKeyStep } from "./RegenerateKeyStep";

export async function regenerateKey(context: IActionContext, node?: ServiceItem): Promise<void> {
    const { subscription, webPubSub } = node ?? await pickService(context, {
        title: localize('regenerateKey', 'Regenerate Key'),
    });

    const wizardContext: IPickKeyContext = {
        ...context,
        ...await createActivityContext(),
        subscription: createSubscriptionContext(subscription),
        webPubSubName: webPubSub.name,
        resourceGroupName: webPubSub.resourceGroup
    };

    const wizard = new AzureWizard(wizardContext, {
        title: localize('regenerateKey', 'Regenerate Key of "{0}"', webPubSub.name),
        promptSteps: [new GetKeyTypeStep()],
        executeSteps: [new RegenerateKeyStep()]
    });

    await wizard.prompt();
    wizardContext.activityTitle = utils.localize('regenerateKeyWithType', 'Regenerate {0} key of "{1}"', wizardContext.keyType, wizardContext.webPubSubName);
    await wizard.execute();
}
