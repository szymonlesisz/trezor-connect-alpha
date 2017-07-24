import { h, Component } from 'preact';
import ContainerComponent from './ContainerComponent';

const AlertComponent = ({ children, ...props }) => (
    <ContainerComponent {...props}>
        <div>{ props.alertType }</div>
    </ContainerComponent>
)

export default AlertComponent;
