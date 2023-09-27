import React from 'react';
import './css/modal.css';

function Modal({active, handleClick, message}) {

    let cssVisibilityControl = false; 

    if (active === true) {
        cssVisibilityControl = "modal-content-show";
    }
    else {
        cssVisibilityControl = "modal-content-hide" ;
    }

        return (
            <div className={cssVisibilityControl}>
                <div className="modal-header">
                    <span className="close" onClick={handleClick}>&times;</span> 
                    <h2>Coords</h2>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <h3>That's about it...</h3>
                </div>
            </div>
        )

    // else, return small bar which presents toggle switch

    // .modal-content-hide 
}


export default Modal;