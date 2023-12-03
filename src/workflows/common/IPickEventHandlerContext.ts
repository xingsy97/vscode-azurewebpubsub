/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { EventHandler } from "@azure/arm-webpubsub";
import { IPickHubContext } from "./IPickHubContext";

export interface IPickEventHandlerContext extends IPickHubContext {
    eventHandlerSetting: EventHandler;
}
