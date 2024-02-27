import React, {useEffect, useState} from 'react';
import "./ContactBar.css";
import {io} from "socket.io-client";

interface ContactBarProps{
    className?: string;
    onSelect: (contactName: string) => void;
}



const ContactBar: React.FC<ContactBarProps> = ({className, onSelect}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([""]);
    const [contacts, setContacts] = useState([""]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        let newContacts = [];
        newContacts.push("UserB");
        newContacts.push("UserZ");
        newContacts.push("UserY");
        newContacts.push("UserX");
        newContacts.push("UserW");
        newContacts.push("UserV");
        setContacts(newContacts);
    }, []);

    // Function to filter contacts based on user input
    // @ts-ignore
    const handleSearch = (e) => {
        const searchTerm = e.target.value;
        setSearchTerm(searchTerm);
        onSelect(searchTerm);

        // Filter contacts based on user input
        const filteredContacts = contacts.filter(contact =>
            contact.toLowerCase().startsWith(searchTerm.toLowerCase())
        );

        setSearchResults(filteredContacts);
        if(searchTerm === ""){
            setShowSuggestions(false);
        } else {
            setShowSuggestions(true);
        }
    };

    const handleSelect = (contact: React.SetStateAction<string>) => {
        setSearchTerm(contact);
        onSelect(contact.toString());
        setShowSuggestions(false);
    };

    return (
        <div className="contact-bar">
            <input
                type="text"
                placeholder="Type in the destination user..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
            />
            {showSuggestions && (
                <div className="suggestions">
                    <ul>
                        {searchResults.slice(0, 5).map(contact => (
                            <li key={contact} onClick={() => handleSelect(contact)}>
                                {contact}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ContactBar;
