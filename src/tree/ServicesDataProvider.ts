import  { type IActionContext, type TreeElementBase} from "@microsoft/vscode-azext-utils";
import { callWithTelemetryAndErrorHandling, nonNullProp } from "@microsoft/vscode-azext-utils";
import  { type AzureResource, type AzureResourceBranchDataProvider } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { ext } from "../../extension.bundle";
import { ServiceItem } from "./service/ServiceItem";


export class ServicesDataProvider extends vscode.Disposable implements AzureResourceBranchDataProvider<TreeElementBase> {
    private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<TreeElementBase | undefined>();

    constructor() {
        super(
            () => {
                this.onDidChangeTreeDataEmitter.dispose();
            });
    }

    get onDidChangeTreeData(): vscode.Event<TreeElementBase | undefined> {
        return this.onDidChangeTreeDataEmitter.event;
    }

    async getChildren(element: TreeElementBase): Promise<TreeElementBase[] | null | undefined> {
        return (await element.getChildren?.())?.map((child) => {
            if (child.id) {
                return ext.state.wrapItemInStateHandling(child as TreeElementBase & { id: string; }, () => this.refresh(child));
            }
            return child;
        });
    }

    async getResourceItem(element: AzureResource): Promise<TreeElementBase> {
        const resourceItem = await callWithTelemetryAndErrorHandling(
            'getResourceItem',
            async (context: IActionContext) => {
                context.errorHandling.rethrow = true;
                const webPubSub = await ServiceItem.Get(context, element.subscription, nonNullProp(element, 'resourceGroup'), element.name);
                return new ServiceItem(element.subscription, element, webPubSub);
            });

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return ext.state.wrapItemInStateHandling(resourceItem!, () => this.refresh(resourceItem));
    }

    async getTreeItem(element: TreeElementBase): Promise<vscode.TreeItem> {
        const ti = await element.getTreeItem();
        return ti;
    }

    refresh(element?: TreeElementBase): void {
        this.onDidChangeTreeDataEmitter.fire(element);
    }
}
export const branchDataProvider = new ServicesDataProvider();

