import { EventHandler } from "@azure/arm-webpubsub";
import { TreeElementBase, createContextValue } from "@microsoft/vscode-azext-utils";
import { ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import * as vscode from 'vscode';
import { ThemeIcon } from "vscode";
import { EventHandlerItem } from "./EventHandlerItem";


export class EventHandlersItem implements TreeElementBase {
    static readonly contextValue: string = 'eventHandlersItem';
    static readonly contextValueRegExp: RegExp = new RegExp(EventHandlersItem.contextValue);

    constructor(public readonly eventHandlers: EventHandler[]) { }

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
            result.push(new EventHandlerItem(this.eventHandlers[i], i + 1));
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
