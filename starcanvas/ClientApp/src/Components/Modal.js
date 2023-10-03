import React from 'react';
import './css/modal.css';

function Modal({active, handleModalClick, message, modalData}) {

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
                    <span className="close" onClick={handleModalClick}>&times;</span>
                    {modalData.properName === 'N/A' ?  <><h1>Hd: {modalData.hd}</h1> <h4>Hp: {modalData.hipparcos}, Gl: {modalData.gliese}</h4></> 
                    : <><h1>{modalData.properName}</h1> <h4>Hd: {modalData.hd}, Hp: {modalData.hipparcos}, Gl: {modalData.gliese}</h4></>}
                    
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-data">
                    <table>
                        <tbody>
                            <tr>
                                <td className='modal-row-header'>Absolute Magnitude</td>
                                <td>{modalData.absoluteMagnitude}</td>
                            </tr>
                            <tr>
                                <td className='modal-row-header'>Apparent Magnitude</td>
                                <td>{modalData.magnitude}</td>
                            </tr>
                            <tr>
                                <td className='modal-row-header'>Distance</td>
                                <td>{Math.round(modalData.distanceLy*100)/100} LY</td>
                            </tr>
                            <tr>
                                <td className='modal-row-header'>Constellation</td>
                                <td>{modalData.bayerFlamsteed}</td>
                            </tr>
                            <tr>
                                <td className='modal-row-header'>Spectrum</td>
                                <td>{modalData.spectrum}</td>
                            </tr>
                            <tr>
                                <td className='modal-row-header'>Ra/Dec</td>
                                <td>{Math.round(modalData.raRad*100)/100} Ra / {Math.round(modalData.decRad*100)/100} Dec</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </div>
        )

}


export default Modal;