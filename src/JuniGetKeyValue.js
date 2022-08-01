import React, {useEffect, useState} from 'react'
import {Form, Input, Grid, Feed} from 'semantic-ui-react'
import { TxButton } from './substrate-lib/components'
import {useSubstrateState} from "./substrate-lib";

// Events to be filtered from feed
const FILTERED_EVENTS = [
    'system:ExtrinsicSuccess::(phase={"applyExtrinsic":0})',
]

const eventName = ev => `${ev.section}:${ev.method}`
const eventParams = ev => JSON.stringify(ev.data)

export default function Main(props) {
    const [status, setStatus] = useState(null)
    const [formState, setFormState] = useState({ key: '' })

    const onChange = (_, data) =>
        setFormState(prev => ({ ...prev, [data.state]: data.value }))

    const { key } = formState

    const { api } = useSubstrateState()
    const [eventFeed, setEventFeed] = useState([])

    useEffect(() => {
        let unsub = null
        let keyNum = 0
        const allEvents = async () => {
            unsub = await api.query.system.events(events => {
                // loop through the Vec<EventRecord>
                events.forEach(record => {
                    // extract the phase, event and the event types
                    const { event, phase } = record

                    // show what we are busy with
                    const evHuman = event.toHuman()
                    const evName = eventName(evHuman)
                    const evParams = eventParams(evHuman)
                    const evNamePhase = `${evName}::(phase=${phase.toString()})`

                    console.log(evName);

                    if (evName === "templateModule:QueuedKeyValueToGet" || evName === "templateModule:KeyValueGot") {
                        if (FILTERED_EVENTS.includes(evNamePhase)) return

                        let summary

                        if (evName === "templateModule:QueuedKeyValueToGet")  {
                            summary = 'fetching data for key ' + key + '...'
                        } else if (evName === "templateModule:KeyValueGot") {
                            summary = 'fetched data for key ' + key + '.'
                        }

                        setEventFeed(e => [
                            {
                                key: keyNum,
                                icon: 'star',
                                summary: summary,
                                content: evParams,
                            },
                            ...e,
                        ])

                        keyNum += 1
                    }
                })
            })
        }

        allEvents()
        return () => unsub && unsub()
    }, [api.query.system])

    return (
        <Grid.Column width={8}>
            <h1>JuniDB: Get Key Value</h1>
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
                <Form.Field style={{ textAlign: 'center' }}>
                    <TxButton
                        label="Submit"
                        type="SIGNED-TX"
                        setStatus={setStatus}
                        attrs={{
                            palletRpc: 'templateModule',
                            callable: 'getKeyValue',
                            inputParams: [key],
                            paramFields: [true],
                        }}
                    />
                </Form.Field>
                <div style={{ overflowWrap: 'break-word' }}>{status}</div>
                <Feed
                    style={{ clear: 'both', overflow: 'auto', maxHeight: 200 }}
                    events={eventFeed}
                />
            </Form>
        </Grid.Column>
    )
}
