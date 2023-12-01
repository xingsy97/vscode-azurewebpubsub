import { Resource, WebPubSubHub, WebPubSubResource } from "@azure/arm-webpubsub";
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { nonNullProp } from "@microsoft/vscode-azext-utils";

interface ResourceModel extends Resource {
    id: string;
    name: string;
    resourceGroup: string;
}

export interface WebPubSubHubModel extends WebPubSubHub {
    id: string;
    hubName: string;
    resourceGroup: string;
    webPubSubId: string;
}

export function CreateWebPubSubHubModel(webPubSubHub: WebPubSubHub): WebPubSubHubModel {
    return {
        id: nonNullProp(webPubSubHub, 'id'),
        hubName: nonNullProp(webPubSubHub as any, 'name'),
        webPubSubId: nonNullProp(webPubSubHub, 'id'),
        resourceGroup: getResourceGroupFromId(nonNullProp(webPubSubHub, 'id')),
        ...webPubSubHub,
    };
}

// export function createAzureResourceModel<T extends Resource>(resource: T): T & ResourceModel {
//     return {
//         id: nonNullProp(resource, 'id'),
//         name: nonNullProp(resource, 'name'),
//         resourceGroup: getResourceGroupFromId(id),
//         ...resource,
//     }
// }

export type WebPubSubModel = WebPubSubResource & ResourceModel;
