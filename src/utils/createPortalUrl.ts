import { OpenInPortalOptions } from "@microsoft/vscode-azext-azureutils";
import { AzureSubscription } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';


export function createPortalUrl(subscription: AzureSubscription, id: string, options?: OpenInPortalOptions): vscode.Uri {
    const queryPrefix: string = (options && options.queryPrefix) ? `?${options.queryPrefix}` : '';
    const url: string = `${subscription.environment.portalUrl}/${queryPrefix}#@${subscription.tenantId}/resource${id}`;

    return vscode.Uri.parse(url);
}
