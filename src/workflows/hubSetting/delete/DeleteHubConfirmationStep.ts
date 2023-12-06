/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, DialogResponses, nonNullValue, UserCancelledError } from '@microsoft/vscode-azext-utils';
import { localize, settingUtils } from "../../../utils";
import { IDeleteHubSettingContext } from './IDeleteHubContext';

export class DeleteHubConfirmationStep extends AzureWizardPromptStep<IDeleteHubSettingContext> {
    private hubName?: string;

    public async prompt(context: IDeleteHubSettingContext): Promise<void> {
        this.hubName = context.hubName;

        const deleteConfirmation: string | undefined = settingUtils.getSetting('deleteConfirmation');
        if (deleteConfirmation === 'ClickButton') {
            const message: string = localize('confirmDeleteHub', 'Are you sure you want to delete Hub "{0}"?', this.hubName);
            await context.ui.showWarningMessage(message, { modal: true, stepName: 'confirmDelete' }, DialogResponses.deleteResponse); // no need to check result - cancel will throw error
        } else {
            const prompt: string = localize('enterToDelete', 'Enter "{0}" to delete this hub.', this.hubName);

            const result: string = await context.ui.showInputBox({
                prompt,
                validateInput: (val: string | undefined) => this.validateInput(val, prompt)
            });

            if (!this.isNameEqualToHub(result)) { // Check again just in case `validateInput` didn't prevent the input box from closing
                context.telemetry.properties.cancelStep = 'mismatchDelete';
                throw new UserCancelledError();
            }
        }
    }

    public shouldPrompt(): boolean {
        return true;
    }

    private validateInput(val: string | undefined, prompt: string): string | undefined {
        return this.isNameEqualToHub(val) ? undefined : prompt;
    }

    private isNameEqualToHub(val: string | undefined): boolean {
        return !!val && val.toLowerCase() === nonNullValue(this.hubName).toLowerCase();
    }
}
