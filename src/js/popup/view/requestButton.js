/* @flow */
'use strict';

import { container, showView } from './common';

export const requestButton = (data: ?Object): void => {
    showView('simple_message');


    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const div: HTMLElement = container.getElementsByClassName('message')[0];

    h3.innerHTML = 'Wait for button action...';
    div.innerHTML = `Button code: ${data}`;
    // TODO: message
}
