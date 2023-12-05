import { WebPubSubHubProperties } from "@azure/arm-webpubsub";
import { TreeElementBase, createGenericElement } from "@microsoft/vscode-azext-utils";
import { ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import * as vscode from 'vscode';
import { ThemeIcon } from "vscode";
import { localize } from "../../../utils/localize";
import { HubItem } from "../HubItem";
import { EventHandlersItem } from "./EventHandlersItem";
import { EventListenersItem } from "./EventListenersItem";


export class HubSettingItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubHubSettingItem';
    static readonly contextValueRegExp: RegExp = new RegExp(HubSettingItem.contextValue);

    constructor(public readonly hubSettings: WebPubSubHubProperties, public readonly hubItem: HubItem) { }

    viewProperties: ViewPropertiesModel = { data: this.hubSettings, label: "Event Listeners" };

    private get contextValue(): string {
        const values: string[] = [];

        // values.push(nonNullValueAndProp(this.webPubSub, 'name'));

        // values.push(HubSettingItem.contextValue);
        return "";
    }

    async getChildren(): Promise<TreeElementBase[]> {
        const result: TreeElementBase[] = [];
        const element = createGenericElement({
            label: localize('allowAnnoyClients', 'Anonymous Clients Permission'),
            description: this.hubSettings.anonymousConnectPolicy,
            contextValue: "hubAllowAnnoymousClients",
            iconPath: new ThemeIcon(this.hubSettings.anonymousConnectPolicy === "allow" ? "check" : "error"),
        })
        result.push(element);
        result.push(new EventHandlersItem(this.hubSettings.eventHandlers ?? [], this.hubItem));
        result.push(new EventListenersItem(this.hubSettings.eventListeners ?? []));
        return result;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: "Hub Settings",
            iconPath: new ThemeIcon("settings-gear"),
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        };
    }
}
