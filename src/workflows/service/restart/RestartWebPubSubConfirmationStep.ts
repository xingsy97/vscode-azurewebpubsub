/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, DialogResponses, nonNullValue, UserCancelledError } from '@microsoft/vscode-azext-utils';
import { settingUtils } from '../../../utils';
import { localize } from "../../../utils/localize";
import { IPickWebPubSubContext } from '../../common/IPickWebPubSubContext';

export class RestartWebPubSubConfirmationStep extends AzureWizardPromptStep<IPickWebPubSubContext> {
    private webPubSubName: string | undefined;

    public async prompt(context: IPickWebPubSubContext): Promise<void> {
        this.webPubSubName = context.webPubSubName;

        const restartConfirmation: string | undefined = settingUtils.getSetting('restartConfirmation');
        if (restartConfirmation === 'ClickButton') {
            const message: string = localize('confirmRestartWebPubSub', 'Are you sure you want to restart Web PubSub "{0}"?', this.webPubSubName);
            await context.ui.showWarningMessage(message, { modal: true, stepName: 'confirmRestart' }, DialogResponses.deleteResponse); // no need to check result - cancel will throw error
        } else {
            const prompt: string = localize('enterToRestart', 'Enter "{0}" to restart this Web PubSub. ', this.webPubSubName);

            const result: string = await context.ui.showInputBox({
                prompt,
                validateInput: (val: string | undefined) => this.validateInput(val, prompt)
            });

            if (!this.isNameEqualToResource(result)) { // Check again just in case `validateInput` didn't prevent the input box from closing
                context.telemetry.properties.cancelStep = 'mismatchRestart';
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
