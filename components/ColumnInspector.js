import { useEffect, useState } from 'react';
import { useStoreState } from 'react-flow-renderer';

const ColumnInspector = (props) => {

    // Create instance of store.
    const store = useStoreState((store) => store);

    const [name, setName] = useState(props.name);
    const [type, setType] = useState(props.dataType);
    const [prevNode, nextNode] = useState(null);
    
    // Whenever name or datatype changes, we update the info and push it back up to the inspector's activeNode. 
    useEffect(() => {

        if (!store.selectedElements)
            return;

        if (!props.editable || prevNode !== store.selectedElements[0])
            return;
        const newNode = JSON.parse(JSON.stringify(props.activeNode));

        newNode.data.label.props.children.props.columns[props.index].name = name;
        newNode.data.label.props.children.props.columns[props.index].dataType = type;

        props.updateNode(newNode);

    }, [name, type]);

    // When selected Node changes, the inspector changes to new node. 
    useEffect(() => {
        
        if (!store.selectedElements)
            return;
                
        nextNode(store.selectedElements[0]);

    }, [store.selectedElements])

    const dataTypes = ['integer', 'bigint', 'date', 'character varying', 'boolean'];

    return (
        <div className='container' style={{backgroundColor: `${props.editable ? '#c0dbfd' : 'transparent'}`}} onDoubleClick={props.onDoubleClick}>

            {/* Our Table component is split into two columns: the column name and it's associated Data Type.*/}

            <input type='text' value={name} className='column' className='left' onChange={(e)=>setName(e.target.value)} disabled={props.editable ? '' : 'disabled'} style={{color: `${props.editable ? '#4754bd' : '#5e6f7a'}`}} />

            <input type='text' list='types' placeholder={type} className='column' className='right' onChange={(e)=>setType(e.target.value)} disabled={props.editable ? '' : 'disabled'} style={{color: `${props.editable ? '#4754bd' : '#cccccc'}`}} />
                {/* List of data-types */}
                {/* TODO: Make this work!! Gets overwritten once a value is selected. */}
                <datalist id='types'>{dataTypes.map((datatype, i) => <option key={`datatype#${i}`} value={datatype} /> )}</datalist>

            <style jsx>{`

                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300&display=swap');

                *{
                    font-size: 12px;
                    transition: all 0s;
                    font-family: 'Inter', sans-serif;
                }

                .container{
                    display: flex;
                    justify-content: space-between;
                    padding: 8px;
                    border-top: .5px solid transparent;
                    border-bottom: .5px solid #e4eaf1;
                    flex-flow: row nowrap;

                    &:hover{
                        border-top: .5px solid #0373fc;
                        border-bottom: .5px solid #0373fc;
                    }
                    
                    &:active{
                        border-top: .5px solid #0373fc;
                        border-bottom: .5px solid #0373fc;
                    }

                    &:active > .left{
                        color: #0373fc;
                    }

                    &:active > .right{
                        color: #0373fc;
                    }
                }

                input{
                    width: 128px;
                    border: #e4eaf1;
                    background-color: transparent;
                    outline: none;

                    ::placeholder{
                        color: #cccccc;
                    }
                }

                .column{
                    flex: 25%;
                }

                .left{
                    font-weight: bold;
                    color: #5e6f7a;
                    margin-right: 32px;
                }

                .right{
                    color: #cccccc;
                }

            `}</style>

        </div>
    );
}

export default ColumnInspector;