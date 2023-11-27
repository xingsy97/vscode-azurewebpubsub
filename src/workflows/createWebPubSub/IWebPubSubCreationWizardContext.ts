// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Sku } from "@azure/arm-webpubsub";
import { IResourceGroupWizardContext } from '@microsoft/vscode-azext-azureutils';
import { ExecuteActivityContext } from "@microsoft/vscode-azext-utils";

export interface IWebPubSubCreationWizardContext extends IResourceGroupWizardContext, ExecuteActivityContext {
    webPubSubName?: string;
    Sku?: Sku;
    location?: string;
    // newDeployment?: EnhancedDeployment;
}
