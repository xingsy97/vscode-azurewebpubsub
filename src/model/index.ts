import { Resource, WebPubSubHub, WebPubSubManagementClient, WebPubSubResource } from "@azure/arm-webpubsub";
import { AzExtClientContext, OpenInPortalOptions, createAzureClient, getResourceGroupFromId, uiUtils } from "@microsoft/vscode-azext-azureutils";
import { AzureWizard, AzureWizardExecuteStep, DeleteConfirmationStep, ExecuteActivityContext, IActionContext, ISubscriptionContext, TreeItemIconPath, callWithTelemetryAndErrorHandling, createContextValue, createSubscriptionContext, nonNullProp, nonNullValueAndProp, parseError } from "@microsoft/vscode-azext-utils";
import { AzureResource, AzureResourceBranchDataProvider, AzureSubscription, type ResourceModelBase, type ViewPropertiesModel } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';
import { ext } from "../../extension.bundle";
import { createActivityContext } from "../utils";
import { localize } from "../utils/localize";

export interface TreeElementBase extends ResourceModelBase {
    getChildren?(): vscode.ProviderResult<TreeElementBase[]>;
    getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem>;

    viewProperties?: ViewPropertiesModel;
}

interface ResourceModel extends Resource {
    id: string;
    name: string;
    resourceGroup: string;
}

export interface WebPubSubHubModel extends WebPubSubHub {
    id: string;
    name: string;
    resourceGroup: string;
    webPubSubId: string;
}

function createAzureResourceModel<T extends Resource>(resource: T): T & ResourceModel {
    const id = nonNullProp(resource, 'id');
    return {
        id,
        name: nonNullProp(resource, 'name'),
        resourceGroup: getResourceGroupFromId(id),
        ...resource,
    }
}

export function createPortalUrl(subscription: AzureSubscription, id: string, options?: OpenInPortalOptions): vscode.Uri {
    const queryPrefix: string = (options && options.queryPrefix) ? `?${options.queryPrefix}` : '';
    const url: string = `${subscription.environment.portalUrl}/${queryPrefix}#@${subscription.tenantId}/resource${id}`;

    return vscode.Uri.parse(url);
}

type WebPubSubModel = WebPubSubResource & ResourceModel;

export async function createWebPubSubHubsAPIClient(context: AzExtClientContext): Promise<WebPubSubManagementClient> {
    return createAzureClient(context, WebPubSubManagementClient)
}

export async function createWebPubSubHubsClient(context: IActionContext, subscription: AzureSubscription): Promise<WebPubSubManagementClient> {
    return createWebPubSubHubsAPIClient([context, createSubscriptionContext(subscription)]);
}

export class WebPubSubItem implements TreeElementBase {
    static readonly contextValue: string = 'webPubSubItem';
    static readonly contextValueRegExp: RegExp = new RegExp(WebPubSubItem.contextValue);

    name: string;
    id: string;
    resourceGroup: string;

    constructor(public readonly subscription: AzureSubscription, public readonly resource: AzureResource, public readonly webPubSub: WebPubSubModel) {
        this.id = webPubSub.id;
        this.resourceGroup = webPubSub.resourceGroup;
        this.name = webPubSub.name;
    }

    private get contextValue(): string {
        const values: string[] = [];

        // Enable more granular tree item filtering by environment name
        values.push(nonNullValueAndProp(this.webPubSub, 'name'));

        values.push(WebPubSubItem.contextValue);
        return createContextValue(values);
    }

    async getChildren(): Promise<HubsItem[]> {
        const result = await callWithTelemetryAndErrorHandling('getChildren', async (context) => {
            const containerApps = await WebPubSubHubItem.List(context, this.subscription, this.resourceGroup, this.name, this.id);
            return containerApps
                .map(ca => new WebPubSubHubItem(this.subscription, ca))
                .sort((a, b) => treeUtils.sortById(a, b));
        });

        return result ?? [];
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: this.webPubSub.name,
            id: this.id,
            iconPath: treeUtils.getIconPath('azure-web-pubsub'),
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        }
    }

    static isManagedEnvironmentItem(item: unknown): item is WebPubSubItem {
        return typeof item === 'object' &&
            typeof (item as WebPubSubItem).contextValue === 'string' &&
            WebPubSubItem.contextValueRegExp.test((item as WebPubSubItem).contextValue);
    }

    static async List(context: IActionContext, subscription: AzureSubscription): Promise<WebPubSubResource[]> {
        const subContext = createSubscriptionContext(subscription);
        const client = await createWebPubSubHubsAPIClient([context, subContext]);
        return await uiUtils.listAllIterator(client.webPubSub.listBySubscription());
    }

    static async Get(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, name: string): Promise<WebPubSubModel> {
        const subContext = createSubscriptionContext(subscription);
        const client = await createWebPubSubHubsAPIClient([context, subContext]);
        return WebPubSubItem.CreateWebPubSubModel(await client.webPubSub.get(resourceGroup, name));
    }

    private static CreateWebPubSubModel(webPubSub: WebPubSubResource): WebPubSubModel {
        return createAzureResourceModel(webPubSub);
    }
}

