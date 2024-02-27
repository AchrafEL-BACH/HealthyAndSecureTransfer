import React, { createContext, useContext, useState } from 'react';

const KeyContext = createContext(undefined);

export const KeyProvider = ({ children }) => {
    const [sharedState, setSharedState] = useState('initial value');

    return (
        <KeyContext.Provider value={{ sharedState, setSharedState }}>
            {children}
        </KeyContext.Provider>
    );
};

export const useKeyContext = () => useContext(KeyContext);