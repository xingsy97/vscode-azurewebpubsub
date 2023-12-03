/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { EventHandler, WebPubSubHubProperties } from "@azure/arm-webpubsub";
import { IPickHubContext } from "../../../common/IPickHubContext";

export interface ICreateEventHandlerContext extends IPickHubContext {
    eventHandler: EventHandler;
    hubProperties: WebPubSubHubProperties;
}
