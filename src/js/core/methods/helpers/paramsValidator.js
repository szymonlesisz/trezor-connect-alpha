/* @flow */
'use strict';

type Param = {
    name: string;
    type?: string;
    obligatory?: true;
}

export const validateParams = (values: Object, fields: Array<Param>) => {

    fields.forEach(field => {
        if (values.hasOwnProperty(field.name)) {
            if (field.type && typeof values[field.name] !== field.type) {
                // invalid type
            }
        } else if (field.obligatory) {
            // not found
        }
    });
}
