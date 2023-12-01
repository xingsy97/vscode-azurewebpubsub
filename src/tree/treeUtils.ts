import { TreeElementBase, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ext } from "../../extension.bundle";


export namespace treeUtils {
    export function getIconPath(iconName: string, suffix: "svg" | "png" = "svg"): TreeItemIconPath {
        return vscode.Uri.joinPath(getResourcesUri(), `${iconName}.${suffix}`);
    }

    function getResourcesUri(): vscode.Uri {
        return vscode.Uri.joinPath(ext.context.extensionUri, 'resources');
    }

    export function sortById(a: TreeElementBase, b: TreeElementBase): number {
        return a.id && b.id ? a.id.localeCompare(b.id) : 0;
    }
}
