import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";

export async function helloWorld(context: IActionContext): Promise<void> {
    vscode.window.showInformationMessage("hello world!");
}
