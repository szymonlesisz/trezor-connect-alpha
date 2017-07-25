import { h, Component } from 'preact';
import ContainerComponent from './ContainerComponent';

class PinComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pin: ''
        };
    }

    add(char: Number){
        let pin = this.state.pin + char;
        this.setState({ pin: pin });
    }

    keyboardHandler(event){
        event.preventDefault();
        switch(event.keyCode){
            // action
            case 8 :
                // backspace
                let pin = this.state.pin;
                if(pin.length > 0)
                    pin = pin.substring(0, pin.length - 1);
                    this.setState({ pin: pin });
                break;
            case 13 :
                // enter,
                this.submit();
                break;
            // numeric and numpad
            case 49 :
            case 97 :
                this.add(1);
                break;
            case 50 :
            case 98 :
                this.add(2);
                break;
            case 51 :
            case 99 :
                this.add(3);
                break;
            case 52 :
            case 100 :
                this.add(4);
                break;
            case 53 :
            case 101 :
                this.add(5);
                break;
            case 54 :
            case 102 :
                this.add(6);
                break;
            case 55 :
            case 103 :
                this.add(7);
                break;
            case 56 :
            case 104 :
                this.add(8);
                break;
            case 57 :
            case 105 :
                this.add(9);
                break;
        }
    }

    componentDidMount(){
        // PopupWindow has different "window" object than PopupLayer
        // that's why we need to access it thru DOM Element - Preact base
        let doc = this.base.ownerDocument;
        let win = doc.defaultView || doc.parentWindow;

        this.keyboardHandler = this.keyboardHandler.bind(this);
        win.addEventListener('keydown', this.keyboardHandler);
    }

    componentWillUnmount() {
        let doc = this.base.ownerDocument;
        let win = doc.defaultView || doc.parentWindow;
        win.removeEventListener('keydown', this.keyboardHandler);
    }

    submit() {
        this.props.showLoader();
        this.props.callback(null, this.state.pin);
    }

    render(props) {
        return (
            <ContainerComponent {...props}>
                <div id="pin_header">Please enter your PIN.</div>
                <div id="pin_subheader">Look at the device for number positions.</div>
                <div>
                    <button type="button" onClick={ () => { this.add(7); } }>&#8226;</button>
                    <button type="button" onClick={ () => { this.add(8); } }>&#8226;</button>
                    <button type="button" onClick={ () => { this.add(9); } }>&#8226;</button>
                </div>
                <div>
                    <button type="button" onClick={ () => { this.add(4); } }>&#8226;</button>
                    <button type="button" onClick={ () => { this.add(5); } }>&#8226;</button>
                    <button type="button" onClick={ () => { this.add(6); } }>&#8226;</button>
                </div>
                <div>
                    <button type="button" onClick={ () => { this.add(1); } }>&#8226;</button>
                    <button type="button" onClick={ () => { this.add(2); } }>&#8226;</button>
                    <button type="button" onClick={ () => { this.add(3); } }>&#8226;</button>
                </div>
                <button onClick={ () => { this.submit(); } }>CONFIRM</button>
                <div>{ this.state.pin }</div>
                <div id="pin_input_row">
                    <input type="password" id="pin" name="pin" autocomplete="off" maxlength="9" value={ this.state.pin } disabled />
                    <button type="button" id="pin_backspace" onClick={ () => { this.submit(); } }>&#9003;</button>
                </div>
                <div id="pin_enter"><button type="button" onClick={ () => { this.submit(); } }>Enter</button></div>
            </ContainerComponent>
        );
    }
}

export default PinComponent;
