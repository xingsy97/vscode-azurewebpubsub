// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { AzureWizardExecuteStep } from "@microsoft/vscode-azext-utils";
import { Progress } from "vscode";
import { localize, nonNullProp } from "../../utils";
import { IWebPubSubCreationWizardContext } from "./IWebPubSubCreationWizardContext";

export class CreateWebPubSubStep extends AzureWizardExecuteStep<IWebPubSubCreationWizardContext> {
    public priority: number = 135;
    private readonly client: WebPubSubManagementClient;

    constructor(client: WebPubSubManagementClient) {
        super();
        this.client = client;
    }

    public async execute(context: IWebPubSubCreationWizardContext, progress: Progress<{ message?: string; increment?: number }>): Promise<void> {
        const message: string = localize('creatingNewWebPubSub', 'Creating new WebPubSub "{0}"...', context.webPubSubName);
        progress.report({ message });
        const webPubSubName: string = nonNullProp(context, 'webPubSubName');
        const response = await this.client.webPubSub.beginCreateOrUpdateAndWait(
            context.resourceGroup?.name as string,
            webPubSubName as string,
            {
                sku: context.Sku?.sku,
                location: context.location ?? context.resourceGroup?.location,
            }
        );
    }

    public shouldExecute(context: IWebPubSubCreationWizardContext): boolean {
        return true;
    }
}
