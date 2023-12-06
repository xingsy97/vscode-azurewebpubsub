/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { WebPubSubManagementClient } from "@azure/arm-webpubsub";
import { AzureWizardExecuteStep } from "@microsoft/vscode-azext-utils";
import { Progress } from "vscode";
import { localize, nonNullProp } from "../../../utils";
import { ICreateServiceContext } from "./ICreateServiceContext";

export class CreateServiceStep extends AzureWizardExecuteStep<ICreateServiceContext> {
    public priority: number = 135;
    private readonly client: WebPubSubManagementClient;

    constructor(client: WebPubSubManagementClient) {
        super();
        this.client = client;
    }

    public async execute(context: ICreateServiceContext, progress: Progress<{ message?: string; increment?: number }>): Promise<void> {
        const message: string = localize('creatingNewWebPubSub', 'Creating new resource "{0}"...', context.webPubSubName);
        progress.report({ message });
        const webPubSubName: string = nonNullProp(context, 'webPubSubName');
        const response = await this.client.webPubSub.beginCreateOrUpdateAndWait(
            context.resourceGroup?.name as string,
            webPubSubName as string,
            {
                sku: context.Sku?.sku,
                kind: context.kind,
                location: context.location!
            }
        );
    }

    public shouldExecute(context: ICreateServiceContext): boolean {
        return true;
    }
}
