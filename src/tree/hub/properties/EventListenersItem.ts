import { EventListener } from "@azure/arm-webpubsub";
import { TreeElementBase, createContextValue } from "@microsoft/vscode-azext-utils";
import { ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import * as vscode from 'vscode';
import { ThemeIcon } from "vscode";
import { EventListenerItem } from "./EventListenerItem";


export class EventListenersItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubHubEventListenersItem';
    static readonly contextValueRegExp: RegExp = new RegExp(EventListenersItem.contextValue);

    constructor(public readonly eventListeners: EventListener[]) { }

    viewProperties: ViewPropertiesModel = {
        data: this.eventListeners,
        label: "Event Listeners"
    };

    private get contextValue(): string {
        const values: string[] = [];
        values.push(EventListenersItem.contextValue);
        return createContextValue(values);
    }

    private get description(): string {
        return `${this.eventListeners.length} Listeners`;
    }

    private get collapsibleState(): vscode.TreeItemCollapsibleState {
        return this.eventListeners.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None;
    }

    async getChildren(): Promise<EventListenerItem[]> {
        const result: EventListenerItem[] = [];
        for (let i = 0; i < this.eventListeners.length; i++) {
            result.push(new EventListenerItem(this.eventListeners[i], i));
        }
        return result;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: "Event Listeners",
            iconPath: new ThemeIcon("list-ordered"),
            contextValue: this.contextValue,
            collapsibleState: this.collapsibleState,
            description: this.description
        };
    }
}
