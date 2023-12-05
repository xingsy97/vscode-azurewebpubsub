import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";

export async function helloWorld(context: IActionContext): Promise<void> {
    vscode.window.showInformationMessage(
        "hello!!!!!",
        ...["b1", "b2", "Ignore"]
    ).then((selection) => {
        const selectedItem = selection as string;
        if (selectedItem !== "Ignore") {
            vscode.window.showInformationMessage("You have selected " + selectedItem as string);
        }
    });
}
