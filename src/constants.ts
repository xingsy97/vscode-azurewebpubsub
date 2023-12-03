/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

export const webPubSubId = 'WebPubSub';
export const webPubSubProvider: string = 'Microsoft.SignalRService';
export const vscodeFolder: string = '.vscode';
export const settingsFile: string = 'settings.json';
export const relativeSettingsFilePath: string = `${vscodeFolder}/${settingsFile}`;
export const tierToUnitCountList = {
    "Free": [1],
    "Standard": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    "Premium": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
};

export enum KnownSystemEvents { "connect" = "connect", "connected" = "connected", "disconnected" = "disconnected", }
export enum KnownUserEvents { "None" = "None", "All" = "All", "Specify" = "Specify" }

export const eventHandlerSystemEvents = [KnownSystemEvents.connect, KnownSystemEvents.connected, KnownSystemEvents.disconnected];
export const eventHandlerUserEvents = [KnownUserEvents.None, KnownUserEvents.All, KnownUserEvents.Specify];