export interface HubsItem extends TreeElementBase {
    subscription: AzureSubscription;
    webPubSubHub: WebPubSubHubModel;
}

export class HubsBranchDataProvider extends vscode.Disposable implements AzureResourceBranchDataProvider<TreeElementBase> {
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
                return ext.state.wrapItemInStateHandling(child as TreeElementBase & { id: string }, () => this.refresh(child))
            }
            return child;
        });
    }

    async getResourceItem(element: AzureResource): Promise<TreeElementBase> {
        const resourceItem = await callWithTelemetryAndErrorHandling(
            'getResourceItem',
            async (context: IActionContext) => {
                context.errorHandling.rethrow = true;
                const webPubSub = await WebPubSubItem.Get(context, element.subscription, nonNullProp(element, 'resourceGroup'), element.name);
                return new WebPubSubItem(element.subscription, element, webPubSub);
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

export const branchDataProvider = new HubsBranchDataProvider();

export class WebPubSubHubItem implements HubsItem {
    static readonly contextValue: string = 'webPubSubHubItem';
    static readonly contextValueRegExp: RegExp = new RegExp(WebPubSubHubItem.contextValue);

    id: string;

    private resourceGroup: string;
    private name: string;

    public get webPubSubHub(): WebPubSubHubModel {
        return this._webPubSubHub;
    }

    constructor(public readonly subscription: AzureSubscription, private _webPubSubHub: WebPubSubHubModel) {
        this.id = this.webPubSubHub.id;
        this.resourceGroup = this.webPubSubHub.resourceGroup;
        this.name = this.webPubSubHub.name;
    }

    viewProperties: ViewPropertiesModel = {
        data: this.webPubSubHub,
        label: this.webPubSubHub.name,
    }

    portalUrl: vscode.Uri = createPortalUrl(this.subscription, this.webPubSubHub.id);

    private get contextValue(): string {
        const values: string[] = [WebPubSubHubItem.contextValue];

        // Enable more granular tree item filtering by container app name
        values.push(nonNullValueAndProp(this.webPubSubHub, 'name'));

        // values.push(this.webPubSubHub.revisionsMode === KnownActiveRevisionsMode.Single ? revisionModeSingleContextValue : revisionModeMultipleContextValue);
        // values.push(this.hasUnsavedChanges() ? unsavedChangesTrueContextValue : unsavedChangesFalseContextValue);

        return createContextValue(values);
    }

    private get description(): string | undefined {
        // if (this.webPubSubHub.revisionsMode === KnownActiveRevisionsMode.Single && this.hasUnsavedChanges()) {
        //     return localize('unsavedChanges', 'Unsaved changes');
        // }

        // if (this.webPubSubHub.provisioningState && this.webPubSubHub.provisioningState !== 'Succeeded') {
        //     return this.webPubSubHub.provisioningState;
        // }

        return undefined;
    }

    async getChildren(): Promise<TreeElementBase[]> {
        const result = await callWithTelemetryAndErrorHandling('getChildren', async (context) => {
            const children: TreeElementBase[] = [];
            const client = createAzureClient([context, createSubscriptionContext(this.subscription)], WebPubSubManagementClient);

            // if (this.webPubSubHub.revisionsMode === KnownActiveRevisionsMode.Single) {
            //     const revision: Revision = await client.containerAppsRevisions.getRevision(this.resourceGroup, this.name, nonNullProp(this.webPubSubHub, 'latestRevisionName'));
            //     children.push(...RevisionItem.getTemplateChildren(this.subscription, this.webPubSubHub, revision));
            // } else {
            //     children.push(new RevisionsItem(this.subscription, this.webPubSubHub));
            // }
            // children.push(new ConfigurationItem(this.subscription, this.webPubSubHub));
            // children.push(new LogsGroupItem(this.subscription, this.webPubSubHub));
            return children;
        });

        return result ?? [];
    }

    getTreeItem(): vscode.TreeItem {
        return {
            id: this.id,
            label: nonNullProp(this.webPubSubHub, 'name'),
            iconPath: treeUtils.getIconPath('azure-webpubsub-hub'),
            contextValue: this.contextValue,
            description: this.description,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        }
    }

    static isContainerAppItem(item: unknown): item is WebPubSubHubItem {
        return typeof item === 'object' &&
            typeof (item as WebPubSubHubItem).contextValue === 'string' &&
            WebPubSubHubItem.contextValueRegExp.test((item as WebPubSubHubItem).contextValue);
    }

    static async List(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubId: string): Promise<WebPubSubHubModel[]> {
        const subContext = createSubscriptionContext(subscription);
        const client = await createWebPubSubHubsAPIClient([context, subContext]);
        return (await uiUtils.listAllIterator(client.webPubSubHubs.list(resourceGroup, resourceName)))
            .filter(hub => hub.id && hub.id === webPubSubId)
            .map(WebPubSubHubItem.CreateWebPubSubHubModel);
    }

    static async Get(context: IActionContext, subscription: AzureSubscription, resourceGroup: string, resourceName: string, webPubSubHubName: string): Promise<WebPubSubHubModel> {
        const client = await createWebPubSubHubsClient(context, subscription);
        return WebPubSubHubItem.CreateWebPubSubHubModel(await client.webPubSubHubs.get(webPubSubHubName, resourceGroup, resourceName));
    }

    static CreateWebPubSubHubModel(webPubSubHub: WebPubSubHub): WebPubSubHubModel {
        return {
            id: nonNullProp(webPubSubHub, 'id'),
            name: nonNullProp(webPubSubHub, 'name'),
            webPubSubId: nonNullProp(webPubSubHub, 'id'),
            resourceGroup: getResourceGroupFromId(nonNullProp(webPubSubHub, 'id')),
            ...webPubSubHub,
        }
    }

    async delete(context: IActionContext & { suppressPrompt?: boolean }): Promise<void> {
        const confirmMessage: string = localize('confirmDeleteWebPubSubHub', 'Are you sure you want to delete hub "{0}"?', this.name);
        const deleteContainerApp: string = localize('deleteWebPubSubHub', 'Delete hub "{0}"', this.name);

        const wizardContext: IDeleteWebPubSubHubWizardContext = {
            activityTitle: deleteContainerApp,
            webPubSubHubNames: this.name,
            subscription: createSubscriptionContext(this.subscription),
            resourceGroupName: this.resourceGroup,
            resourceName: this.name,
            ...context,
            ...await createActivityContext()
        };

        const wizard: AzureWizard<IDeleteWebPubSubHubWizardContext> = new AzureWizard(wizardContext, {
            promptSteps: [new DeleteConfirmationStep(confirmMessage)],
            executeSteps: [new DeleteWebPubSubStep()]
        });

        if (!context.suppressPrompt) {
            await wizard.prompt();
        }

        await ext.state.showDeleting(this.webPubSubHub.id, async () => {
            await wizard.execute();
        });
        ext.state.notifyChildrenChanged(this.webPubSubHub.webPubSubId);
    }
}

export namespace treeUtils {
    export function getIconPath(iconName: string): TreeItemIconPath {
        return vscode.Uri.joinPath(getResourcesUri(), `${iconName}.svg`);
    }

    function getResourcesUri(): vscode.Uri {
        return vscode.Uri.joinPath(ext.context.extensionUri, 'resources')
    }

    export function sortById(a: TreeElementBase, b: TreeElementBase): number {
        return a.id && b.id ? a.id.localeCompare(b.id) : 0;
    }
}

export interface IDeleteWebPubSubHubWizardContext extends IActionContext, ExecuteActivityContext {
    subscription: ISubscriptionContext;
    resourceName: string;
    resourceGroupName: string;
    webPubSubHubNames: string | string[];
}

export class DeleteWebPubSubStep extends AzureWizardExecuteStep<IDeleteWebPubSubHubWizardContext> {
    public priority: number = 100;

    public async execute(context: IDeleteWebPubSubHubWizardContext, progress: vscode.Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        const hubNames: string[] = Array.isArray(context.webPubSubHubNames) ? context.webPubSubHubNames : [context.webPubSubHubNames];
        const webClient = await createWebPubSubHubsAPIClient([context, context.subscription]);

        for (const hubName of hubNames) {
            try {
                const deleting: string = localize('deletingWebPubSubHub', 'Deleting Web PubSub Hub "{0}"...', hubName);
                const deleted: string = localize('deletedWebPubSubHub', 'Deleted Web PubSub Hub "{0}".', hubName);

                progress.report({ message: deleting });
                await webClient.webPubSubHubs.beginDeleteAndWait(hubName, context.resourceGroupName, context.resourceName);

                ext.outputChannel.appendLog(deleted);
            } catch (error) {
                const pError = parseError(error);
                // a 204 indicates a success, but sdk is catching it as an exception
                // accept any 2xx reponse code
                if (Number(pError.errorType) < 200 || Number(pError.errorType) >= 300) {
                    throw error;
                }
            }
        }
    }

    public shouldExecute(context: IDeleteWebPubSubHubWizardContext): boolean {
        return !!context.webPubSubHubNames?.length;
    }
}
