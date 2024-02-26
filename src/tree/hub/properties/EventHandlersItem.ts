import  { type EventHandler } from "@azure/arm-webpubsub";
import  { type TreeElementBase} from "@microsoft/vscode-azext-utils";
import { createContextValue } from "@microsoft/vscode-azext-utils";
import  { type ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import * as vscode from 'vscode';
import { ThemeIcon } from "vscode";
import  { type HubItem } from "../HubItem";
import { EventHandlerItem } from "./EventHandlerItem";


export class EventHandlersItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubHubEventHandlersItem';
    static readonly contextValueRegExp: RegExp = new RegExp(EventHandlersItem.contextValue);

    constructor(public readonly eventHandlers: EventHandler[], public readonly hubItem: HubItem) { }

    viewProperties: ViewPropertiesModel = {
        data: this.eventHandlers,
        label: "Event Handlers"
    };

    private get contextValue(): string {
        const values: string[] = [];
        values.push(EventHandlersItem.contextValue);
        return createContextValue(values);
    }

    private get collapsibleState(): vscode.TreeItemCollapsibleState {
        return this.eventHandlers.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None;
    }

    private get description(): string {
        return `${this.eventHandlers.length} Handlers`;
    }

    async getChildren(): Promise<TreeElementBase[]> {
        const result: EventHandlerItem[] = [];
        for (let i = 0; i < this.eventHandlers.length; i++) {
            result.push(new EventHandlerItem(this, this.eventHandlers[i], i));
        }
        return result;

    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: "Event Handlers",
            iconPath: new ThemeIcon("list-ordered"),
            contextValue: this.contextValue,
            collapsibleState: this.collapsibleState,
            description: this.description,
        };
    }
}
