import React from 'react';
import "./NotificationContainer.css";

function NotificationContainer() {
    return (
        <div className="notification-container">
            <div style={{display:"flex", flexDirection:"column"}}>
                <p style={{fontSize:"3vh", height:"10%", borderBottom:"1px black solid", borderTop:"1px black solid", margin: "0px 10px"}}>
                    Notifications
                </p>
                <div style={{flexGrow:"1"}}>

                </div>
            </div>
        </div>
    );
}

export default NotificationContainer;