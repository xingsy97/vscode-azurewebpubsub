/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import  { type WebPubSubHubProperties } from "@azure/arm-webpubsub";
import  { type IPickServiceContext } from "src/workflows/common/contexts";

export interface ICreateOrUpdateHubSettingContext extends IPickServiceContext {
    hubName?: string;
    hubProperties?: WebPubSubHubProperties;
}
