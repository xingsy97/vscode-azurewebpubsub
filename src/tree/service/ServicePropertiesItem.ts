import { KnownWebPubSubSkuTier, ProvisioningState } from "@azure/arm-webpubsub";
import { TreeElementBase, TreeItemIconPath, createContextValue, createGenericElement } from "@microsoft/vscode-azext-utils";
import { ViewPropertiesModel } from "@microsoft/vscode-azureresources-api";
import * as vscode from 'vscode';
import { ThemeIcon } from "vscode";
import { localize } from "../../utils";
import { WebPubSubModel } from "../models";


export class ServicePropertiesItem implements TreeElementBase {
    static readonly contextValue: string = 'servicePropertiesItem';
    static readonly contextValueRegExp: RegExp = new RegExp(ServicePropertiesItem.contextValue);

    constructor(public readonly webPubSub: WebPubSubModel) { }

    viewProperties: ViewPropertiesModel = {
        data: this.webPubSub,
        label: `Properties`
    };

    private get contextValue(): string {
        const values: string[] = [];
        values.push(ServicePropertiesItem.contextValue);
        return createContextValue(values);
    }

    private getIconPathForProvisoningState(provisioningState?: ProvisioningState): TreeItemIconPath {
        switch (provisioningState) {
            case "Running": case "Creating": case "Updating": case "Deleting": case "Moving": return new ThemeIcon("refresh"); break;
            case "Succeeded": return new ThemeIcon("check"); break;
            case "Failed": return new ThemeIcon("error"); break;
            case "Canceled": return new ThemeIcon("close"); break;
            case "Unknown": return new ThemeIcon("question"); break;
            default: return new ThemeIcon("error"); break;
        }
    }

    async getChildren(): Promise<TreeElementBase[]> {
        const childs: TreeElementBase[] = [];
        // childs.push(createGenericElement({
        //     label: localize('serviceKind', 'Kind'),
        //     description: this.webPubSub.kind,
        //     contextValue: "serviceKind",
        //     iconPath: new ThemeIcon("three-bars")
        // }));
        childs.push(createGenericElement({
            label: localize('serviceLocation', 'Location'),
            description: this.webPubSub.location,
            contextValue: "serviceLocation",
            iconPath: new ThemeIcon("location")
        }));
        // childs.push(createGenericElement({
        //     label: localize('serviceDataPlaneStatus', 'Data Plane State'),
        //     description: this.webPubSub.resourceStopped === "true" ? "Shutdown" : "Started",
        //     contextValue: "serviceStatus",
        //     iconPath: new ThemeIcon(this.webPubSub.resourceStopped === "true" ? "error" : "check")
        // }));
        childs.push(createGenericElement({
            label: localize('serviceProvisioningState', 'Provisioning State'),
            description: this.webPubSub.provisioningState,
            contextValue: "serviceStatus",
            iconPath: this.getIconPathForProvisoningState(this.webPubSub.provisioningState)
        }));
        // childs.push(createGenericElement({
        //     label: localize('serviceAadAuth', 'AAD Auth'),
        //     description: this.webPubSub.disableAadAuth ? "Disabled" : "Enabled",
        //     contextValue: "servicePropertyDisableAadAuth",
        //     iconPath: new ThemeIcon(this.webPubSub.disableAadAuth ? "error" : "check"),
        // }));
        childs.push(createGenericElement({
            label: localize('serviceLocalAuth', 'Local Auth'),
            description: this.webPubSub.disableLocalAuth ? "Disabled" : "Enabled",
            contextValue: "servicePropertyDisableLocalAuth",
            iconPath: new ThemeIcon(this.webPubSub.disableLocalAuth ? "error" : "check"),
        }));
        childs.push(createGenericElement({
            label: localize('servicePublicNetworkAccess', 'Public Network Access'),
            description: this.webPubSub.publicNetworkAccess ? "Allow" : "Deny",
            contextValue: "servicePropertyPublicNetworkAccess",
            iconPath: new ThemeIcon(this.webPubSub.publicNetworkAccess ? "check" : "error"),
        }));

        let tlsNodeDesc: string;
        if (this.webPubSub.sku?.tier !== KnownWebPubSubSkuTier.Free) {
            if (this.webPubSub.tls !== undefined) {
                tlsNodeDesc = this.webPubSub.tls.clientCertEnabled ? "Client Cert Enabled" : "Client Cert Disabled";
            }
            else {
                tlsNodeDesc = "Unconfigured";
            }
        }
        else {
            tlsNodeDesc = `Not Supported for ${this.webPubSub.sku?.tier} Tier`;
        }

        childs.push(createGenericElement({
            label: localize('serviceTls', 'TLS'),
            description: tlsNodeDesc,
            contextValue: "serviceTls",
            iconPath: new ThemeIcon(tlsNodeDesc.includes("Enabled") ? "check" : "error"),
        }));

        childs.push(createGenericElement({
            label: localize('serviceVersion', 'Version'),
            description: this.webPubSub.version,
            contextValue: "serviceVersion",
            iconPath: new ThemeIcon("versions"),
        }));

        return childs;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: `Properties`,
            iconPath: new ThemeIcon("symbol-property"),
            contextValue: this.contextValue,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
        };
    }
}
