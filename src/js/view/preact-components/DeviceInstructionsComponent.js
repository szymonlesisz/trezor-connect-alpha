import { h, Component } from 'preact';
import ContainerComponent from './ContainerComponent';

const DeviceInstructionsComponent = ({ children, ...props }) => (
    <ContainerComponent {...props}>
        <div>Follow instructions on your device.</div>
    </ContainerComponent>
)

export default DeviceInstructionsComponent;
