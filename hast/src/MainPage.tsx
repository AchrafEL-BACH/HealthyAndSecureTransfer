import React, {useEffect} from 'react';
import Headbar from './Headbar'
import TransferContainer from "./TransferContainer";
import NewDocumentContainer from "./NewDocumentContainer";
import NotificationContainer from "./NotificationContainer";
import {KeyProvider} from "./KeyContext";

function MainPage() {

    return (
        <div className="MainPage">
            <Headbar/>
            <div style={{marginTop:"100px"}}>
                <h1>Bienvenue {sessionStorage.getItem("name")} sur HAST</h1>
            </div>
            <KeyProvider>
                <TransferContainer/>
                <NewDocumentContainer/>
                {/*<NotificationContainer/>*/}
            </KeyProvider>
        </div>
    );
}

export default MainPage;