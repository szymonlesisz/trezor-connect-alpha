const styles = {

    background: {
        position: 'fixed',
        display: 'flex',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        padding: 10,
        zIndex: 2017,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        WebkitTapHighlightColor: 'transparent'
    },

    container: {
        margin: 'auto',
        padding: '20px',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        maxWidth: '100%',
        borderRadius: '6px',
        boxSizing: 'border-box',
        boxShadow: '0px 16px 16px 8px #888888',
        width: '500px',
        minHeight: '350px',
        backgroundColor: '#ffffff',
        //backgroundColor: 'linear-gradient(0deg, #ffffff, #fcfcfc)',
        //textAlign: 'center',
	    color: '#333333',
	    font: '400 18px/1.4 Roboto, Helvetica, Arial, sans-serif'
    },

    header: {},

    logo: {
        width: '126px',
        height: '35px',
        float: 'left',
        verticalAlign: 'top'
    },

    headerRight: {
        float: 'right',
        textAlign: 'right'
    },

    icon: {
        height: '35px',
        display: 'none'
    },

    icon_img: {
        width: 'auto',
        height: '100%'
    },

    operation: {

    },

    origin: {
        fontSize: '14px',
	    color: '#999999',
    },


    body: {
        clear: 'both'
    },

    loader: {
        textAlign: 'center',
        paddingTop: '40px'
    },






    fixed: {
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000
    },

    background2: {
        //display: 'table-cell',
        //verticalAlign: 'middle',
        //textAlign: 'center',
        //background: 'rgba(0, 0, 0, 0.1)'
    },



    containerA: {
        textAlign: 'left',
        margin: '0 auto',
        width: '600px',
        height: '300px',
        display: 'inline-block',
        background: '#FFF',
        borderRadius: 4,
        boxShadow: '0px 16px 16px 8px #888888',
        padding: '14px'
    },

    containerWindow: {
        display: 'block',
        width: '100%',
        height: '100%',
        border: '1px solid blue'
    },


};
export default styles;
