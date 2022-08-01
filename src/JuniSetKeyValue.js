import React, { useState } from 'react'
import { Form, Input, Grid } from 'semantic-ui-react'
import { TxButton } from './substrate-lib/components'

export default function Main(props) {
    const [status, setStatus] = useState(null)
    const [formState, setFormState] = useState({ key: '', value: '' })

    const onChange = (_, data) =>
        setFormState(prev => ({ ...prev, [data.state]: data.value }))

    const { key, value } = formState

    return (
        <Grid.Column width={8}>
            <h1>JuniDB: Set Key Value</h1>
            <Form>
                <Form.Field>
                    <Input
                        fluid
                        label="Key"
                        type="text"
                        placeholder="data key"
                        value={key}
                        state="key"
                        onChange={onChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Input
                        fluid
                        label="Value"
                        type="text"
                        placeholder="data value to add"
                        state="value"
                        onChange={onChange}
                    />
                </Form.Field>
                <Form.Field style={{ textAlign: 'center' }}>
                    <TxButton
                        label="Submit"
                        type="SIGNED-TX"
                        setStatus={setStatus}
                        attrs={{
                            palletRpc: 'templateModule',
                            callable: 'setKeyValue',
                            inputParams: [key, value],
                            paramFields: [true, true],
                        }}
                    />
                </Form.Field>
                <div style={{ overflowWrap: 'break-word' }}>{status}</div>
            </Form>
        </Grid.Column>
    )
}
