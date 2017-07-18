import React, { Component } from 'react';
import ContainerComponent from './ContainerComponent';

const ConfirmComponent = (props) => {
    return (
        <ContainerComponent {...props}>
            <div>Follow instructions on your device.</div>
        </ContainerComponent>
    );
}

export default ConfirmComponent;
