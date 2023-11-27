// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// tslint:disable-next-line:no-require-imports no-implicit-dependencies
import { OpenInPortalOptions } from "@microsoft/vscode-azext-azureutils";
import { ExecuteActivityContext, IGenericTreeItemOptions, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { type AzureResourcesExtensionApiWithActivity } from "@microsoft/vscode-azext-utils/activity";
import { AppResourceFilter } from "@microsoft/vscode-azext-utils/hostapi";
import { AzureSubscription } from "@microsoft/vscode-azureresources-api";
import * as fs from "fs";
import * as path from 'path';
import * as vscode from 'vscode';
import { ConfigurationTarget, ExtensionContext, ProgressLocation, Uri, WorkspaceConfiguration, WorkspaceFolder, window, workspace } from 'vscode';
import * as nls from 'vscode-nls';
import { settingsFile, vscodeFolder } from "./constants";
import { ext } from "./extensionVariables";

let EXTENSION_PUBLISHER: string;
let EXTENSION_NAME: string;
let EXTENSION_VERSION: string;
let EXTENSION_AI_KEY: string;

export const localize: nls.LocalizeFunc = nls.loadMessageBundle();

export const springAppsFilter: AppResourceFilter = {
    type: 'microsoft.appplatform/spring'
};

export function wait(delay: number): Promise<void> {
    return new Promise(res => setTimeout(res, delay));
}

export interface GenericItemOptions extends IGenericTreeItemOptions {
    commandArgs?: unknown[];
}

export async function runInBackground(doing: string, done: string | null, task: () => Promise<void>): Promise<void> {
    await window.withProgress({ location: ProgressLocation.Notification, title: doing }, async (): Promise<void> => {
        await task();
        done && void window.showInformationMessage(done);
    });
}

/**
 * Retrieves a property by name from an object and checks that it's not null and not undefined.  It is strongly typed
 * for the property and will give a compile error if the given name is not a property of the source.
 */
export function nonNullProp<TSource, TKey extends keyof TSource>(source: TSource, name: TKey): NonNullable<TSource[TKey]> {
    const value: NonNullable<TSource[TKey]> = <NonNullable<TSource[TKey]>>source[name];
    return nonNullValue(value, <string>name);
}

/**
 * Validates that a given value is not null and not undefined.
 */
export function nonNullValue<T>(value: T | undefined, propertyNameOrMessage?: string): T {
    if (value === null || value === undefined) {
        throw new Error(
            // tslint:disable-next-line:prefer-template
            'Internal error: Expected value to be neither null nor undefined'
            + (propertyNameOrMessage ? `: ${propertyNameOrMessage}` : ''));
    }

    return value;
}

export function getThemedIconPath(iconName: string): TreeItemIconPath {
    const resources: string = ext.context.asAbsolutePath('resources');
    return {
        light: path.join(resources, 'light', `${iconName}.svg`),
        dark: path.join(resources, 'dark', `${iconName}.svg`)
    };
}

export function showError(commandName: string, error: Error): void {
    void window.showErrorMessage(`Command "${commandName}" fails. ${error.message}`);
}

export function createPortalUrl(subscription: AzureSubscription, id: string, options?: OpenInPortalOptions): vscode.Uri {
    const queryPrefix: string = (options && options.queryPrefix) ? `?${options.queryPrefix}` : '';
    const url: string = `${subscription.environment.portalUrl}/${queryPrefix}#@${subscription.tenantId}/resource${id}`;

    return vscode.Uri.parse(url);
}

export async function loadPackageInfo(context: ExtensionContext): Promise<void> {
    const raw = await fs.promises.readFile(context.asAbsolutePath("./package.json"), { encoding: 'utf-8' });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { publisher, name, version, aiKey } = JSON.parse(raw);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    EXTENSION_AI_KEY = aiKey;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    EXTENSION_PUBLISHER = publisher;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    EXTENSION_NAME = name;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    EXTENSION_VERSION = version;
}

export function getExtensionId(): string {
    return `${EXTENSION_PUBLISHER}.${EXTENSION_NAME}`;
}

export function getExtensionVersion(): string {
    return EXTENSION_VERSION;
}

export function getAiKey(): string {
    return EXTENSION_AI_KEY;
}

export async function createActivityContext(): Promise<ExecuteActivityContext> {
    return {
        registerActivity: async (activity) => (ext.rgApiV2 as AzureResourcesExtensionApiWithActivity).activity.registerActivity(activity),
        suppressNotification: await settingUtils.getSetting('suppressActivityNotifications', undefined, 'azureResourceGroups'),
    };
}

export namespace settingUtils {
    /**
     * Directly updates one of the user's `Global` configuration settings.
     * @param key The key of the setting to update
     * @param value The value of the setting to update
     * @param prefix The optional extension prefix. Uses ext.prefix `containerApps` unless otherwise specified
     */
    export async function updateGlobalSetting<T = string>(key: string, value: T, prefix: string = ext.prefix): Promise<void> {
        const projectConfiguration: vscode.WorkspaceConfiguration = workspace.getConfiguration(prefix);
        await projectConfiguration.update(key, value, vscode.ConfigurationTarget.Global);
    }

    /**
     * Directly updates one of the user's `Workspace` or `WorkspaceFolder` settings.
     * @param key The key of the setting to update
     * @param value The value of the setting to update
     * @param fsPath The path of the workspace configuration settings
     * @param targetSetting The optional workspace setting to target. Uses the `Workspace` configuration target unless otherwise specified
     * @param prefix The optional extension prefix. Uses ext.prefix `containerApps` unless otherwise specified
     */
    export async function updateWorkspaceSetting<T = string>(
        key: string,
        value: T,
        fsPath: string,
        targetSetting: ConfigurationTarget.Workspace | ConfigurationTarget.WorkspaceFolder = ConfigurationTarget.Workspace,
        prefix: string = ext.prefix
    ): Promise<void> {
        const projectConfiguration: WorkspaceConfiguration = workspace.getConfiguration(prefix, Uri.file(fsPath));
        await projectConfiguration.update(key, value, targetSetting);
    }

    /**
     * Directly retrieves one of the user's `Global` configuration settings.
     * @param key The key of the setting to retrieve
     * @param prefix The optional extension prefix. Uses ext.prefix `containerApps` unless otherwise specified
     */
    export function getGlobalSetting<T>(key: string, prefix: string = ext.prefix): T | undefined {
        const projectConfiguration: WorkspaceConfiguration = workspace.getConfiguration(prefix);
        const result: { globalValue?: T, defaultValue?: T } | undefined = projectConfiguration.inspect<T>(key);
        return result?.globalValue === undefined ? result?.defaultValue : result?.globalValue;
    }

    /**
     * Iteratively retrieves one of the user's workspace settings - sequentially checking for a defined value starting from the `WorkspaceFolder` up to the provided target configuration limit.
     * @param key The key of the setting to retrieve
     * @param fsPath The optional path of the workspace configuration settings
     * @param targetLimit The optional target configuration limit (inclusive). Uses the `Workspace` configuration target unless otherwise specified
     * @param prefix The optional extension prefix. Uses ext.prefix `containerApps` unless otherwise specified
     */
    export function getWorkspaceSetting<T>(
        key: string,
        fsPath?: string,
        targetLimit: ConfigurationTarget.Workspace | ConfigurationTarget.WorkspaceFolder = ConfigurationTarget.Workspace,
        prefix: string = ext.prefix
    ): T | undefined {
        const projectConfiguration: WorkspaceConfiguration = workspace.getConfiguration(prefix, fsPath ? Uri.file(fsPath) : undefined);

        const configurationLevel: ConfigurationTarget | undefined = getLowestConfigurationLevel(projectConfiguration, key);
        if (!configurationLevel || (configurationLevel && (configurationLevel < targetLimit))) {
            return undefined;
        }

        return projectConfiguration.get<T>(key);
    }

    /**
     * Iteratively retrieves one of the user's settings - sequentially checking for a defined value starting from the `WorkspaceFolder` up to the `Global` configuration target.
     * @param key The key of the setting to retrieve
     * @param fsPath The optional path of the workspace configuration settings
     * @param prefix The optional extension prefix. Uses ext.prefix `containerApps` unless otherwise specified
     */
    export function getSetting<T>(key: string, fsPath?: string, prefix: string = ext.prefix): T | undefined {
        const projectConfiguration: WorkspaceConfiguration = workspace.getConfiguration(prefix, fsPath ? Uri.file(fsPath) : undefined);
        return projectConfiguration.get<T>(key);
    }

    /**
     * Searches through all open folders and gets the current workspace setting (as long as there are no conflicts)
     * Uses ext.prefix 'containerApps' unless otherwise specified
     */
    export function getWorkspaceSettingFromAnyFolder(key: string, prefix: string = ext.prefix): string | undefined {
        if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
            let result: string | undefined;
            for (const folder of workspace.workspaceFolders) {
                const projectConfiguration: WorkspaceConfiguration = workspace.getConfiguration(prefix, folder.uri);
                const folderResult: string | undefined = projectConfiguration.get<string>(key);
                if (!result) {
                    result = folderResult;
                } else if (folderResult && result !== folderResult) {
                    return undefined;
                }
            }
            return result;
        } else {
            return getGlobalSetting(key, prefix);
        }
    }

    export function getDefaultRootWorkspaceSettingsPath(rootWorkspaceFolder: WorkspaceFolder): string {
        return path.join(rootWorkspaceFolder.uri.path, vscodeFolder, settingsFile);
    }

    function getLowestConfigurationLevel(projectConfiguration: WorkspaceConfiguration, key: string): ConfigurationTarget | undefined {
        const configuration = projectConfiguration.inspect(key);

        let lowestLevelConfiguration: ConfigurationTarget | undefined;
        if (configuration?.workspaceFolderValue !== undefined) {
            lowestLevelConfiguration = ConfigurationTarget.WorkspaceFolder;
        } else if (configuration?.workspaceValue !== undefined) {
            lowestLevelConfiguration = ConfigurationTarget.Workspace;
        } else if (configuration?.globalValue !== undefined) {
            lowestLevelConfiguration = ConfigurationTarget.Global;
        }

        return lowestLevelConfiguration;
    }
}
