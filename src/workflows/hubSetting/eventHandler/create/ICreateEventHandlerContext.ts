/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { EventHandler, WebPubSubHubProperties } from "@azure/arm-webpubsub";
import { IPickHubSettingContext } from "src/workflows/common/contexts";

export interface ICreateEventHandlerContext extends IPickHubSettingContext {
    eventHandler: EventHandler;
    hubProperties: WebPubSubHubProperties;
}
