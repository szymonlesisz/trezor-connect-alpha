import { h, Component } from 'preact';
import ContainerComponent from './ContainerComponent';

class XPubComponent extends Component {

    constructor(props) {
        super(props);
    }

    keyboardHandler(event){
        event.preventDefault();
        switch(event.keyCode){
            // action
            case 8 :
                // backspace
                this.cancel();
                break;
            case 13 :
                // enter,
                this.submit();
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
        this.props.callback(true);
    }

    cancel() {
        this.props.callback(false);
    }

    render(props) {
        return (
            <ContainerComponent {...props}>
                <p className="alert_heading">
                    Export public key for<br/>
                    <strong>{ props.xpubkey }</strong>?
                </p>
                <div>
                    <button type="button" onClick={ () => { this.submit(); } }>
                        Export
                    </button>
                    <button type="button" onClick={ () => { this.cancel(); } }>
                        Cancel
                    </button>
                </div>
            </ContainerComponent>
        );
    }
}

export default XPubComponent;
