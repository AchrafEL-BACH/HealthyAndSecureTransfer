import React, {useRef, useState} from 'react';
import './TransferContainer.css';
import TransferTool from "./TransferTool";
import ContactBar from "./ContactBar";

const TransferContainer = () => {
    const [selectedContact, setSelectedContact] = useState('');
    const contactRef: React.MutableRefObject<string> = useRef("");

    const handleContactSelect = (contactName: string) => {
        setSelectedContact(contactName);
        contactRef.current = contactName;
    };

    return (
        <div className="transfer-container">
            <div className="flex-container">
                <ContactBar className={"top"} onSelect={handleContactSelect}/>
                <TransferTool className={"middle"} contactName={contactRef.current}/>
                <div className={"bottom"}>
                    <button id="transfer">Initiate transfer</button>
                </div>
            </div>
        </div>
    );
};

export default TransferContainer;