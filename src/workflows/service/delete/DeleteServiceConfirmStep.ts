/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, DialogResponses, nonNullValue, UserCancelledError } from '@microsoft/vscode-azext-utils';
import  { type IPickServiceContext } from "src/workflows/common/contexts";
import { localize, settingUtils } from "../../../utils";

export class DeleteServiceConfirmStep extends AzureWizardPromptStep<IPickServiceContext> {
    private webPubSubName: string | undefined;

    public async prompt(context: IPickServiceContext): Promise<void> {
        this.webPubSubName = context.webPubSubName;

        const deleteEnv: string = localize('confirmDeleteWebPubSub', 'Are you sure you want to delete Web PubSub "{0}"?', this.webPubSubName);

        const deleteConfirmation: string | undefined = settingUtils.getSetting('deleteConfirmation');
        if (deleteConfirmation === 'ClickButton') {
            const message: string = deleteEnv;
            await context.ui.showWarningMessage(message, { modal: true, stepName: 'confirmDelete' }, DialogResponses.deleteResponse); // no need to check result - cancel will throw error
        } else {
            const prompt: string = localize('enterToDelete', 'Enter "{0}" to delete this Web PubSub. ', this.webPubSubName);

            const result: string = await context.ui.showInputBox({
                prompt,
                validateInput: (val: string | undefined) => this.validateInput(val, prompt)
            });

            if (!this.isNameEqualToResource(result)) { // Check again just in case `validateInput` didn't prevent the input box from closing
                context.telemetry.properties.cancelStep = 'mismatchDelete';
                throw new UserCancelledError();
            }
        }
    }

    public shouldPrompt(): boolean {
        return true;
    }

    private validateInput(val: string | undefined, prompt: string): string | undefined {
        return this.isNameEqualToResource(val) ? undefined : prompt;
    }

    private isNameEqualToResource(val: string | undefined): boolean {
        return !!val && val.toLowerCase() === nonNullValue(this.webPubSubName).toLowerCase();
    }
}
