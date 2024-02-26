import  { type IActionContext, type TreeElementBase} from "@microsoft/vscode-azext-utils";
import { AzureWizard, DeleteConfirmationStep, createContextValue, createGenericElement, createSubscriptionContext, nonNullValueAndProp } from "@microsoft/vscode-azext-utils";
import  { type AzureSubscription} from '@microsoft/vscode-azureresources-api';
import { type ViewPropertiesModel } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { ThemeIcon } from "vscode";
import { ext } from "../../../extension.bundle";
import { createActivityContext, createPortalUrl, createWebPubSubHubsClient, localize } from '../../utils';
import  { type IDeleteHubSettingContext } from "../../workflows/hubSetting/delete/IDeleteHubContext";
import { DeleteServiceStep } from "../../workflows/service/delete/DeleteServiceStep";
import  { type WebPubSubHubModel } from "../models";
import { CreateWebPubSubHubModel } from "../models";
import  { type ServiceItem } from "../service/ServiceItem";
import { EventHandlersItem } from "./properties/EventHandlersItem";
import { EventListenersItem } from "./properties/EventListenersItem";

export class HubItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubHubItem';
    static readonly contextValueRegExp: RegExp = new RegExp(HubItem.contextValue);

    public hubName: string;
    id: string;

    constructor(public readonly service: ServiceItem, public readonly hub: WebPubSubHubModel) {
        this.id = this.hub.id;
        this.hubName = this.hub.hubName;
    }

    viewProperties: ViewPropertiesModel = {
        data: this.hub,
        label: `${this.hub.hubName}`,
    };

    portalUrl: vscode.Uri = createPortalUrl(this.service.subscription, this.hub.id);

    private get contextValue(): string {
        const values: string[] = [HubItem.contextValue];

        // Enable more granular tree item filtering by container app name
        values.push(nonNullValueAndProp(this.hub, 'hubName'));

        // values.push(this.webPubSubHub.revisionsMode === KnownActiveRevisionsMode.Single ? revisionModeSingleContextValue : revisionModeMultipleContextValue);
        // values.push(this.hasUnsavedChanges() ? unsavedChangesTrueContextValue : unsavedChangesFalseContextValue);
        return createContextValue(values);
    }

    private get description(): string | undefined {
        return undefined;
    }

    async getChildren(): Promise<TreeElementBase[]> {
        const result: TreeElementBase[] = [];
        const isAllowAnnoy: boolean = this.hub.properties.anonymousConnectPolicy === "allow";
        const element = createGenericElement({
            label: localize('allowAnnoyClients', `${isAllowAnnoy ? "Allow" : "Deny"} Anonymous Clients`),

            contextValue: "hubAllowAnnoymousClients",
            iconPath: new ThemeIcon(isAllowAnnoy ? "check" : "error"),
        })
        result.push(element);
        result.push(new EventHandlersItem(this.hub.properties.eventHandlers ?? [], this));
        result.push(new EventListenersItem(this.hub.properties.eventListeners ?? []));
        return result;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            id: this.id,
            label: `${this.hub.hubName}`,
            iconPath: new ThemeIcon("inbox"),
            contextValue: this.contextValue,
            description: this.description,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            tooltip: `Hub ${this.hub.hubName}`
        };
    }

    static isHubItem(item: unknown): item is HubItem {
        return typeof item === 'object' &&
            typeof (item as HubItem).contextValue === 'string' &&
            HubItem.contextValueRegExp.test((item as HubItem).contextValue);
    }

    // static async List(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubId: string): Promise<WebPubSubHubModel[]> {
    //     const subContext = createSubscriptionContext(subscription);
    //     const client = await createWebPubSubHubsAPIClient([context, subContext]);
    //     const hubs = client.webPubSubHubs.list(resourceGroup, resourceName);
    //     const hubsIter = await uiUtils.listAllIterator(hubs);
    //     return hubsIter.filter(hub => hub.id && hub.id.includes(webPubSubId))
    //         .map(HubItem.CreateWebPubSubHubModel);
    // }

    static async Get(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubHubName: string): Promise<WebPubSubHubModel> {
        const client = await createWebPubSubHubsClient(context, subscription);
        return CreateWebPubSubHubModel(await client.webPubSubHubs.get(webPubSubHubName, resourceGroup, resourceName));
    }

    async delete(context: IActionContext & { suppressPrompt?: boolean; }): Promise<void> {
        const confirmMessage: string = localize('confirmDeleteWebPubSubHub', 'Are you sure you want to delete hub "{0}"?', this.hubName);
        const deleteHub: string = localize('deleteWebPubSubHub', 'Delete hub "{0}"', this.hubName);

        const wizardContext: IDeleteHubSettingContext = {
            activityTitle: deleteHub,
            webPubSubResourceName: this.hub.webPubSubId,
            subscription: createSubscriptionContext(this.service.subscription),
            resourceGroupName: this.hub.resourceGroup,
            ...context,
            ...await createActivityContext()
        };

        const wizard: AzureWizard<IDeleteHubSettingContext> = new AzureWizard(wizardContext, {
            promptSteps: [new DeleteConfirmationStep(confirmMessage)],
            executeSteps: [new DeleteServiceStep()]
        });

        if (!context.suppressPrompt) {
            await wizard.prompt();
        }

        await ext.state.showDeleting(this.hub.id, async () => {
            await wizard.execute();
        });
        ext.state.notifyChildrenChanged(this.hub.webPubSubId);
    }
}
